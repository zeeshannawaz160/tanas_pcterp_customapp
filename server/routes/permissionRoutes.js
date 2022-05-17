const express = require("express");
const permissionController = require("../controllers/permissionController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router.route("/list").get(permissionController.getList);
router
  .route("/")
  .get(permissionController.getAll)
  .post(permissionController.createOne);

router
  .route("/:id")
  .get(permissionController.getOne)
  .patch(permissionController.updateOne)
  .delete(permissionController.deleteOne);

module.exports = router;
