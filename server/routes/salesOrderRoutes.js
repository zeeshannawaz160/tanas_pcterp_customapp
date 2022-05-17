const express = require("express");
const salesOrderController = require("../controllers/salesOrderController");
const Employee = require("../models/employeeModel");
const authController = require("../controllers/authController");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.restrictTo('admin', 'lead-guide'));
router.use(authController.protect(Employee));

router.route("/list").get(salesOrderController.getUnInvoicedList);

router.route("/salesAnalysis").get(salesOrderController.getSalesAnalysis);

router.route("/procedure/").post(salesOrderController.createSalesOrder);
router.route("/procedure/:id").patch(salesOrderController.updateSalesOrder);
router.route("/delete/:id").delete(salesOrderController.deleteSalesOrder);

router
  .route("/decreseProductOnhandAndAvailabel/:id")
  .patch(salesOrderController.decreseProductOnhandAndAvailabel);

router
  .route("/")
  .get(salesOrderController.getAll)
  .post(salesOrderController.createOne);

router
  .route("/:id")
  .get(salesOrderController.getOne)
  .patch(salesOrderController.updateOne)
  .delete(salesOrderController.deleteOne);

module.exports = router;
