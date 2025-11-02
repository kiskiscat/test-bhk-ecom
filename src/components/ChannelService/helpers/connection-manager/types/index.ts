import type { Channel } from "../../../types";

export type Intervals = {
  checkInterval: NodeJS.Timeout;
  retryInterval: NodeJS.Timeout;
};

export type UpdateInfo = {
  status: Channel["status"];
  errorCount: Channel["errorCount"];
};
