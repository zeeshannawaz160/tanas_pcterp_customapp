const express = require("express");
const loginAuditController = require("../controllers/loginAuditController");
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
  .get(loginAuditController.getAllLoginAudits)
  .post(loginAuditController.createLoginAudit);

router
  .route("/:id")
  .get(loginAuditController.getLoginAudit)
  .patch(loginAuditController.updateLoginAudit)
  .delete(loginAuditController.deleteLoginAudit);

module.exports = router;
