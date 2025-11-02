import { useEffect, useState } from "react";

import { ChannelStatus, INITIAL_OPTIONS } from "../constants";
import { type Channel } from "../types";
import { ConnectionManager } from "./connection-manager";

export const useConnectionManager = (initialChannels: Channel[]) => {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [connectionManager, setConnectionManager] =
    useState<ConnectionManager | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const onStatusChange = (updatedChannels: Channel[]): void => {
      if (!isMounted) return;

      const newCurrentChannel = updatedChannels.find(
        (item) => item.status === ChannelStatus.Connected,
      );
      const updatedCurrentChannel = newCurrentChannel ?? null;

      setChannels(updatedChannels);
      setCurrentChannel(updatedCurrentChannel);
    };

    const onError = (message: string): void => {
      if (!isMounted) return;

      setErrorMessage(message);
    };

    const manager = new ConnectionManager(initialChannels, {
      ...INITIAL_OPTIONS,
      onStatusChange,
      onError,
    });

    setConnectionManager(manager);
    manager.start();

    return () => {
      isMounted = false;
      manager.stop();
      setConnectionManager(null);
    };
  }, [initialChannels]);

  return { channels, currentChannel, errorMessage, connectionManager };
};
