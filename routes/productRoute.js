/*-----------------------------------*\
 * EXPRESS 
\*-----------------------------------*/
const express = require('express');


/*-----------------------------------*\
 * IMPORT CONTROLLER 
\*-----------------------------------*/
const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductDetails,
    createProductReview,
    getAdminProducts,
    deleteReview,
    getProductReviews,
} = require('../controllers/productController');


/*-----------------------------------*\
* IMPORT AUTH 
\*-----------------------------------*/
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');


/*-----------------------------------*\
 * ROUTER 
\*-----------------------------------*/
const router = express.Router();

router.route('/products').get(getAllProducts);

router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);

router.route("/product/:id").get(getProductDetails);

router.route("/admin/product/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct)
    .get(getProductDetails)

router.route("/review").put(isAuthenticatedUser, createProductReview);

router
    .route("/admin/products")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);


router
    .route("/reviews")
    .get(getProductReviews)
    .delete(isAuthenticatedUser, deleteReview);

/*-----------------------------------*\
 * EXPORTS 
\*-----------------------------------*/
module.exports = router;


