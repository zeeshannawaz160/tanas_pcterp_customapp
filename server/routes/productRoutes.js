const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");
const Employee = require("../models/employeeModel");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.restrictTo('admin', 'lead-guide'));
router.use(authController.protect(Employee));

//
router.route("/import").post(productController.importProduct);

router.route("/search/:name").get(productController.getItemByName);

router.route("/list").get(productController.productList);

router
  .route("/getIncomeExpenseAssetAccount")
  .get(productController.getIncomeExpenseAssetAccount);
//

router.route("/procedure").post(productController.productCreate);

router.route("/barcode/:barcode").get(productController.getProductByBarcode);

router
  .route("/increase/onHand/:id")
  .patch(productController.increaseOnHandQuantity);

router
  .route("/decrease/onHand/:id")
  .patch(productController.decreaseOnHandQuantity);

router.route("/getHsnByProduct").patch(productController.getHsnByProduct);

router
  .route("/")
  .get(productController.getAllProducts)
  .post(productController.createProduct);

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

router.route("/:id/histories").get(productController.getHistories);

module.exports = router;
