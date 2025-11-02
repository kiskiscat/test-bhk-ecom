import { ChannelInfo } from "./components/ChannelInfo";
import { CHANNELS } from "./constants";
import {
  ALL_CHANNELS_HEADING_AREA_LABELLEDBY,
  CURRENT_CHANNEL_HEADING_AREA_LABELLEDBY,
} from "./constants/accessibility";
import { useConnectionManager } from "./helpers";

export const ChannelService = () => {
  const { channels, currentChannel, errorMessage } =
    useConnectionManager(CHANNELS);

  if (errorMessage) {
    return <div>Произошла ошибка: {errorMessage}</div>;
  }

  return (
    <article role="main">
      <h1>Информация</h1>
      <section aria-labelledby={ALL_CHANNELS_HEADING_AREA_LABELLEDBY}>
        <h2 id={ALL_CHANNELS_HEADING_AREA_LABELLEDBY}>О всех каналах</h2>
        <ul>
          {channels.map((item) => (
            <li key={item.id}>
              <ChannelInfo info={item} />
            </li>
          ))}
        </ul>
      </section>
      {currentChannel && (
        <section aria-labelledby={CURRENT_CHANNEL_HEADING_AREA_LABELLEDBY}>
          <h2 id={CURRENT_CHANNEL_HEADING_AREA_LABELLEDBY}>О текущем канале</h2>
          <ChannelInfo info={currentChannel} />
        </section>
      )}
    </article>
  );
};
