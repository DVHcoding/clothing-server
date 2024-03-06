// ##########################
const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ "path": "../.env" });

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

const Order = require("../models/orderModel");


router.post("/create-checkout-session", async (req, res) => {
    try {
        const customer = await stripe.customers.create({
            metadata: {
                userId: req.body.userId,
                cart: JSON.stringify(req.body.cartItems),
                orderInfo: JSON.stringify(req.body.orderInfo)
            }
        })


        const line_items = req.body.cartItems.map((item) => {
            return {
                price_data: {
                    currency: "vnd",
                    product_data: {
                        name: item.name,
                        images: [item.image],
                    },
                    unit_amount: item.price,
                },
                quantity: item.quantity,
            }
        });


        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            customer: customer.id,
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/order/confirm`,
        });

        res.send({ url: session.url });
    }
    catch (error) {
        const errorMessage = error.message.substring(0, 10);
        res.status(400).json({
            success: false,
            error: errorMessage
        })
    }
});


// Create order function
const createOrder = async (customer, data) => {

    // #################################### 
    const orderItems = JSON.parse(customer.metadata.cart);
    const orderInfors = JSON.parse(customer.metadata.orderInfo);

    // #################################### 
    const user = customer.metadata.userId;
    const shippingInfo = orderInfors.shippingInfo;
    const itemsPrice = orderInfors.itemsPrice;
    const taxPrice = orderInfors.taxPrice;
    const shippingPrice = orderInfors.shippingPrice;
    const totalPrice = orderInfors.totalPrice;
    const paymentInfo = {
        id: data.payment_intent,
        status: data.payment_status,
    }


    // #################################### 
    try {
        await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: Date.now(),
            user,
        });
    } catch (error) {
        console.log(error);
    }
};


// Stripe webhoook
router.post(
    "/webhook",
    express.json({ type: "application/json" }),
    async (req, res) => {
        let data;
        let eventType;
        let webhookSecret = process.env.WEBHOOK_SECRET;

        if (webhookSecret) {
            let event;
            let signature = req.headers["stripe-signature"];

            try {
                event = stripe.webhooks.constructEvent(
                    req.body,
                    signature,
                    webhookSecret
                );
            } catch (err) {
                console.log(`⚠️  Webhook signature verification failed:  ${err}`);
                return res.sendStatus(400);
            }
            // Extract the object from the event.
            data = event.data.object;
            eventType = event.type;
        } else {
            // Webhook signing is recommended, but if the secret is not configured in `config.js`,
            // retrieve the event data directly from the request body.
            data = req.body.data.object;
            eventType = req.body.type;
        }

        // Handle the checkout.session.completed event
        if (eventType === "checkout.session.completed") {
            stripe.customers
                .retrieve(data.customer)
                .then(async (customer) => {
                    try {
                        createOrder(customer, data);
                    } catch (err) {
                        console.log(err);
                    }
                })
                .catch((err) => console.log(err.message));
        }

        res.status(200).end();
    }
);


module.exports = router;
