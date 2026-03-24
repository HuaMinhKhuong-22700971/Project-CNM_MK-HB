const { createError, toPositiveInteger } = require("../../utils/service-helpers");

const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function validateCreateTicket(req, _res, next) {
  try {
    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim();
    const priority = String(req.body?.priority || "MEDIUM").trim().toUpperCase();

    if (!title) {
      throw createError("title is required", 400);
    }

    if (!description) {
      throw createError("description is required", 400);
    }

    if (!TICKET_PRIORITIES.includes(priority)) {
      throw createError(`priority must be one of: ${TICKET_PRIORITIES.join(", ")}`, 400);
    }

    req.validatedTicketPayload = {
      title,
      description,
      priority
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

function validateUpdateTicket(req, _res, next) {
  try {
    const payload = {};

    if (Object.prototype.hasOwnProperty.call(req.body || {}, "status")) {
      const status = String(req.body.status || "").trim().toUpperCase();

      if (!TICKET_STATUSES.includes(status)) {
        throw createError(`status must be one of: ${TICKET_STATUSES.join(", ")}`, 400);
      }

      payload.status = status;
    }

    if (Object.prototype.hasOwnProperty.call(req.body || {}, "priority")) {
      const priority = String(req.body.priority || "").trim().toUpperCase();

      if (!TICKET_PRIORITIES.includes(priority)) {
        throw createError(`priority must be one of: ${TICKET_PRIORITIES.join(", ")}`, 400);
      }

      payload.priority = priority;
    }

    if (Object.prototype.hasOwnProperty.call(req.body || {}, "assignedToId")) {
      payload.assignedToId = req.body.assignedToId === null ? null : toPositiveInteger(req.body.assignedToId, "assignedToId");
    }

    if (Object.keys(payload).length === 0) {
      throw createError("At least one ticket field is required for update", 400);
    }

    req.validatedTicketPayload = payload;
    return next();
  } catch (error) {
    return next(error);
  }
}

function validateAddTicketMessage(req, _res, next) {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      throw createError("message is required", 400);
    }

    req.validatedTicketMessagePayload = { message };
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  validateCreateTicket,
  validateUpdateTicket,
  validateAddTicketMessage,
  TICKET_PRIORITIES,
  TICKET_STATUSES
};
