import { type Channel, type InitialOptions } from "../types";

export enum ChannelStatus {
  Idle = "IDLE",
  Connected = "CONNECTED",
  Unavailable = "UNAVAILABLE",
}

export const CHANNEL_MAX_PRIORITY = 10;
export const CHANNEL_MIN_PRIORITY = 0;
export const INITIAL_CHANNEL_ERROR_COUNT = 0;

export const CHANNELS: Channel[] = [
  {
    id: "1",
    name: "Несуществующий API 1",
    status: ChannelStatus.Idle,
    url: "https://nonexistent-api-1.example.com",
    priority: CHANNEL_MAX_PRIORITY,
    errorCount: INITIAL_CHANNEL_ERROR_COUNT,
  },
  {
    id: "2",
    name: "Несуществующий API 2",
    status: ChannelStatus.Idle,
    url: "https://nonexistent-api-2.example.com",
    priority: CHANNEL_MAX_PRIORITY,
    errorCount: INITIAL_CHANNEL_ERROR_COUNT,
  },
  {
    id: "3",
    name: "JSON Placeholder API",
    status: ChannelStatus.Idle,
    url: "https://jsonplaceholder.typicode.com/",
    priority: CHANNEL_MAX_PRIORITY,
    errorCount: INITIAL_CHANNEL_ERROR_COUNT,
  },
  {
    id: "4",
    name: "HTTPBin API",
    status: ChannelStatus.Idle,
    url: "https://httpbin.org/",
    priority: CHANNEL_MAX_PRIORITY,
    errorCount: INITIAL_CHANNEL_ERROR_COUNT,
  },
  {
    id: "5",
    name: "Несуществующий WS",
    status: ChannelStatus.Idle,
    url: "wss://nonexistent-ws.example.com",
    priority: CHANNEL_MAX_PRIORITY,
    errorCount: INITIAL_CHANNEL_ERROR_COUNT,
  },
];

export const INITIAL_OPTIONS: InitialOptions = {
  checkIntervalTime: 1000,
  retryIntervalTime: 5000,
  autoRecoveryDelay: 10000,
};

export const ALL_CHANNELS_HEADING_AREA_LABELLEDBY = "all-channels-heading";
export const CURRENT_CHANNEL_HEADING_AREA_LABELLEDBY =
  "current-channels-heading";
