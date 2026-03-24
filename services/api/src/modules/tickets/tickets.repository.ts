import { prisma } from "../../config/prisma";

export function createTicket(data: {
  userId: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}) {
  return prisma.ticket.create({ data });
}

export function getTicketById(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      reporter: { select: { id: true, email: true, fullName: true } },
      assignee: { select: { id: true, email: true, fullName: true } }
    }
  });
}

export function getTicketsByReporter(userId: string) {
  return prisma.ticket.findMany({
    where: { userId },
    include: {
      assignee: { select: { id: true, email: true, fullName: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export function listTickets() {
  return prisma.ticket.findMany({
    include: {
      reporter: { select: { id: true, email: true, fullName: true } },
      assignee: { select: { id: true, email: true, fullName: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export function updateTicket(
  id: string,
  data: Partial<{
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assignedToId: string | null;
  }>
) {
  return prisma.ticket.update({
    where: { id },
    data
  });
}
