import { useEffect, useState } from "react";

import { LogLevel } from "../../helpers/logger/constants";
import { getLevelName } from "../../helpers/logger/helpers";
import type { ConnectionLogger } from "../../helpers/logger";
import type { LogEntry } from "../../helpers/logger/types";
import { formatTimestamp } from "./helpers";

import styles from "./styles/index.module.css";

type Props = {
  logger: ConnectionLogger;
};

export const LogViewer = ({ logger }: Props) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logLevel, setLogLevel] = useState(LogLevel.Debug);

  const getLevelClass = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.Debug:
        return styles.debug;
      case LogLevel.Info:
        return styles.info;
      case LogLevel.Warn:
        return styles.warn;
      case LogLevel.Error:
        return styles.error;
      default: {
        const restTypes: never = level;
        throw new Error(`Unknown log level: ${restTypes}`);
      }
    }
  };

  const selectOnChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const newValue = Number(event.target.value) as LogLevel;

    setLogLevel(newValue);
  };

  const buttonOnClick = (): void => {
    logger.clearLogs();
  };

  useEffect(() => {
    const updateLogs = (): void => {
      const allLogs = logger.getLogs(logLevel);

      setLogs(allLogs);
    };

    updateLogs();

    const interval = setInterval(updateLogs, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [logger, logLevel]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Логи соединения</h3>
        <div className={styles.controls}>
          <label htmlFor="log-level" className={styles.levelLabel}>
            Уровень:
          </label>
          <select
            id="log-level"
            className={styles.levelSelect}
            value={logLevel}
            onChange={selectOnChange}
          >
            <option value={LogLevel.Debug}>DEBUG</option>
            <option value={LogLevel.Info}>INFO</option>
            <option value={LogLevel.Warn}>WARN</option>
            <option value={LogLevel.Error}>ERROR</option>
          </select>
          <button onClick={buttonOnClick} className={styles.clearButton}>
            Очистить
          </button>
        </div>
      </div>

      <div className={styles.logsArea}>
        {logs.length === 0 ? (
          <div className={styles.emptyMessage}>Нет логов для отображения</div>
        ) : (
          logs.map((item, index) => (
            <div key={index} className={styles.logEntry}>
              <span className={styles.timestamp}>
                [{formatTimestamp(item.timestamp)}]
              </span>
              <span
                className={`${styles.levelBadge} ${getLevelClass(item.level)}`}
              >
                [{getLevelName(item.level)}]
              </span>
              <span className={styles.message}>{item.message}</span>
              {item.context && (
                <span className={styles.context}>
                  {JSON.stringify(item.context)}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
