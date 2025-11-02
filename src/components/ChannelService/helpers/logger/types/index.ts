import type { LogLevel } from "../constants";

export type LogEntry = {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
};
