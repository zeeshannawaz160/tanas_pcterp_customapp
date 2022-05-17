const express = require("express");
const productController = require("./productController");
const authController = require("../controllers/authController");

// ROUTES
const router = express.Router();

// Public Routes
// Role Specified Routes
// router.use(authController.restrictTo('admin', 'lead-guide'));
router.use(authController.protect());

//
router.route("/search/:name").get(productController.getItemByName);
router.route("/list").get(productController.productList);
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

router
    .route('/:id/histories')
    .get(productController.getHistories)

module.exports = router;
