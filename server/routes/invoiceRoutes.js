const express = require("express");
const invoiceController = require("../controllers/invoiceController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));
router.route("/getInvoiceForPdf/:id").get(invoiceController.getInvoiceForPdf);

router
  .route("/createStandaloneInv")
  .post(invoiceController.createStandaloneInv);
router
  .route("/updateStandaloneInv/:id")
  .patch(invoiceController.updateStandaloneInv);

router.route("/stats").get(invoiceController.findOutstandinginvoices);

router.route("/searchBySO/:id").get(invoiceController.findInvoicesBySO);

router
  .route("/")
  .get(invoiceController.getAllInvoices)
  .post(invoiceController.createInvoice);

router
  .route("/:id")
  .get(invoiceController.getInvoice)
  .patch(invoiceController.updateInvoice)
  .delete(invoiceController.deleteInvoice);

module.exports = router;
