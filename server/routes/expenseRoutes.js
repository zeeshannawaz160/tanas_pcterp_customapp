const express = require("express");
const expenseController = require("../controllers/expenseController");
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
  .get(expenseController.getAllExpenses)
  .post(expenseController.createExpense);

router
  .route("/:id")
  .get(expenseController.getExpense)
  .patch(expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

module.exports = router;
