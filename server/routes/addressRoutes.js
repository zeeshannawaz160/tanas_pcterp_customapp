const express = require("express");

const addressController = require("../controllers/addressController");

// ROUTES

const router = express.Router();

// Public Routes

router.get("/", addressController.getCountriesAndStates);

router.get("/countries", addressController.getCountries);

router.get("/states/:id", addressController.getStates);

module.exports = router;
