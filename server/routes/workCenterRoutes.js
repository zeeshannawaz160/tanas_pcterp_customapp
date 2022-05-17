const express = require("express");
const workCenterController = require("../controllers/workCenterController");
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
  .get(workCenterController.getList)

router
  .route("/")
  .get(workCenterController.getAll)
  .post(workCenterController.createOne);

router
  .route("/:id")
  .get(workCenterController.getOne)
  .patch(workCenterController.updateOne)
  .delete(workCenterController.deleteOne);

module.exports = router;
