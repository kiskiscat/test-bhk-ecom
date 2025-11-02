import type { Channel } from "../../types";
import { ProtocolPrefix } from "./constants";

export class TestChannelConnection {
  public async test(channel: Channel): Promise<boolean> {
    if (channel.url.startsWith(ProtocolPrefix.Http)) {
      return this.testHttpPrefixChannel(channel);
    } else if (channel.url.startsWith(ProtocolPrefix.Ws)) {
      return this.testWsPrefixChannel(channel);
    } else {
      return false;
    }
  }

  private async testHttpPrefixChannel(channel: Channel): Promise<boolean> {
    try {
      const response = await fetch(channel.url, { method: "HEAD" });

      return response.ok;
    } catch {
      return false;
    }
  }

  private async testWsPrefixChannel(channel: Channel): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(channel.url);

        const timeout = setTimeout(() => {
          ws.close();
          resolve(false);
        }, 2000);

        const cleanup = () => {
          clearTimeout(timeout);
          ws.removeEventListener("open", handleOpen);
          ws.removeEventListener("error", handleError);
          ws.close();
        };

        const handleOpen = () => {
          cleanup();
          resolve(true);
        };

        const handleError = () => {
          cleanup();
          resolve(false);
        };

        ws.addEventListener("open", handleOpen);
        ws.addEventListener("error", handleError);
      } catch {
        resolve(false);
      }
    });
  }
}
