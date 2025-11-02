import { ConnectionEventType } from "../event-emitter/constants";
import type { ConnectionEvent } from "../event-emitter/types";
import { LogLevel } from "./constants";
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

    const levelNames = ["DEBUG", "INFO", "WARN", "ERROR"];
    const levelName = levelNames[level];
    const timestamp = new Date(logEntry.timestamp).toISOString();

    // eslint-disable-next-line no-console
    console.log(`[${levelName}] ${timestamp} - ${message}`, context || "");
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
    if (level) {
      return this.logs.filter((log) => log.level >= level);
    }

    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  // Логирование событий соединения
  public logConnectionEvent<T extends keyof ConnectionEvent>(
    eventType: T,
    data: ConnectionEvent[T],
  ): void {
    switch (eventType) {
      case ConnectionEventType.ChannelSwitch: {
        const switchData =
          data as ConnectionEvent[ConnectionEventType.ChannelSwitch];
        this.info(
          `Переключение канала: ${switchData.from?.name || "нет"} → ${switchData.to.name}`,
          {
            reason: switchData.reason,
            fromChannelId: switchData.from?.id,
            toChannelId: switchData.to.id,
          },
        );
        break;
      }
      case ConnectionEventType.ChannelFailed: {
        const failData =
          data as ConnectionEvent[ConnectionEventType.ChannelFailed];
        this.warn(`Канал недоступен: ${failData.channel.name}`, {
          channelId: failData.channel.id,
          errorCount: failData.errorCount,
        });
        break;
      }
      case ConnectionEventType.ChannelRecovered: {
        const recoverData =
          data as ConnectionEvent[ConnectionEventType.ChannelRecovered];
        this.info(`Канал восстановлен: ${recoverData.channel.name}`, {
          channelId: recoverData.channel.id,
          previousErrorCount: recoverData.previousErrorCount,
        });
        break;
      }
      case ConnectionEventType.AllChannelsFailed: {
        const allFailData =
          data as ConnectionEvent[ConnectionEventType.AllChannelsFailed];
        this.error(`Все каналы недоступны`, {
          channelCount: allFailData.channelCount,
        });
        break;
      }
      case ConnectionEventType.ConnectionRestored: {
        const restoreData =
          data as ConnectionEvent[ConnectionEventType.ConnectionRestored];
        this.info(
          `Соединение восстановлено через канал: ${restoreData.channel.name}`,
          {
            channelId: restoreData.channel.id,
          },
        );
        break;
      }
      default:
        this.debug("Неизвестное событие соединения", { eventType, data });
    }
  }
}
