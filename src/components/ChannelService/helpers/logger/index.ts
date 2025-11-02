import { ConnectionEventType } from "../event-emitter/constants";
import type { ConnectionEvent } from "../event-emitter/types";
import { LogLevel } from "./constants";
import { getLevelName } from "./helpers";
import type { LogEntry } from "./types";

export class ConnectionLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number;
  private minLogLevel: LogLevel;

  constructor(maxLogs: number = 1000, minLogLevel: LogLevel = LogLevel.Info) {
    this.maxLogs = maxLogs;
    this.minLogLevel = minLogLevel;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    if (level < this.minLogLevel) return;

    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
    };

    this.logs.push(logEntry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const levelName = getLevelName(level);
    const timestamp = new Date(logEntry.timestamp).toISOString();
    const compatibleContext = context ?? "";

    // eslint-disable-next-line no-console
    console.log(`[${levelName}] ${timestamp} - ${message}`, compatibleContext);
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.Debug, message, context);
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.Info, message, context);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.Warn, message, context);
  }

  public error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.Error, message, context);
  }

  public getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      if (level === LogLevel.Debug) {
        const result = [...this.logs];

        return result;
      } else {
        const result = this.logs.filter((item) => item.level === level);

        return result;
      }
    }

    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public logConnectionEvent<T extends keyof ConnectionEvent>(
    eventType: T,
    data: ConnectionEvent[T],
  ): void {
    switch (eventType) {
      case ConnectionEventType.ChannelSwitch: {
        const exactData =
          data as ConnectionEvent[ConnectionEventType.ChannelSwitch];
        const fromName = exactData.from?.name || "нет";

        this.info(`Переключение канала: ${fromName} -> ${exactData.to.name}`, {
          reason: exactData.reason,
          fromChannelId: exactData.from?.id,
          toChannelId: exactData.to.id,
        });
        break;
      }
      case ConnectionEventType.ChannelFailed: {
        const exactData =
          data as ConnectionEvent[ConnectionEventType.ChannelFailed];

        this.warn(`Канал недоступен: ${exactData.channel.name}`, {
          channelId: exactData.channel.id,
          errorCount: exactData.errorCount,
        });
        break;
      }
      case ConnectionEventType.ChannelRecovered: {
        const exactData =
          data as ConnectionEvent[ConnectionEventType.ChannelRecovered];

        this.info(`Канал восстановлен: ${exactData.channel.name}`, {
          channelId: exactData.channel.id,
          previousErrorCount: exactData.previousErrorCount,
        });
        break;
      }
      case ConnectionEventType.AllChannelsFailed: {
        const exactData =
          data as ConnectionEvent[ConnectionEventType.AllChannelsFailed];

        this.error(`Все каналы недоступны`, {
          channelCount: exactData.channelCount,
        });
        break;
      }
      case ConnectionEventType.ConnectionRestored: {
        const exactData =
          data as ConnectionEvent[ConnectionEventType.ConnectionRestored];

        this.info(
          `Соединение восстановлено через канал: ${exactData.channel.name}`,
          {
            channelId: exactData.channel.id,
          },
        );
        break;
      }
      default:
        this.debug("Неизвестное событие соединения", { eventType, data });
    }
  }
}
