import type { Channel } from "../../../types";
import type { ChannelSwitchReason, ConnectionEventType } from "../constants";

export type ConnectionEvent = {
  [ConnectionEventType.ChannelSwitch]: {
    from: Channel | null;
    to: Channel;
    timestamp: number;
    reason: ChannelSwitchReason;
  };
  [ConnectionEventType.ChannelFailed]: {
    channel: Channel;
    errorCount: number;
    timestamp: number;
  };
  [ConnectionEventType.ChannelRecovered]: {
    channel: Channel;
    previousErrorCount: number;
    timestamp: number;
  };
  [ConnectionEventType.AllChannelsFailed]: {
    channelCount: number;
    timestamp: number;
  };
  [ConnectionEventType.ConnectionRestored]: {
    channel: Channel;
    timestamp: number;
  };
};

export type EventListener<T extends keyof ConnectionEvent> = (
  data: ConnectionEvent[T],
) => void;
