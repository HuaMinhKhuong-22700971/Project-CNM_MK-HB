const { sendSuccess } = require("../../utils/api-response");
const asyncHandler = require("../../utils/async-handler");
const ticketsService = require("./tickets.service");
const { recordAuditLog } = require("../../services/audit-log.service");

const createTicket = asyncHandler(async (req, res) => {
  const result = await ticketsService.createTicket(req.user.id, req.validatedTicketPayload);
  await recordAuditLog({
    actorUserId: req.user?.id,
    actorRole: req.user?.role,
    action: "TICKET_CREATED",
    entityType: "TICKET",
    entityId: result?.id,
    description: `Created ticket #${result?.id}`,
    metadata: { priority: result?.priority, status: result?.status }
  });
  return sendSuccess(res, "Ticket created successfully", result, 201);
});

const getMyTickets = asyncHandler(async (req, res) => {
  const result = await ticketsService.getMyTickets(req.user.id);
  return sendSuccess(res, "My tickets fetched successfully", result);
});

const getTicketDetail = asyncHandler(async (req, res) => {
  const result = await ticketsService.getTicketDetail(req.user, req.params.ticketId);
  return sendSuccess(res, "Ticket detail fetched successfully", result);
});

const getAllTickets = asyncHandler(async (req, res) => {
  const result = await ticketsService.listTickets(req.user, req.query || {});
  return sendSuccess(res, "Tickets fetched successfully", result);
});

const updateTicket = asyncHandler(async (req, res) => {
  const result = await ticketsService.updateTicket(req.user, req.params.ticketId, req.validatedTicketPayload);
  await recordAuditLog({
    actorUserId: req.user?.id,
    actorRole: req.user?.role,
    action: "TICKET_UPDATED",
    entityType: "TICKET",
    entityId: req.params.ticketId,
    description: `Updated ticket #${req.params.ticketId}`,
    metadata: req.validatedTicketPayload
  });
  return sendSuccess(res, "Ticket updated successfully", result);
});

const addTicketMessage = asyncHandler(async (req, res) => {
  const result = await ticketsService.addTicketMessage(req.user, req.params.ticketId, req.validatedTicketMessagePayload);
  await recordAuditLog({
    actorUserId: req.user?.id,
    actorRole: req.user?.role,
    action: "TICKET_MESSAGE_ADDED",
    entityType: "TICKET",
    entityId: req.params.ticketId,
    description: `Added message to ticket #${req.params.ticketId}`
  });
  return sendSuccess(res, "Ticket message added successfully", result, 201);
});

module.exports = {
  createTicket,
  getMyTickets,
  getTicketDetail,
  getAllTickets,
  updateTicket,
  addTicketMessage
};
