import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChannelService } from "./features/ChannelService";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChannelService />
  </StrictMode>,
);
