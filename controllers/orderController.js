/*-----------------------------------*\
 * IMPORT ORDER MODEL
\*-----------------------------------*/
const Order = require("../models/orderModel");

/*-----------------------------------*\
 * IMPORT PRODUCT MODEL
\*-----------------------------------*/
const Product = require('../models/productModel');

/*-----------------------------------*\
 * IMPORT MIDDLEWARE
\*-----------------------------------*/
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncError');



/*-----------------------------------*\
 * CREATE NEW ORDER
\*-----------------------------------*/
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    res.status(201).json({
        success: true,
        order,
    });
});




/*-----------------------------------*\
 * GET SINGLE ORDER
\*-----------------------------------*/
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {

    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));;
    }

    res.status(200).json(
        {
            success: true,
            order,
        }
    );
});



/*-----------------------------------*\
 * GET LOGGED IN USER ORDER
\*-----------------------------------*/
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        orders,
    });
});



/*-----------------------------------*\
 * GET ALL ORDER -- ADMIN
\*-----------------------------------*/
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
});



/*-----------------------------------*\
 * UPDATE ORDER STATUS -- ADMIN
\*-----------------------------------*/
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("You have already delivered this order", 400));
    }

    if (req.body.status === "Shipped") {
        order.orderItems.forEach(async (o) => {
            await updateStock(o.product, o.quantity);
        });
    }

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
    });
});




/*-----------------------------------*\
 * UPDATE STOCK 
\*-----------------------------------*/
async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({ validateBeforeSave: false });
}



/*-----------------------------------*\
 * DELETE ORDER -- ADMIN
\*-----------------------------------*/
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
    });
});

