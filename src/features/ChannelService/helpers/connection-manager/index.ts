import { TestChannelConnection } from "../test-channel-connection";
import { type Channel, type Options } from "../../types";
import {
  INITIAL_CHANNEL_ERROR_COUNT,
  CHANNEL_MAX_PRIORITY,
  CHANNEL_MIN_PRIORITY,
  ChannelStatus,
} from "../../constants";
import type { Intervals, UpdateInfo } from "./types";

export class ConnectionManager {
  private channels: Channel[];
  private readonly options: Options;

  private currentChannel: Channel | null = null;
  private intervals: Intervals | null = null;
  private readonly testChannelConnection = new TestChannelConnection();
  private isTestingConnection = false;

  constructor(channels: Channel[], options: Options) {
    this.channels = channels;
    this.options = options;
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

  public stop(): void {
    if (this.intervals?.checkInterval) {
      clearInterval(this.intervals.checkInterval);
    }
    if (this.intervals?.retryInterval) {
      clearInterval(this.intervals.retryInterval);
    }

    this.intervals = null;
  }

  private async checkChannel(channel: Channel): Promise<void> {
    try {
      this.isTestingConnection = true;

      const isAlive = await this.testChannelConnection.test(channel);
      const info: UpdateInfo = {
        status: isAlive ? ChannelStatus.Connected : ChannelStatus.Unavailable,
        errorCount: isAlive
          ? INITIAL_CHANNEL_ERROR_COUNT
          : channel.errorCount + 1,
      };

      this.updateChannelInfo(channel.id, info);

      const isCurrentConnectionAlive =
        channel.id === this.currentChannel!.id && isAlive;

      if (!isCurrentConnectionAlive) {
        this.switchChannel();
      }
    } catch {
      const info: UpdateInfo = {
        status: ChannelStatus.Unavailable,
        errorCount: channel.errorCount + 1,
      };

      this.updateChannelInfo(channel.id, info);

      if (channel.id === this.currentChannel!.id) {
        this.switchChannel();
      }
    } finally {
      this.isTestingConnection = false;
    }
  }

  private calculatePriority(
    errorCount: Channel["errorCount"],
  ): Channel["priority"] {
    return Math.max(CHANNEL_MIN_PRIORITY, CHANNEL_MAX_PRIORITY - errorCount);
  }

  private getAvailableChannel(): Channel | null {
    const filteredChannels = this.channels.filter(
      (item) => item.status === ChannelStatus.Idle,
    );

    filteredChannels.sort((a, b) => b.priority - a.priority);

    const availableChannels = filteredChannels.filter(
      (item) => item.priority !== CHANNEL_MIN_PRIORITY,
    );
    const topPriorityChannel = availableChannels.at(0);
    const result = topPriorityChannel ?? null;

    return result;
  }

  private switchChannel(): void {
    const availableChannel = this.getAvailableChannel();

    if (availableChannel) {
      this.currentChannel = availableChannel;
      this.updateChannelStatus(availableChannel.id, ChannelStatus.Connected);
    } else {
      this.currentChannel = null;
      this.options.onError("No available channels");
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
        const info: UpdateInfo = {
          status: ChannelStatus.Idle,
          errorCount: INITIAL_CHANNEL_ERROR_COUNT,
        };

        this.updateChannelInfo(item.id, info);
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
    const updatedChannels = this.channels.map((item) => {
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

        return { ...item, status, lastChecked };
      }

      return item;
    });

    this.channels = updatedChannels;
    this.options.onStatusChange(this.channels);
  }
}
