const express = require("express");
const accountTypeController = require("../controllers/accountTypeController");
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
  .get(accountTypeController.getList)

router
  .route("/")
  .get(accountTypeController.getAllAccountTypes)
  .post(accountTypeController.createAccountType);

router
  .route("/:id")
  .get(accountTypeController.getAccountType)
  .patch(accountTypeController.updateAccountType)
  .delete(accountTypeController.deleteAccountType);

module.exports = router;
