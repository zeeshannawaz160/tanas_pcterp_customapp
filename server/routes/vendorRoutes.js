const express = require("express");
const vendorController = require("../controllers/vendorController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router
  .route("/list")
  .get(vendorController.getList)

router
  .route("/")
  .get(vendorController.getAllVendors)
  .post(vendorController.createVendor);

router
  .route("/:id")
  .get(vendorController.getVendor)
  .patch(vendorController.updateVendor)
  .delete(vendorController.deleteVendor);

router
  .route("/:id/histories")
  .get(vendorController.getHistories)

module.exports = router;
