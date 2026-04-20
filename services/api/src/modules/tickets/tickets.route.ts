import { Router } from "express";

import { authenticate, authorize } from "../../middlewares/auth.middleware";
import {
  getAllTickets,
  getMyTickets,
  getTicketDetail,
  patchTicket,
  postMyTicket,
  ticketManageRoles
} from "./tickets.controller";

export const ticketsRouter = Router();

ticketsRouter.use(authenticate);

ticketsRouter.post("/", postMyTicket);
ticketsRouter.get("/my", getMyTickets);
ticketsRouter.get("/:id", getTicketDetail);

ticketsRouter.get("/", authorize(ticketManageRoles), getAllTickets);
ticketsRouter.patch("/:id", authorize(ticketManageRoles), patchTicket);
