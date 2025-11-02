import type { Channel } from "../../types";
import { getStatusText } from "./helpers";
import styles from "./styles/index.module.css";

export type Props = {
  info: Channel;
};

export const ChannelInfo = ({ info }: Props) => {
  const formattedLastChecked = info.lastChecked
    ? new Date(info.lastChecked).toLocaleString()
    : "-";
  const formattedLastSuccessful = info.lastSuccessful
    ? new Date(info.lastSuccessful).toLocaleString()
    : "-";

  return (
    <div className={styles.container}>
      <span className={styles.label}>Имя:</span>
      <span className={styles.value}>{info.name}</span>

      <span className={styles.label}>Статус:</span>
      <span className={`${styles.value} ${styles.statusContainer}`}>
        <span className={styles.statusText}>{getStatusText(info.status)}</span>
      </span>

      <span className={styles.label}>URL:</span>
      <span className={`${styles.value} ${styles.url}`}>{info.url}</span>

      <span className={styles.label}>Приоритет:</span>
      <span className={styles.value}>
        {info.priority}/10
        {info.errorCount > 0 && (
          <span className={styles.errorCount}>(ошибок: {info.errorCount})</span>
        )}
      </span>

      <span className={styles.label}>Последняя проверка:</span>
      <span className={`${styles.value} ${styles.timeValue}`}>
        {formattedLastChecked}
      </span>

      {info.lastSuccessful && (
        <>
          <span className={styles.label}>Последний успех:</span>
          <span className={`${styles.value} ${styles.successTime}`}>
            {formattedLastSuccessful}
          </span>
        </>
      )}
    </div>
  );
};
