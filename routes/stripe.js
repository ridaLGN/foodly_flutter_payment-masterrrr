const express = require("express");
const Stripe = require("stripe");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_SECRET);

const router = express.Router();

const checkoutSuccessPage = fs.readFileSync(
    path.join(__dirname, 'checkout-success.html')
  );
  
  router.get("/checkout-success", (req, res) => {
    res.set("Content-Type", "text/html");
    res.send(checkoutSuccessPage);
  });

  const checkoutCancel = fs.readFileSync(
    path.join(__dirname, 'cancel.html')
  );
  
  router.get("/cancel", (req, res) => {
    res.set("Content-Type", "text/html");
    res.send(checkoutCancel);
  });


router.post("/create-checkout-session", async (req, res) => {
  const customer = await stripe.customers.create({
    metadata: {
      userId: req.body.userId,
      cart: JSON.stringify(req.body.cartItems),
    },
  });

  console.log(req.body.cartItems);
  const line_items = req.body.cartItems.map((item) => {
    console.log("done....");
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: "This is a test product",
          metadata: {
            id: item.id,
            restaurantId: item.restaurantId,
          },
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    };
   
  });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
   
  
    phone_number_collection: {
      enabled: false,
    },
    line_items,
    mode: "payment",
    customer: customer.id,
    success_url: "https://foodlypaymentmasternv-production.up.railway.app/stripe/checkout-success",
    cancel_url:  "https://foodlypaymentmasternv-production.up.railway.app/stripe/cancel",
  });

  console.log(session.url);

  // res.redirect(303, session.url);
  res.send({ url: session.url });
});





module.exports = router;