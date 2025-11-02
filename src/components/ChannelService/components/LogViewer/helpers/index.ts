import { LogLevel } from "../../../helpers/logger/constants";
import { LevelName } from "../constants";

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const result = date.toLocaleTimeString();

  return result;
};

export const getLevelName = (level: LogLevel): string => {
  switch (level) {
    case LogLevel.Debug:
      return LevelName.Debug;
    case LogLevel.Info:
      return LevelName.Info;
    case LogLevel.Error:
      return LevelName.Error;
    case LogLevel.Warn:
      return LevelName.Warn;
    default: {
      const restTypes: never = level;
      throw new Error(`Unknown log level: ${restTypes}`);
    }
  }
};
