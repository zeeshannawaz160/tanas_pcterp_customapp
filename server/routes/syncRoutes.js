const express = require("express");
const syncController = require("../controllers/syncController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router.route("/").get(syncController.getAll).post(syncController.createOne);

router
  .route("/:id")
  .get(syncController.getOne)
  .patch(syncController.updateOne)
  .delete(syncController.deleteOne);

module.exports = router;
