const express = require("express");
const generalLedgerController = require("../controllers/generalLedgerController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router
  .route("/stats/groupByAccount")
  .get(generalLedgerController.groupByAccount);

router
  .route("/")
  .get(generalLedgerController.getAllGeneralLedgers)
  .post(generalLedgerController.createGeneralLedger);

router
  .route("/:id")
  .get(generalLedgerController.getGeneralLedger)
  .patch(generalLedgerController.updateGeneralLedger)
  .delete(generalLedgerController.deleteGeneralLedger);

module.exports = router;
