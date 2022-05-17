const express = require("express");
const invoicePaymentController = require("../controllers/invoicePaymentController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router
  .route("/updateInvoicePayment/:id")
  .patch(invoicePaymentController.updateInvoicePayment);

router
  .route("/stansaloneInvoice")
  .get(invoicePaymentController.getAllInvoicePayments)
  .post(invoicePaymentController.createStandaloneInvoicePayment);

router
  .route("/")
  .get(invoicePaymentController.getAllInvoicePayments)
  .post(invoicePaymentController.createInvoicePayment);

router
  .route("/:id")
  .get(invoicePaymentController.getInvoicePayment)
  .patch(invoicePaymentController.updateInvoicePayment)
  .delete(invoicePaymentController.deleteInvoicePayment);

module.exports = router;
