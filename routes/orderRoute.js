/*-----------------------------------*\
 * EXPRESS 
\*-----------------------------------*/
const express = require('express');


/*-----------------------------------*\
 * IMPORT CONTROLLER 
\*-----------------------------------*/
const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrder,
    deleteOrder
} = require('../controllers/orderController');


/*-----------------------------------*\
* IMPORT AUTH 
\*-----------------------------------*/
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');


/*-----------------------------------*\
 * ROUTER 
\*-----------------------------------*/
const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder)

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, myOrders);

router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router.route("/admin/order/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);




/*-----------------------------------*\
 * EXPORTS 
\*-----------------------------------*/
module.exports = router;


