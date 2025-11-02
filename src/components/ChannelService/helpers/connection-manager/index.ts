import { TestChannelConnection } from "../test-channel-connection";
import { type Channel, type Options } from "../../types";
import {
  INITIAL_CHANNEL_ERROR_COUNT,
  CHANNEL_MAX_PRIORITY,
  CHANNEL_MIN_PRIORITY,
  ChannelStatus,
} from "../../constants";
import type { Intervals, UpdateInfo } from "./types";
import { ConnectionEventEmitter } from "../event-emitter";
import { ConnectionLogger } from "../logger";
import {
  ChannelSwitchReason,
  ConnectionEventType,
} from "../event-emitter/constants";

export class ConnectionManager {
  private readonly options: Options;
  private channels: Channel[];

  private currentChannel: Channel | null = null;
  private previousChannel: Channel | null = null;

  private intervals: Intervals | null = null;

  private isTestingConnection = false;
  private isRecovering = false;
  private autoRecoveryTimeout: NodeJS.Timeout | null = null;

  private readonly testChannelConnection = new TestChannelConnection();
  private readonly eventEmitter = new ConnectionEventEmitter();
  private readonly logger = new ConnectionLogger();

  constructor(channels: Channel[], options: Options) {
    this.channels = channels;
    this.options = options;

    this.eventEmitter.on(ConnectionEventType.ChannelSwitch, (data) =>
      this.logger.logConnectionEvent(ConnectionEventType.ChannelSwitch, data),
    );
    this.eventEmitter.on(ConnectionEventType.ChannelFailed, (data) =>
      this.logger.logConnectionEvent(ConnectionEventType.ChannelFailed, data),
    );
    this.eventEmitter.on(ConnectionEventType.ChannelRecovered, (data) =>
      this.logger.logConnectionEvent(
        ConnectionEventType.ChannelRecovered,
        data,
      ),
    );
    this.eventEmitter.on(ConnectionEventType.AllChannelsFailed, (data) =>
      this.logger.logConnectionEvent(
        ConnectionEventType.AllChannelsFailed,
        data,
      ),
    );
    this.eventEmitter.on(ConnectionEventType.ConnectionRestored, (data) =>
      this.logger.logConnectionEvent(
        ConnectionEventType.ConnectionRestored,
        data,
      ),
    );
  }

  public start(): void {
    if (!this.currentChannel) {
      this.switchChannel();
    }

    const checkInterval = setInterval(() => {
      const isReady = Boolean(!this.isTestingConnection && this.currentChannel);

      if (isReady) {
        this.checkChannel(this.currentChannel!);
      }
    }, this.options.checkIntervalTime);

    const retryInterval = setInterval(() => {
      if (!this.isTestingConnection) {
        this.retryUnavailableChannels();
      }
    }, this.options.retryIntervalTime);

    this.intervals = { checkInterval, retryInterval };
  }

  private async checkChannel(channel: Channel): Promise<void> {
    try {
      this.isTestingConnection = true;

      const isAlive = await this.testChannelConnection.test(channel);

      if (isAlive) {
        if (channel.id === this.currentChannel?.id) {
          const info: UpdateInfo = {
            status: ChannelStatus.Connected,
            errorCount: INITIAL_CHANNEL_ERROR_COUNT,
          };

          this.updateChannelInfo(channel.id, info);
        } else {
          const info: UpdateInfo = {
            status: ChannelStatus.Idle,
            errorCount: INITIAL_CHANNEL_ERROR_COUNT,
          };

          this.updateChannelInfo(channel.id, info);
        }
      } else {
        const info: UpdateInfo = {
          status: ChannelStatus.Unavailable,
          errorCount: channel.errorCount + 1,
        };

        this.updateChannelInfo(channel.id, info);
        this.eventEmitter.emit(ConnectionEventType.ChannelFailed, {
          channel: { ...channel, ...info },
          errorCount: info.errorCount,
          timestamp: Date.now(),
        });

        if (channel.id === this.currentChannel?.id) {
          this.switchChannel();
        }
      }
    } catch {
      const info: UpdateInfo = {
        status: ChannelStatus.Unavailable,
        errorCount: channel.errorCount + 1,
      };

      this.updateChannelInfo(channel.id, info);

      if (channel.id === this.currentChannel?.id) {
        this.switchChannel();
      }
    } finally {
      this.isTestingConnection = false;
    }
  }

  private calculatePriority(
    errorCount: Channel["errorCount"],
  ): Channel["priority"] {
    const maxValue = CHANNEL_MAX_PRIORITY - errorCount;
    const result = Math.max(CHANNEL_MIN_PRIORITY, maxValue);

    return result;
  }

  private getAvailableChannel(): Channel | null {
    const filteredChannels = this.channels.filter(
      (item) => item.status === ChannelStatus.Idle,
    );
    const sortedChannels = filteredChannels.toSorted(
      (first, second) => second.priority - first.priority,
    );
    const availableChannels = sortedChannels.filter(
      (item) => item.priority !== CHANNEL_MIN_PRIORITY,
    );
    const topPriorityChannel = availableChannels.at(0);
    const result = topPriorityChannel ?? null;

    return result;
  }

