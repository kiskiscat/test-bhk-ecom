import { ChannelStatus } from "../../../constants";

export const getStatusText = (status: ChannelStatus): string => {
  switch (status) {
    case ChannelStatus.Connected:
      return "Подключен";
    case ChannelStatus.Unavailable:
      return "Недоступен";
    case ChannelStatus.Idle:
      return "Готов";
    default: {
      const restTypes: never = status;
      throw new Error(`Unhandled channel status: ${restTypes}`);
    }
  }
};
