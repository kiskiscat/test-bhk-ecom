import { ChannelInfo } from "./components/ChannelInfo";
import { LogViewer } from "./components/LogViewer";
import {
  ALL_CHANNELS_HEADING_AREA_LABELLEDBY,
  CHANNELS,
  ChannelStatus,
  CURRENT_CHANNEL_HEADING_AREA_LABELLEDBY,
} from "./constants";
import { useConnectionManager } from "./helpers";

import styles from "./styles/index.module.css";

export const ChannelService = () => {
  const { channels, currentChannel, errorMessage, connectionManager } =
    useConnectionManager(CHANNELS);

  const getChannelCardClass = (status: ChannelStatus): string => {
    const baseClass = styles.channelCard;

    switch (status) {
      case ChannelStatus.Connected:
        return `${baseClass} ${styles.connected}`;
      case ChannelStatus.Unavailable:
        return `${baseClass} ${styles.unavailable}`;
      case ChannelStatus.Idle:
        return `${baseClass} ${styles.idle}`;
      default: {
        const restTypes: never = status;
        throw new Error(`Unhandled channel status: ${restTypes}`);
      }
    }
  };

  return (
    <article role="main" className={styles.main}>
      <h1 className={styles.title}>Отказоустойчивый сервис канала связи</h1>

      {errorMessage && (
        <div className={styles.errorAlert}>
          <strong className={styles.errorAlertText}>Ошибка соединения:</strong>
          {errorMessage}
        </div>
      )}

      {currentChannel && (
        <section
          aria-labelledby={CURRENT_CHANNEL_HEADING_AREA_LABELLEDBY}
          className={styles.activeChannelSection}
        >
          <h2
            id={CURRENT_CHANNEL_HEADING_AREA_LABELLEDBY}
            className={styles.activeChannelTitle}
          >
            Активный канал
          </h2>
          <div className={styles.activeChannelContainer}>
            <ChannelInfo info={currentChannel} />
          </div>
        </section>
      )}

      <section
        aria-labelledby={ALL_CHANNELS_HEADING_AREA_LABELLEDBY}
        className={styles.allChannelsSection}
      >
        <h2
          id={ALL_CHANNELS_HEADING_AREA_LABELLEDBY}
          className={styles.allChannelsTitle}
        >
          Состояние всех каналов
        </h2>
        <div className={styles.channelsGrid}>
          {channels.map((item) => (
            <div key={item.id} className={getChannelCardClass(item.status)}>
              <ChannelInfo info={item} />
            </div>
          ))}
        </div>
      </section>
      {connectionManager && (
        <section className={styles.logsSection}>
          <LogViewer
            logger={connectionManager.getLogger()}
            maxDisplayLogs={50}
          />
        </section>
      )}
    </article>
  );
};
