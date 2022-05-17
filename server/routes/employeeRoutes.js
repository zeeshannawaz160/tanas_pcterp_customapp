const express = require("express");
const employeeController = require("../controllers/employeeController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword/:token", authController.resetPassword);

// Protect all routes after this middleware

router.patch(
  "/updateMyPassword",
  authController.oldprotect,
  authController.updatePassword
);

// Protect all routes after this middleware

router.route("/list").get(employeeController.employeeList);

router.use(authController.protect(Employee));

router
  .route("/")
  .get(employeeController.getAllEmployee)
  .post(employeeController.createOne);

router
  .route("/:id")
  .get(employeeController.getOne)
  .patch(employeeController.updateOne)
  .delete(employeeController.deleteOne);

router
  .route('/:id/histories')
  .get(employeeController.getHistories)

module.exports = router;
