const express = require("express");
const accountController = require("../controllers/accountController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();
router.use(authController.protect(Employee));
// Public Routes
// Role Specified Routes

router.route("/").get(accountController.getAllAccounts);

// router.use(authController.restrictTo("GL"));


router
  .route("/list")
  .get(accountController.getList)

router
  .route("/")
  .get(accountController.getAllAccounts)
  .post(accountController.createAccount);

router
  .route("/:id")
  .get(accountController.getAccount)
  .patch(accountController.updateAccount)
  .delete(accountController.deleteAccount);

module.exports = router;
