import type { ConnectionEvent, EventListener } from "./types";

export class ConnectionEventEmitter {
  private listeners: {
    [K in keyof ConnectionEvent]?: EventListener<K>[];
  } = {};

  public on<T extends keyof ConnectionEvent>(
    event: T,
    listener: EventListener<T>,
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);

    return () => {
      const listeners = this.listeners[event];

      if (listeners) {
        const index = listeners.indexOf(listener);

        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  public emit<T extends keyof ConnectionEvent>(
    event: T,
    data: ConnectionEvent[T],
  ): void {
    const listeners = this.listeners[event];

    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  public removeAllListeners(): void {
    this.listeners = {};
  }
}
