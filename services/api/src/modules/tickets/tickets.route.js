const express = require("express");

const { verifyToken, requireRole, ROLES } = require("../../middlewares/auth.middleware");
const controller = require("./tickets.controller");
const {
  validateCreateTicket,
  validateUpdateTicket,
  validateAddTicketMessage
} = require("./tickets.validation.middleware");

const router = express.Router();

router.use(verifyToken);

router.post("/", validateCreateTicket, controller.createTicket);
router.get("/my", controller.getMyTickets);
router.get("/", requireRole(ROLES.ADMIN, ROLES.SALES_STAFF, ROLES.TECH_STAFF), controller.getAllTickets);
router.get("/:ticketId", controller.getTicketDetail);
router.post("/:ticketId/messages", validateAddTicketMessage, controller.addTicketMessage);
router.patch("/:ticketId", requireRole(ROLES.ADMIN, ROLES.SALES_STAFF, ROLES.TECH_STAFF), validateUpdateTicket, controller.updateTicket);

module.exports = router;
