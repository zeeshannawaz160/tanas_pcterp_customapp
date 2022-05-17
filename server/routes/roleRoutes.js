const express = require("express");
const roleController = require("../controllers/roleController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router.route("/list").get(roleController.roleList);

router.route("/").get(roleController.getAll).post(roleController.createOne);

router
  .route("/:id")
  .get(roleController.getOne)
  .patch(roleController.updateOne)
  .delete(roleController.deleteOne);

router
  .route('/:id/histories')
  .get(roleController.getHistories)

module.exports = router;
