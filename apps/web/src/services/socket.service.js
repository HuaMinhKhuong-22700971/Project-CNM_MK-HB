/**
 * Socket.io Client Service — Singleton pattern
 * Quản lý 1 kết nối duy nhất đến Socket.io server
 */
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:4000";

let socket = null;

/**
 * Lấy hoặc tạo mới Socket.io connection
 * @returns {Socket} socket instance
 */
export function getSocket() {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });

    socket.on("connect", () => {
      console.log("[Socket.io] Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket.io] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket.io] Disconnected:", reason);
    });
  }

  return socket;
}

/**
 * Ngắt kết nối và xóa socket instance
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("[Socket.io] Manually disconnected");
  }
}

export default { getSocket, disconnectSocket };
