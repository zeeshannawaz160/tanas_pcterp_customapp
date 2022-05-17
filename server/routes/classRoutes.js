const express = require("express");
const classController = require("../controllers/classController");
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
  .get(classController.getAllClasss)
  .post(classController.createClass);

router
  .route("/:id")
  .get(classController.getClass)
  .patch(classController.updateClass)
  .delete(classController.deleteClass);

module.exports = router;
