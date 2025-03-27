import io from "socket.io-client";
import type { UseSocketOptions } from "@/types/socket";

export const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "ws://localhost:3000";

export const connectSocket = (config: Partial<UseSocketOptions> = {}) => {
  return io(config.url ?? SOCKET_URL, {
    autoConnect: config.autoConnect ?? true,
    reconnection: config.reconnection ?? true,
    reconnectionAttempts: config.reconnectionAttempts ?? 5,
    reconnectionDelay: config.reconnectionDelay ?? 1000,
    timeout: config.timeout ?? 5001,
    auth: config.auth,
    query: config.query,
  });
};
