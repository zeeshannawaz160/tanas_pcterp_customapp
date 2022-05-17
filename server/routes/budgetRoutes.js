const express = require("express");
const budgetController = require("../controllers/budgetController");
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
  .get(budgetController.getAllBudgets)
  .post(budgetController.createBudget);

router
  .route("/:id")
  .get(budgetController.getBudget)
  .patch(budgetController.updateBudget)
  .delete(budgetController.deleteBudget);

module.exports = router;
