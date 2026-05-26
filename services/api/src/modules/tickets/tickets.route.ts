import { Router } from "express";

import { authenticate, authorize } from "../../middlewares/auth.middleware";
import {
  getAllTickets,
  getMyTickets,
  getTicketDetail,
  getTicketStats,
  patchTicket,
  postTicketMessage,
  postMyTicket,
  ticketManageRoles
} from "./tickets.controller";

export const ticketsRouter = Router();

ticketsRouter.use(authenticate);

ticketsRouter.post("/", postMyTicket);
ticketsRouter.get("/my", getMyTickets);
ticketsRouter.get("/stats", authorize(ticketManageRoles), getTicketStats);
ticketsRouter.get("/", authorize(ticketManageRoles), getAllTickets);
ticketsRouter.post("/:id/messages", postTicketMessage);
ticketsRouter.get("/:id", getTicketDetail);
ticketsRouter.patch("/:id", authorize(ticketManageRoles), patchTicket);
