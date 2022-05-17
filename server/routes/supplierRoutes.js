const express = require("express");
const supplierController = require("../controllers/supplierController");
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
  .get(supplierController.getAllSuppliers)
  .post(supplierController.createSupplier);

router
  .route("/:id")
  .get(supplierController.getSupplier)
  .patch(supplierController.updateSupplier)
  .delete(supplierController.deleteSupplier);

module.exports = router;
