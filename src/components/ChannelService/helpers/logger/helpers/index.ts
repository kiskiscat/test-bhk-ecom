import { LevelName, LogLevel } from "../constants";

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