  private switchChannel(): void {
    if (this.currentChannel) {
      this.updateChannelStatus(this.currentChannel.id, ChannelStatus.Idle);
      this.previousChannel = this.currentChannel;
    }

    const availableChannel = this.getAvailableChannel();

    if (availableChannel) {
      this.currentChannel = availableChannel;
      this.updateChannelStatus(availableChannel.id, ChannelStatus.Connected);

      this.eventEmitter.emit(ConnectionEventType.ChannelSwitch, {
        from: this.previousChannel,
        to: availableChannel,
        timestamp: Date.now(),
        reason: this.previousChannel
          ? ChannelSwitchReason.Failure
          : ChannelSwitchReason.Initial,
      });

      if (!this.previousChannel) {
        this.eventEmitter.emit(ConnectionEventType.ConnectionRestored, {
          channel: availableChannel,
          timestamp: Date.now(),
        });
      }

      this.options.onError("");
      this.scheduleAutoRecovery();
    } else {
      this.currentChannel = null;

      this.eventEmitter.emit(ConnectionEventType.AllChannelsFailed, {
        channelCount: this.channels.length,
        timestamp: Date.now(),
      });

      this.options.onError("Нет доступных каналов связи");
    }
  }

  private async retryUnavailableChannels(): Promise<void> {
    this.isTestingConnection = true;
    const unavailableChannels = this.channels.filter(
      (item) => item.status === ChannelStatus.Unavailable,
    );
    const checkedChannels = unavailableChannels.map(async (item) => {
      const isAlive = await this.testChannelConnection.test(item);

      if (isAlive) {
        const previousErrorCount = item.errorCount;
        const info: UpdateInfo = {
          status: ChannelStatus.Idle,
          errorCount: INITIAL_CHANNEL_ERROR_COUNT,
        };

        this.updateChannelInfo(item.id, info);

        if (previousErrorCount > 0) {
          this.eventEmitter.emit(ConnectionEventType.ChannelRecovered, {
            channel: { ...item, ...info },
            previousErrorCount,
            timestamp: Date.now(),
          });
        }
      } else {
        const info: UpdateInfo = {
          status: item.status,
          errorCount: item.errorCount + 1,
        };

        this.updateChannelInfo(item.id, info);
      }
    });

    await Promise.all(checkedChannels);
    this.isTestingConnection = false;
  }

  private updateChannelInfo(channelId: Channel["id"], info: UpdateInfo): void {
    const updatedChannels = this.channels.map((item): Channel => {
      if (item.id === channelId) {
        const lastChecked = Date.now();
        const priority = this.calculatePriority(info.errorCount);

        return { ...item, ...info, lastChecked, priority };
      }

      return item;
    });

    this.channels = updatedChannels;
    this.options.onStatusChange(this.channels);
  }

  private updateChannelStatus(
    channelId: Channel["id"],
    status: Channel["status"],
  ): void {
    const updatedChannels = this.channels.map((item): Channel => {
      if (item.id === channelId) {
        const lastChecked = Date.now();
        const lastSuccessful =
          status === ChannelStatus.Connected
            ? lastChecked
            : item.lastSuccessful;

        return { ...item, status, lastChecked, lastSuccessful };
      }

      return item;
    });

    this.channels = updatedChannels;
    this.options.onStatusChange(this.channels);
  }

  private scheduleAutoRecovery(): void {
    if (this.autoRecoveryTimeout) {
      clearTimeout(this.autoRecoveryTimeout);
    }

    this.autoRecoveryTimeout = setTimeout(() => {
      this.attemptRecoveryToPreferredChannel();
    }, this.options.autoRecoveryDelay);
  }

  private async attemptRecoveryToPreferredChannel(): Promise<void> {
    if (!this.currentChannel || this.isRecovering) return;

    const filteredChannels = this.channels.filter(
      (item) => item.status === ChannelStatus.Idle,
    );
    const sortedChannels = filteredChannels.sort((first, second) => {
      if (second.priority !== first.priority) {
        return second.priority - first.priority;
      } else {
        const compatibleSecondLastSuccessful = second.lastSuccessful || 0;
        const compatibleFirstLastSuccessful = first.lastSuccessful || 0;

        return compatibleSecondLastSuccessful - compatibleFirstLastSuccessful;
      }
    });
    const preferredChannel = sortedChannels[0];
    const isReady =
      preferredChannel &&
      preferredChannel.priority > this.currentChannel.priority;

    if (isReady) {
      this.isRecovering = true;

      this.logger.info(
        `Попытка восстановления к приоритетному каналу: ${preferredChannel.name}`,
      );

      try {
        const isAlive = await this.testChannelConnection.test(preferredChannel);

        if (
          isAlive &&
          preferredChannel.priority > (this.currentChannel?.priority || 0)
        ) {
          this.previousChannel = this.currentChannel;
          this.currentChannel = preferredChannel;

          if (this.previousChannel) {
            this.updateChannelStatus(
              this.previousChannel.id,
              ChannelStatus.Idle,
            );
          }
          this.updateChannelStatus(
            preferredChannel.id,
            ChannelStatus.Connected,
          );

          this.eventEmitter.emit(ConnectionEventType.ChannelSwitch, {
            from: this.previousChannel,
            to: preferredChannel,
            timestamp: Date.now(),
            reason: ChannelSwitchReason.Recovery,
          });

          this.options.onError("");
        }
      } catch {
        const info: UpdateInfo = {
          status: ChannelStatus.Unavailable,
          errorCount: preferredChannel.errorCount + 1,
        };

        this.updateChannelInfo(preferredChannel.id, info);
      } finally {
        this.isRecovering = false;
      }
    }
  }

  public stop(): void {
    if (this.intervals?.checkInterval) {
      clearInterval(this.intervals.checkInterval);
    }
    if (this.intervals?.retryInterval) {
      clearInterval(this.intervals.retryInterval);
    }
    if (this.autoRecoveryTimeout) {
      clearTimeout(this.autoRecoveryTimeout);
    }

    this.intervals = null;
    this.autoRecoveryTimeout = null;
    this.eventEmitter.removeAllListeners();
  }

  public getLogger(): ConnectionLogger {
    return this.logger;
  }

  public getEventEmitter(): ConnectionEventEmitter {
    return this.eventEmitter;
  }
}
