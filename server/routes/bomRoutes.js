const express = require("express");
const bomController = require("../controllers/bomController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router.route("/list").get(bomController.getList);

router
  .route("/getProductsOnlyContainBOM/list")
  .get(bomController.getProductsOnlyContainBOM);

router.route("/searchBomByItem/:id").get(bomController.searchBOMByItem);


router.route("/").get(bomController.getAll).post(bomController.createOne);


router
  .route("/:id")
  .get(bomController.getOne)
  .patch(bomController.updateOne)
  .delete(bomController.deleteOne);

module.exports = router;
