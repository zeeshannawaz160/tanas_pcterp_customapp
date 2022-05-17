const express = require("express");
const productDeliveryController = require("../controllers/productDeliveryController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router
  .route("/procedure")
  .post(productDeliveryController.createDeliveryProduct);

router
  .route("/procedure/:id")
  .post(productDeliveryController.createDeliveryProductAfterDelete);

router
  .route("/procedure/delete/:id")
  .delete(productDeliveryController.deleteDeliveryProduct);

router
  .route("/delivered/:id")
  .patch(productDeliveryController.completeProductDelivery);

router
  .route("/searchBySO/:id")
  .get(productDeliveryController.findProductDeliveriesBySO);

router
  .route("/")
  .get(productDeliveryController.getAll)
  .post(productDeliveryController.createOne);

router
  .route("/:id")
  .get(productDeliveryController.getOne)
  .patch(productDeliveryController.updateOne)
  .delete(productDeliveryController.deleteOne);

module.exports = router;
