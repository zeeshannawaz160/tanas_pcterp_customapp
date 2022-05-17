const express = require("express");
const productReceiptController = require("../controllers/productReceiptController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router.route("/procedure").post(productReceiptController.createProductReceipt);

router
  .route("/received/:id")
  .patch(productReceiptController.completeProductReceipt);

router
  .route("/searchByPO/:id")
  .get(productReceiptController.findProductreceiptsByPO);

router
  .route("/")
  .get(productReceiptController.getAll)
  .post(productReceiptController.createOne);

router
  .route("/:id")
  .get(productReceiptController.getOne)
  .patch(productReceiptController.updateOne)
  .delete(productReceiptController.deleteOne);

module.exports = router;
