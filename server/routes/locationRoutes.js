const express = require("express");
const locationController = require("../controllers/locationController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));
router.route("/list").get(locationController.getList);

router
  .route("/")
  .get(locationController.getAll)
  .post(locationController.createOne);

router
  .route("/:id")
  .get(locationController.getOne)
  .patch(locationController.updateOne)
  .delete(locationController.deleteOne);

module.exports = router;
