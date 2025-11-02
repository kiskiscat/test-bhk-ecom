import type { ChannelStatus } from "../constants";

export type Channel = {
  id: string;
  name: string;
  status: ChannelStatus;
  url: string;
  priority: number;
  errorCount: number;
  lastChecked?: number;
  lastSuccessful?: number; // время последнего успешного соединения
  preferredOrder?: number; // предпочитаемый порядок для восстановления
};

export type InitialOptions = {
  checkIntervalTime: number;
  retryIntervalTime: number;
  autoRecoveryDelay: number;
};

export type Options = InitialOptions & {
  onStatusChange: (channels: Channel[]) => void;
  onError: (message: string) => void;
};

export type ConnectionState = {
  currentChannel: Channel | null;
  previousChannel: Channel | null;
  isRecovering: boolean;
  hasActiveConnection: boolean;
};

export type ChannelMetrics = {
  uptime: number; // процент доступности
  avgResponseTime: number;
  failureRate: number;
  lastFailureTime?: number;
  recoveryTime?: number; // время восстановления после сбоя
};
