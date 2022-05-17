const express = require("express");
const priceChartUploadController = require("../controllers/priceChartUploadController");
const authController = require("../controllers/authController");

const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router.route("/procedure").post(priceChartUploadController.createPriceChart);

router.route("/procedure").delete(priceChartUploadController.deletePriceChart);

router.route("/findMRP").patch(priceChartUploadController.findMRP);

router
  .route("/")
  .get(priceChartUploadController.getAll)
  .post(priceChartUploadController.createOne);

router
  .route("/:id")
  .get(priceChartUploadController.getOne)
  .patch(priceChartUploadController.updateOne)
  .delete(priceChartUploadController.deleteOne);

module.exports = router;
