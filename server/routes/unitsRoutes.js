const express = require("express");
const unitsController = require("../controllers/unitsController");
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
  .get(unitsController.getList)
router
  .route("/")
  .get(unitsController.getAllUOMs)
  .post(unitsController.createUOM);

router
  .route("/:id")
  .get(unitsController.getUOM)
  .patch(unitsController.updateUOM)
  .delete(unitsController.deleteUOM);

module.exports = router;
