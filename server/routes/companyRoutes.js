const express = require("express");
const companyController = require("../controllers/companyController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");
const multer = require("multer");
const path = require("path");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.protect);
router.use(authController.protect(Employee));

router.route("/getCompanyImage").get(companyController.getCompanyImage);

router
  .route("/")
  .get(companyController.getAllCompanies)
  .post(companyController.createCompany);

router
  .route("/:id")
  .get(companyController.getCompany)
  .patch(companyController.updateCompany)
  .delete(companyController.deleteCompany);

module.exports = router;
