import express from "express";
import Stripe from "stripe";

const router = express.Router();

const stripe = process.env.STRIPE_SECRET ? new Stripe(process.env.STRIPE_SECRET) : null;

router.post("/checkout", async (req, res) => {
  if (!stripe) return res.status(503).json({ error: "Stripe not configured yet" });
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: { name: "Premium Plan" },
          unit_amount: 999,
        },
        quantity: 1,
      },
    ],
    success_url: "http://localhost:3000",
    cancel_url: "http://localhost:3000",
  });

  res.json({ url: session.url });
});
export default router;
