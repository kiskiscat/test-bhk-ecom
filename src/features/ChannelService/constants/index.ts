import { type Channel, type InitialOptions } from "../types";

export const CHANNEL_MAX_PRIORITY = 10;
export const CHANNEL_MIN_PRIORITY = 0;
export const INITIAL_CHANNEL_ERROR_COUNT = 0;
export enum ChannelStatus {
  Idle = "IDLE",
  Connected = "CONNECTED",
  Unavailable = "UNAVAILABLE",
}
export const CHANNELS: Channel[] = [
  {
    id: "1",
    name: "Main HTTPS API",
    status: ChannelStatus.Idle,
    url: "https://kakoetoApi1.example.com",
    priority: CHANNEL_MAX_PRIORITY,
    errorCount: INITIAL_CHANNEL_ERROR_COUNT,
  },
  {
    id: "2",
    name: "Backup HTTP API",
    status: ChannelStatus.Idle,
    url: "http://kakoetoApi2.example.com",
    priority: CHANNEL_MAX_PRIORITY,
    errorCount: INITIAL_CHANNEL_ERROR_COUNT,
  },
  {
    id: "3",
    name: "Main WSS API",
    status: ChannelStatus.Idle,
    url: "wss://kakoetoApi3.example.com",
    priority: CHANNEL_MAX_PRIORITY,
    errorCount: INITIAL_CHANNEL_ERROR_COUNT,
  },
  {
    id: "4",
    name: "Backup WS API",
    status: ChannelStatus.Idle,
    url: "ws://kakoetoApi4.example.com",
    priority: CHANNEL_MAX_PRIORITY,
    errorCount: INITIAL_CHANNEL_ERROR_COUNT,
  },
  {
    id: "5",
    name: "JSON Placeholder",
    status: ChannelStatus.Idle,
    url: "https://jsonplaceholder.typicode.com/",
    priority: CHANNEL_MAX_PRIORITY,
    errorCount: INITIAL_CHANNEL_ERROR_COUNT,
  },
];

export const INITIAL_OPTIONS: InitialOptions = {
  checkIntervalTime: 2000,
  retryIntervalTime: 15000,
};
