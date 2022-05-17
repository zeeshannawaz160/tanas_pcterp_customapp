const express = require("express");
const listController = require("../controllers/listController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router.route("/search").get(listController.getListBySchemaId);

router
  .route("/")
  .get(listController.getAllLists)
  .post(listController.createList);

router
  .route("/:id")
  .get(listController.getList)
  .patch(listController.updateList)
  .delete(listController.deleteList);

module.exports = router;
