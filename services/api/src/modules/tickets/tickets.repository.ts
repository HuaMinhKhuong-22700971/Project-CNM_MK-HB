import { prisma } from "../../config/prisma";

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
  });
}

export function getTicketById(id: string | number) {
  return prisma.ticket.findUnique({
    where: { id: typeof id === "string" ? parseInt(id, 10) : id },
    include: {
      users_tickets_user_idTousers: { select: { id: true, email: true, full_name: true } },
      users_tickets_assigned_to_idTousers: { select: { id: true, email: true, full_name: true } }
    }
  });
}

export function getTicketsByReporter(userId: string) {
  const numericUserId = parseInt(userId, 10);
  return prisma.ticket.findMany({
    where: { user_id: numericUserId },
    include: {
      users_tickets_assigned_to_idTousers: { select: { id: true, email: true, full_name: true } }
    },
    orderBy: { created_at: "desc" }
  });
}

export function listTickets() {
  return prisma.ticket.findMany({
    include: {
      users_tickets_user_idTousers: { select: { id: true, email: true, full_name: true } },
      users_tickets_assigned_to_idTousers: { select: { id: true, email: true, full_name: true } }
    },
    orderBy: { created_at: "desc" }
  });
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
  });
}
