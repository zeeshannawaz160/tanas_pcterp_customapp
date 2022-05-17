const express = require("express");
const departmentController = require("../controllers/departmentController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));
router.route("/list").get(departmentController.getList);

router
  .route("/")
  .get(departmentController.getAll)
  .post(departmentController.createOne);

router
  .route("/:id")
  .get(departmentController.getOne)
  .patch(departmentController.updateOne)
  .delete(departmentController.deleteOne);

module.exports = router;
