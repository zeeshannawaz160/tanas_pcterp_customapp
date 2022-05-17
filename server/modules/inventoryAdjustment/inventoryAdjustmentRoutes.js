const express = require("express");
const inventoryAdjustmentController = require("./inventoryAdjustmentController");
const authController = require("../../controllers/authController");
const Employee = require("../../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router
    .route("/")
    .get(inventoryAdjustmentController.getAllInventoryAdjustments)
    .post(inventoryAdjustmentController.createInventoryAdjustment);

router
    .route("/:id")
    .get(inventoryAdjustmentController.getInventoryAdjustment)
    .patch(inventoryAdjustmentController.updateInventoryAdjustment)
    .delete(inventoryAdjustmentController.deleteInventoryAdjustment);

module.exports = router;
