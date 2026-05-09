import { prisma } from "../../config/prisma";

function normalizeUser(user: any) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.Role?.name
  };
}

function normalizeTicket(ticket: any) {
  if (!ticket) return null;

  return {
    id: ticket.id,
    reporterId: ticket.user_id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    assignedToId: ticket.assigned_to_id,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    reporter: normalizeUser(ticket.users_tickets_user_idTousers),
    assignee: normalizeUser(ticket.users_tickets_assigned_to_idTousers),
    messages: (ticket.TicketMessage || []).map((message: any) => ({
      id: message.id,
      message: message.message,
      createdAt: message.created_at,
      updatedAt: message.updated_at,
      sender: normalizeUser(message.User)
    })),
    user_id: ticket.user_id,
    assigned_to_id: ticket.assigned_to_id
  };
}

export function createTicket(data: {
  userId: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}) {
  const numericUserId = parseInt(data.userId, 10);
  return prisma.ticket.create({
    data: {
      user_id: numericUserId,
      title: data.title,
      description: data.description,
      priority: data.priority
    }
  }).then((ticket: any) => getTicketById(ticket.id));
}

export function getTicketById(id: string | number) {
  return prisma.ticket.findUnique({
    where: { id: typeof id === "string" ? parseInt(id, 10) : id },
    include: {
      users_tickets_user_idTousers: { select: { id: true, email: true, full_name: true, Role: { select: { name: true } } } },
      users_tickets_assigned_to_idTousers: { select: { id: true, email: true, full_name: true, Role: { select: { name: true } } } },
      TicketMessage: {
        include: {
          User: { select: { id: true, email: true, full_name: true, Role: { select: { name: true } } } }
        },
        orderBy: { created_at: "asc" }
      }
    }
  }).then(normalizeTicket);
}

export function getTicketsByReporter(userId: string) {
  const numericUserId = parseInt(userId, 10);
  return prisma.ticket.findMany({
    where: { user_id: numericUserId },
    include: {
      users_tickets_user_idTousers: { select: { id: true, email: true, full_name: true, Role: { select: { name: true } } } },
      users_tickets_assigned_to_idTousers: { select: { id: true, email: true, full_name: true, Role: { select: { name: true } } } }
    },
    orderBy: { created_at: "desc" }
  }).then((tickets: any[]) => tickets.map(normalizeTicket));
}

export function listTickets() {
  return prisma.ticket.findMany({
    include: {
      users_tickets_user_idTousers: { select: { id: true, email: true, full_name: true, Role: { select: { name: true } } } },
      users_tickets_assigned_to_idTousers: { select: { id: true, email: true, full_name: true, Role: { select: { name: true } } } }
    },
    orderBy: { created_at: "desc" }
  }).then((tickets: any[]) => tickets.map(normalizeTicket));
}

export function updateTicket(
  id: string | number,
  data: Partial<{
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assigned_to_id: number | null;
  }>
) {
  return prisma.ticket.update({
    where: { id: typeof id === "string" ? parseInt(id, 10) : id },
    data
  }).then((ticket: any) => getTicketById(ticket.id));
}

export async function createTicketMessage(data: {
  ticketId: string | number;
  userId: string;
  message: string;
}) {
  const ticketId = typeof data.ticketId === "string" ? parseInt(data.ticketId, 10) : data.ticketId;
  await prisma.ticketMessage.create({
    data: {
      ticket_id: ticketId,
      user_id: parseInt(data.userId, 10),
      message: data.message
    }
  });

  return getTicketById(ticketId);
}
