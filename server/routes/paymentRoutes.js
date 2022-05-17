const express = require("express");
const paymentController = require("../controllers/paymentController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router
  .route("/")
  .get(paymentController.getAllPayments)
  .post(paymentController.createPayment);

router
  .route("/:id")
  .get(paymentController.getPayment)
  .patch(paymentController.updatePayment)
  .delete(paymentController.deletePayment);

module.exports = router;
