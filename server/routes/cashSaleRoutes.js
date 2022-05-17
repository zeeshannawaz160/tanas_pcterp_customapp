const express = require("express");
const cashSaleController = require("../controllers/cashSaleController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.restrictTo('admin', 'lead-guide'));
router.use(authController.protect(Employee));

router
  .route("/generalLedger/:id")
  .get(cashSaleController.getOrdersGeneralLedger);

router.route("/report").get(cashSaleController.getProductsSalesReport);

router.route("/reports").get(cashSaleController.getProductReport);

router
  .route("/")
  .get(cashSaleController.getAll)
  .post(cashSaleController.createOne);

router
  .route("/:id")
  .get(cashSaleController.getOne)
  .patch(cashSaleController.updateOne)
  .delete(cashSaleController.deleteOne);

module.exports = router;

//Old code

// const express = require("express");
// const cashSaleController = require("../controllers/cashSaleController");
// const authController = require("../controllers/authController");

// // ROUTES
// const router = express.Router();

// // Public Routes
// // Role Specified Routes
// // router.use(authController.restrictTo('admin', 'lead-guide'));
// router.route("/report").get(cashSaleController.getProductsSalesReport);

// router.route("/reports").get(cashSaleController.getProductReport);

// router
//   .route("/")
//   .get(cashSaleController.getAll)
//   .post(cashSaleController.createOne);

// router
//   .route("/:id")
//   .get(cashSaleController.getOne)
//   .patch(cashSaleController.updateOne)
//   .delete(cashSaleController.deleteOne);

// module.exports = router;
