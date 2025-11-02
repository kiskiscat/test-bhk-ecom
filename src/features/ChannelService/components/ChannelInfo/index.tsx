import type { Channel } from "../../types";

export type Props = {
  info: Channel;
};

export const ChannelInfo = ({ info }: Props) => {
  const formattedTime = info.lastChecked
    ? new Date(info.lastChecked).toLocaleString()
    : "—";

  return (
    <div>
      <p>
        <span>Имя:</span>
        <span>{info.name}</span>
      </p>
      <p>
        <span>ID:</span>
        <span>{info.id}</span>
      </p>
      <p>
        <span>Статус:</span>
        <span>{info.status}</span>
      </p>
      <p>
        <span>URL:</span>
        <span>{info.url}</span>
      </p>
      <p>
        <span>Приоритет:</span>
        <span>{info.priority}</span>
      </p>
      <p>
        <span>Последнее время использования:</span>
        <span>{formattedTime}</span>
      </p>
    </div>
  );
};
