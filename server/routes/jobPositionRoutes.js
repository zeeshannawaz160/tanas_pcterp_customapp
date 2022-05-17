const express = require("express");
const jobPositionController = require("../controllers/jobPositionController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.restrictTo('admin', 'lead-guide'));
router.use(authController.protect(Employee));
router.route("/list").get(jobPositionController.getList);

router
  .route("/")
  .get(jobPositionController.getAll)
  .post(jobPositionController.createOne);

router
  .route("/:id")
  .get(jobPositionController.getOne)
  .patch(jobPositionController.updateOne)
  .delete(jobPositionController.deleteOne);

module.exports = router;
