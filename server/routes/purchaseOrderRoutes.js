const express = require("express");
const purchaseOrderController = require("../controllers/purchaseOrderController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

router.use(authController.protect(Employee));
// router.use(authController.restrictTo("PURCHASE_ORDER"));

router
  .route("/purchaseAnalysis")
  .get(purchaseOrderController.getPurchaseAnalysis);

// router.route("/procedure/").post(purchaseOrderController.createPurchaseOrder);
// router
//   .route("/procedure/")
//   .post(purchaseOrderController.createPurchaseOrder);

// router
//   .route("/procedure/:id")
//   .patch(purchaseOrderController.updatePurchaseOrder);

router
  .route("/increaseProductQty/:id")
  .patch(purchaseOrderController.increaseProductQty);

router
  .route("/unbilled/list")
  .get(purchaseOrderController.getUnbilledList)

router
  .route("/")
  .get(purchaseOrderController.getAll)
  .post(purchaseOrderController.createPurchaseOrder);

router
  .route("/:id")
  .get(purchaseOrderController.getOne)
  .patch(purchaseOrderController.updatePurchaseOrder)
  .delete(purchaseOrderController.deletePurchaseOrder);

router
  .route('/:id/histories')
  .get(purchaseOrderController.getHistories)

module.exports = router;
