import { useEffect, useState } from "react";
import { type Channel } from "../types";
import { ConnectionManager } from "./connection-manager";
import { ChannelStatus, INITIAL_OPTIONS } from "../constants";

export const useConnectionManager = (initialChannels: Channel[]) => {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    manager.start();

    return () => {
      isMounted = false;
      manager.stop();
    };
  }, [initialChannels]);

  return { channels, currentChannel, errorMessage };
};
