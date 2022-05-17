const express = require("express");
const billPaymentController = require("../controllers/billPaymentController");
const authController = require("../controllers/authController");

const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));
router.route("/findBillsById/:id").get(billPaymentController.findBillsById);

router
  .route("/createStandaloneBillPayment")
  .post(billPaymentController.createStandaloneBillPayment);

router
  .route("/updateBillPaymentAndBill/:id")
  .patch(billPaymentController.updateBillPaymentAndBill);

router
  .route("/")
  .get(billPaymentController.getAllBillPayments)
  .post(billPaymentController.createBillPayment);

router
  .route("/:id")
  .get(billPaymentController.getBillPayment)
  .patch(billPaymentController.updateBillPayment)
  .delete(billPaymentController.deleteBillPayment);

module.exports = router;
