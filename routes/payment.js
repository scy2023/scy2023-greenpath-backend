import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = process.env.STRIPE_SECRET ? new Stripe(process.env.STRIPE_SECRET) : null;

router.post("/checkout", async (req, res) => {
  if (!stripe) return res.status(503).json({ error: "Stripe not configured" });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: { name: "GreenPath Premium", description: "Detailed skill roadmap + unlimited analyses" },
          unit_amount: 499,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/dashboard?premium=true`,
    cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
  });

  res.json({ url: session.url });
});

export default router;