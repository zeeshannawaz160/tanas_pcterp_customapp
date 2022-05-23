const express = require("express");
const setupController = require("../controllers/setupController");
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
  .get(setupController.getAllSetup)
  .post(setupController.createSetup);

router
  .route("/:id")
  .get(setupController.getSetup)
  .patch(setupController.updateSetup)
  .delete(setupController.deleteSetup);

module.exports = router;
