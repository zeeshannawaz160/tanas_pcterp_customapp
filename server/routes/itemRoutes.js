const express = require("express");
const itemController = require("../controllers/itemController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router.route("/sumOf/onHand/:id").post(itemController.updateOnHandQuantity);

router.route("/search/:name").get(itemController.getItemByName);

router
  .route("/")
  .get(itemController.getAllItems)
  .post(itemController.createItem);

router
  .route("/:id")
  .get(itemController.getItem)
  .patch(itemController.updateItem)
  .delete(itemController.deleteItem);

module.exports = router;
