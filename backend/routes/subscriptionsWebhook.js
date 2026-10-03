const express = require("express");
const stripe = require("../config/stripe");
const Subscription = require("../models/Subscription");
const UserSubscription = require("../models/UserSubscription");

const router = express.Router();

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // 👈 RAW BUFFER (DO NOT TOUCH)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe signature error:", err.message);
    return res.status(400).send("Webhook Error");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("✅ Stripe payment completed:", session.id);

    const { userId, subscriptionId } = session.metadata;

    const exists = await UserSubscription.findOne({
      stripe_payment_intent: session.payment_intent,
    });
    if (!exists) {
      const plan = await Subscription.findById(subscriptionId);
      if (plan) {
        const billedMonths = Number(session.metadata?.months);
        const months = Number.isFinite(billedMonths) && billedMonths > 0
          ? billedMonths
          : (plan.duration || 12);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        await UserSubscription.updateMany(
          { user: userId },
          { isActive: false }
        );

        await UserSubscription.create({
          user: userId,
          subscription: plan._id,
          endDate,
          isActive: true,
          stripe_payment_intent: session.payment_intent,
          stripe_session_id: session.id,
        });
      }
    }
  }

  res.json({ received: true });
});

module.exports = router;
