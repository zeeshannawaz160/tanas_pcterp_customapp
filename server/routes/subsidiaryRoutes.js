const express = require("express");
const subsidiaryController = require("../controllers/subsidiaryController");
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
  .get(subsidiaryController.getAllSibsidiaries)
  .post(subsidiaryController.createSibsidiary);

router
  .route("/:id")
  .get(subsidiaryController.getSibsidiary)
  .patch(subsidiaryController.updateSibsidiary)
  .delete(subsidiaryController.deleteSibsidiary);

module.exports = router;
