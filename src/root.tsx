import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChannelService } from "./components/ChannelService";

import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChannelService />
  </StrictMode>,
);
