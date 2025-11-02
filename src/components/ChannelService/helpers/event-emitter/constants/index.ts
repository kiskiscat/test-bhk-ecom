export enum ConnectionEventType {
  ChannelSwitch = "CHANNEL_SWITCH",
  ChannelFailed = "CHANNEL_FAILED",
  ChannelRecovered = "CHANNEL_RECOVERED",
  AllChannelsFailed = "ALL_CHANNELS_FAILED",
  ConnectionRestored = "CONNECTION_RESTORED",
}

export enum ChannelSwitchReason {
  Initial = "initial",
  Failure = "failure",
  Recovery = "recovery",
}
