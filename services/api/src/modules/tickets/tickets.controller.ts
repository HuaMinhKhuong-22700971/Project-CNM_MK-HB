import { Request, Response } from "express";

import { prisma } from "../../config/prisma";
import { ROLES } from "../../constants/roles";
import { AppError } from "../../errors/app-error";
import { asyncHandler } from "../../utils/async-handler";
import {
  createTicketMessage,
  createTicket,
  getTicketById,
  getTicketsByReporter,
  listTickets,
  updateTicket
} from "./tickets.repository";
import { addTicketMessageSchema, createTicketSchema, updateTicketSchema } from "./tickets.validator";

export const postMyTicket = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = createTicketSchema.parse(req.body);

  const ticket = await createTicket({
    userId: req.user.userId,
    title: payload.title,
    description: payload.description,
    priority: payload.priority
  });

  res.status(201).json({
    success: true,
    data: ticket
  });
});

export const getMyTickets = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const tickets = await getTicketsByReporter(req.user.userId);

  res.status(200).json({
    success: true,
    data: tickets
  });
});

export const getTicketDetail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const ticket = await getTicketById(req.params.id);
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const canAccess =
    Number(ticket.user_id) === Number(req.user.userId) ||
    req.user.role === ROLES.ADMIN ||
    req.user.role === ROLES.TECHNICIAN ||
    req.user.role === ROLES.SALES;

  if (!canAccess) {
    throw new AppError("Forbidden", 403);
  }

  res.status(200).json({
    success: true,
    data: ticket
  });
});

export const getAllTickets = asyncHandler(async (_req: Request, res: Response) => {
  const tickets = await listTickets();

  res.status(200).json({
    success: true,
    data: tickets
  });
});

export const patchTicket = asyncHandler(async (req: Request, res: Response) => {
  const payload = updateTicketSchema.parse(req.body);

  const ticket = await getTicketById(req.params.id);
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  if (payload.assignedToId) {
    const assignee = await prisma.user.findUnique({
      where: { id: payload.assignedToId },
      include: { Role: true }
    });

    if (!assignee) {
      throw new AppError("Assignee not found", 404);
    }

    const isValidAssignee = (assignee as any).Role?.name === ROLES.TECHNICIAN || (assignee as any).Role?.name === ROLES.ADMIN;

    if (!isValidAssignee) {
      throw new AppError("Assignee must be technician or admin", 400);
    }
  }

  const updated = await updateTicket(req.params.id, {
    status: payload.status,
    priority: payload.priority,
    assigned_to_id: payload.assignedToId
  });

  res.status(200).json({
    success: true,
    data: updated
  });
});

export const postTicketMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const ticket = await getTicketById(req.params.id);
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const canAccess =
    Number(ticket.user_id) === Number(req.user.userId) ||
    req.user.role === ROLES.ADMIN ||
    req.user.role === ROLES.TECHNICIAN ||
    req.user.role === ROLES.SALES;

  if (!canAccess) {
    throw new AppError("Forbidden", 403);
  }

  const payload = addTicketMessageSchema.parse(req.body);
  const updated = await createTicketMessage({
    ticketId: req.params.id,
    userId: req.user.userId,
    message: payload.message
  });

  res.status(201).json({
    success: true,
    data: updated
  });
});

export const ticketManageRoles = [ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.SALES];
