const express = require("express");
const sizeListController = require("../controllers/sizeListController");
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
  .get(sizeListController.getAll)
  .post(sizeListController.createOne);

router
  .route("/:id")
  .get(sizeListController.getOne)
  .patch(sizeListController.updateOne)
  .delete(sizeListController.deleteOne);

module.exports = router;
