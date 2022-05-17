const express = require("express");
const billController = require("../controllers/billController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

router.use(authController.protect(Employee));

router.route("/stansaloneBill").post(billController.stansaloneBillCreate);
router
  .route("/updateStansaloneBill/:id")
  .patch(billController.updateStansaloneBill);

router.route("/getStandalonebill").get(billController.getStandalonebill);
router.route("/getBillByName").post(billController.getBillByName);
router.route("/getunusedBill/list").get(billController.getunusedBill);

router.route("/stats").get(billController.findOutstandingBills);
router.route("/forpdf/:id").get(billController.getBillForPdf);

router.route("/searchByPO/:id").get(billController.findBillsByPO);

router
  .route("/")
  .get(billController.getAllBills)
  .post(billController.createBill);

router
  .route("/:id")
  .get(billController.getBill)
  .patch(billController.updateBill)
  .delete(billController.deleteBill);

module.exports = router;

//OLD CODE

// router.route("/stansaloneBill").post(billController.stansaloneBillCreate);
// router
//   .route("/updateStansaloneBill/:id")
//   .patch(billController.updateStansaloneBill);

// router.route("/getStandalonebill").get(billController.getStandalonebill);
// router.route("/getBillByName").post(billController.getBillByName);

// router.route("/stats").get(billController.findOutstandingBills);
// router.route("/forpdf/:id").get(billController.getBillForPdf);

// router.route("/searchByPO/:id").get(billController.findBillsByPO);

// router
//   .route("/")
//   .get(billController.getAllBills)
//   .post(billController.createBill);

// router
//   .route("/:id")
//   .get(billController.getBill)
//   .patch(billController.updateBill)
//   .delete(billController.deleteBill);

// module.exports = router;
