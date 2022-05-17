const express = require("express");
const itemCategoryController = require("../controllers/itemCategoryController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router.route("/search").get(itemCategoryController.getCategoryBySchemaId);

router
  .route("/")
  .get(itemCategoryController.getAllCategory)
  .post(itemCategoryController.createCategory);

router
  .route("/:id")
  .get(itemCategoryController.getCategory)
  .patch(itemCategoryController.updateCategory)
  .delete(itemCategoryController.deleteCategory);

module.exports = router;
