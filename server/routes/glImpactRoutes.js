const express = require("express");
const glImpactController = require("../controllers/glImpactController");
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
  .get(glImpactController.getAllGLImpacts)
  .post(glImpactController.createGLImpact);

router
  .route("/:id")
  .get(glImpactController.getGLImpact)
  .patch(glImpactController.updateGLImpact)
  .delete(glImpactController.deleteGLImpact);

module.exports = router;
