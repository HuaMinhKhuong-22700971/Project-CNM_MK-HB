import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let chatTablesReady = false;

type ChatSender = "customer" | "staff" | "system";
type ChatStatus = "open" | "assigned" | "waiting_customer" | "waiting_staff" | "resolved" | "waiting" | "active" | "closed";
type ConversationType = "AI_CHAT" | "HUMAN_SUPPORT" | "SALES_CONSULTATION";

function normalizeStatus(status?: string | null): ChatStatus {
  if (status === "waiting") return "waiting_staff";
  if (status === "active") return "assigned";
  if (status === "closed") return "resolved";
  return (status || "waiting_staff") as ChatStatus;
}

function normalizeConversationType(value?: string | null): ConversationType {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "AI_CHAT" || normalized === "HUMAN_SUPPORT" || normalized === "SALES_CONSULTATION") {
    return normalized as ConversationType;
  }
  return "SALES_CONSULTATION";
}

function readBuildData(value?: string | null) {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function mapMessage(message: any) {
  return {
    id: String(message.id),
    sender: message.sender as ChatSender,
    text: message.text,
    timestamp: message.created_at.toISOString(),
    buildData: readBuildData(message.build_data)
  };
}

function mapSession(session: any) {
  const metaMessage = session?.messages?.find((message: any) => readBuildData(message.build_data)?.conversationType);
  const meta = readBuildData(metaMessage?.build_data);

  return {
    id: session.id,
    sessionId: session.session_id,
    status: normalizeStatus(session.status),
    conversationType: normalizeConversationType(meta?.conversationType),
    customerName: session.customer_name,
    staffName: session.staff_name,
    linkedOrderId: session.linked_order_id,
    createdAt: session.created_at.toISOString(),
    updatedAt: session.updated_at.toISOString(),
    messages: (session.messages || []).map(mapMessage)
  };
}

async function ensureChatTables() {
  if (chatTablesReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INT NOT NULL AUTO_INCREMENT,
      session_id VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'waiting',
      customer_name VARCHAR(255) NOT NULL DEFAULT 'Khach hang',
      staff_name VARCHAR(255) NULL,
      linked_order_id INT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY chat_sessions_session_id_key (session_id),
      KEY idx_chat_sessions_status (status),
      KEY idx_chat_sessions_order (linked_order_id)
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INT NOT NULL AUTO_INCREMENT,
      session_id INT NOT NULL,
      sender VARCHAR(50) NOT NULL,
      text TEXT NOT NULL,
      build_data TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY fk_chat_messages_session (session_id),
      KEY idx_chat_messages_session_created (session_id, created_at),
      CONSTRAINT fk_chat_messages_session FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    )
  `);

  chatTablesReady = true;
}

export const createSession = async (req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const { customerName, linkedOrderId, initialMessage, conversationType } = req.body || {};
    const sessionId = uuidv4();
    const now = new Date();
    const normalizedType = normalizeConversationType(conversationType);
    const openingQuestion = String(initialMessage || "").trim();

    const session = await prisma.chatSession.create({
      data: {
        session_id: sessionId,
        status: "waiting",
        customer_name: customerName || "Khach hang PC Mall",
        linked_order_id: linkedOrderId ? Number(linkedOrderId) : null,
        created_at: now,
        updated_at: now,
        messages: {
          create: [
            {
              sender: "system",
              text: "Yeu cau tu van da duoc gui. Nhan vien ban hang se phan hoi som nhat.",
              created_at: now
            },
            ...(openingQuestion
              ? [
                  {
                    sender: "customer",
                    text: openingQuestion,
                    created_at: now
                  }
                ]
              : [])
          ]
        }
      },
      include: { messages: { orderBy: { created_at: "asc" } } }
    });

    res.status(201).json({ success: true, data: mapSession(session) });
  } catch (error) {
    console.error("Error creating chat session:", error);
    res.status(500).json({
      success: false,
      message: "Yeu cau tu van da duoc ghi nhan nhung he thong phan hoi cham. Vui long thu lai sau it phut.",
      detail: process.env.NODE_ENV === "production" ? undefined : error instanceof Error ? error.message : String(error)
    });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const session = await prisma.chatSession.findUnique({
      where: { session_id: req.params.id },
      include: { messages: { orderBy: { created_at: "asc" } } }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    res.status(200).json({ success: true, data: mapSession(session) });
  } catch (error) {
    console.error("Error getting chat session:", error);
    res.status(500).json({ success: false, message: "Failed to get session" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const { id } = req.params;
    const { sender, text, buildData } = req.body || {};

    const session = await prisma.chatSession.findUnique({
      where: { session_id: id }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (["closed", "resolved"].includes(session.status)) {
      return res.status(400).json({ success: false, message: "Phien tu van da ket thuc" });
    }

    const normalizedSender: ChatSender = sender === "staff" ? "staff" : sender === "system" ? "system" : "customer";
    const message = await prisma.chatMessage.create({
      data: {
        session_id: session.id,
        sender: normalizedSender,
        text: String(text || "").trim() || "(Tin nhan trong)",
        build_data: buildData ? JSON.stringify(buildData) : null,
        created_at: new Date()
      }
    });

    const nextStatus =
      normalizedSender === "staff"
        ? "active"
        : ["assigned", "waiting_customer", "active"].includes(session.status)
          ? "active"
          : session.status;

    await prisma.chatSession.update({
      where: { id: session.id },
      data: { status: nextStatus, updated_at: new Date() }
    });

    res.status(201).json({ success: true, data: mapMessage(message) });
  } catch (error) {
    console.error("Error sending chat message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

export const getQueue = async (_req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const sessions = await prisma.chatSession.findMany({
      where: { status: { notIn: ["closed", "resolved"] } },
      include: { messages: { orderBy: { created_at: "asc" } } },
      orderBy: [{ updated_at: "desc" }, { created_at: "asc" }]
    });

    res.status(200).json({ success: true, data: sessions.map(mapSession) });
  } catch (error) {
    console.error("Error getting chat queue:", error);
    res.status(500).json({ success: false, message: "Failed to get queue" });
  }
};

export const getQueueStats = async (_req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const all = await prisma.chatSession.findMany({
      where: { status: { notIn: ["closed", "resolved"] } }
    });

    res.status(200).json({
      success: true,
      data: {
        waiting: all.filter((session) => ["waiting", "waiting_staff", "open"].includes(session.status)).length,
        active: all.filter((session) => ["active", "assigned", "waiting_customer"].includes(session.status)).length,
        total: all.length
      }
    });
  } catch (error) {
    console.error("Error getting chat queue stats:", error);
    res.status(500).json({ success: false, message: "Failed to get queue stats" });
  }
};

export const acceptSession = async (req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const { id } = req.params;
    const { staffName } = req.body || {};

    const session = await prisma.chatSession.findUnique({
      where: { session_id: id }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (["waiting", "waiting_staff", "open"].includes(session.status)) {
      await prisma.chatSession.update({
        where: { id: session.id },
        data: {
          status: "active",
          staff_name: staffName || "Nhan vien ban hang",
          updated_at: new Date()
        }
      });

      await prisma.chatMessage.create({
        data: {
          session_id: session.id,
          sender: "system",
          text: `${staffName || "Nhan vien ban hang"} da tham gia phien tu van.`,
          created_at: new Date()
        }
      });
    }

    const refreshed = await prisma.chatSession.findUnique({
      where: { id: session.id },
      include: { messages: { orderBy: { created_at: "asc" } } }
    });

    res.status(200).json({ success: true, data: mapSession(refreshed) });
  } catch (error) {
    console.error("Error accepting chat session:", error);
    res.status(500).json({ success: false, message: "Failed to accept session" });
  }
};

export const closeSession = async (req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const session = await prisma.chatSession.findUnique({
      where: { session_id: req.params.id }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        status: "closed",
        updated_at: new Date()
      }
    });

    await prisma.chatMessage.create({
      data: {
        session_id: session.id,
        sender: "system",
        text: "Phien tu van da ket thuc. Cam on ban da lien he PC Mall.",
        created_at: new Date()
      }
    });

    const refreshed = await prisma.chatSession.findUnique({
      where: { id: session.id },
      include: { messages: { orderBy: { created_at: "asc" } } }
    });

    res.status(200).json({ success: true, data: mapSession(refreshed) });
  } catch (error) {
    console.error("Error closing chat session:", error);
    res.status(500).json({ success: false, message: "Failed to close session" });
  }
};
