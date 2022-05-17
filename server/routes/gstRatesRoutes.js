const express = require("express");
const gstRatesController = require("../controllers/gstRatesController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router
  .route("/list")
  .get(gstRatesController.getList)


router
  .route("/")
  .get(gstRatesController.getAllGSTRatess)
  .post(gstRatesController.createGSTRates);

router
  .route("/:id")
  .get(gstRatesController.getGSTRates)
  .patch(gstRatesController.updateGSTRates)
  .delete(gstRatesController.deleteGSTRates);

module.exports = router;
