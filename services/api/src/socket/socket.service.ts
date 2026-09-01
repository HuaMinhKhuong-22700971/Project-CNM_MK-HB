import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer, frontendUrl: string): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [frontendUrl, "http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    },
    // Allow both WebSocket and HTTP long-polling fallback
    transports: ["websocket", "polling"]
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // ── CHAT ──────────────────────────────────────────────
    // Nhân viên / Khách hàng tham gia room của 1 chat session
    socket.on("join_chat", (sessionId: string) => {
      if (!sessionId) return;
      const room = `chat:${sessionId}`;
      socket.join(room);
      console.log(`[Socket.io] ${socket.id} joined room ${room}`);
    });

    socket.on("leave_chat", (sessionId: string) => {
      if (!sessionId) return;
      socket.leave(`chat:${sessionId}`);
    });

    // ── TICKET ────────────────────────────────────────────
    // Kỹ thuật viên / Khách hàng tham gia room của 1 ticket
    socket.on("join_ticket", (ticketId: string | number) => {
      if (!ticketId) return;
      const room = `ticket:${ticketId}`;
      socket.join(room);
      console.log(`[Socket.io] ${socket.id} joined room ${room}`);
    });

    socket.on("leave_ticket", (ticketId: string | number) => {
      if (!ticketId) return;
      socket.leave(`ticket:${ticketId}`);
    });

    // ── STAFF QUEUES ──────────────────────────────────────
    // Nhân viên bán hàng đăng ký nhận thông báo hàng đợi chat
    socket.on("join_staff_queue", () => {
      socket.join("staff:chat_queue");
      console.log(`[Socket.io] ${socket.id} joined staff:chat_queue`);
    });

    // Kỹ thuật viên đăng ký nhận thông báo hàng đợi ticket
    socket.on("join_tech_queue", () => {
      socket.join("staff:tech_queue");
      console.log(`[Socket.io] ${socket.id} joined staff:tech_queue`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log("[Socket.io] Server initialized");
  return io;
}

/**
 * Lấy instance Socket.io hiện tại.
 * Dùng trong controllers để emit events.
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("[Socket.io] Server not initialized. Call initSocketIO() first.");
  }
  return io;
}

/**
 * Emit an event to a specific chat session room
 */
export function emitToChatRoom(sessionId: string, event: string, data: unknown): void {
  try {
    getIO().to(`chat:${sessionId}`).emit(event, data);
  } catch {
    // Socket not initialized (e.g. during tests) — silently ignore
  }
}

/**
 * Emit an event to a specific ticket room
 */
export function emitToTicketRoom(ticketId: string | number, event: string, data: unknown): void {
  try {
    getIO().to(`ticket:${ticketId}`).emit(event, data);
  } catch {
    // Socket not initialized — silently ignore
  }
}

/**
 * Notify all staff in the chat queue room (new session arrived, queue updated, etc.)
 */
export function emitToStaffChatQueue(event: string, data: unknown): void {
  try {
    getIO().to("staff:chat_queue").emit(event, data);
  } catch {
    // Silently ignore
  }
}

/**
 * Notify all tech staff in the tech queue room (new ticket, ticket updated, etc.)
 */
export function emitToTechQueue(event: string, data: unknown): void {
  try {
    getIO().to("staff:tech_queue").emit(event, data);
  } catch {
    // Silently ignore
  }
}
