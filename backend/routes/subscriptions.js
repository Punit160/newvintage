// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const Subscription = require('../models/Subscription');
// const UserSubscription = require('../models/UserSubscription');
// const { auth, adminAuth } = require('../middleware/auth');
// const razorpay = require("../config/razorpay");
// const crypto = require("crypto");
// const router = express.Router();

// // @route   GET /api/subscriptions
// // @desc    Get all subscription plans
// // @access  Public
// router.get('/', async (req, res) => {
//   try {
//     const subscriptions = await Subscription.find({ isActive: true });
    
//     res.json({
//       success: true,
//       message: 'Subscription plans retrieved successfully',
//       data: subscriptions
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error retrieving subscription plans'
//     });
//   }
// });

// // @route   POST /api/subscriptions/subscribe
// // @desc    Subscribe to a plan
// // @access  Private
// router.post('/subscribe', [
//   auth,
//   body('subscriptionId').notEmpty().withMessage('Subscription ID is required')
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }

//     const { subscriptionId } = req.body;
//     const userId = req.user._id;

//     // Check if subscription exists
//     const subscription = await Subscription.findById(subscriptionId);
//     if (!subscription) {
//       return res.status(404).json({
//         success: false,
//         message: 'Subscription plan not found'
//       });
//     }

//     // Check if user already has active subscription
//     const existingSubscription = await UserSubscription.findOne({
//       user: userId,
//       isActive: true,
//       endDate: { $gt: new Date() }
//     });

//     if (existingSubscription) {
//       return res.status(400).json({
//         success: false,
//         message: 'You already have an active subscription'
//       });
//     }

//     // Create new subscription
//     const endDate = new Date();
//     endDate.setMonth(endDate.getMonth() + subscription.duration);

//     const userSubscription = await UserSubscription.create({
//       user: userId,
//       subscription: subscriptionId,
//       endDate
//     });

//     await userSubscription.populate(['user', 'subscription']);

//     res.status(201).json({
//       success: true,
//       message: 'Subscription activated successfully',
//       data: userSubscription
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error during subscription'
//     });
//   }
// });

// // @route   GET /api/subscriptions/my-subscription
// // @desc    Get user's current subscription
// // @access  Private
// router.get('/my-subscription', auth, async (req, res) => {
//   try {
//     const subscription = await UserSubscription.findOne({
//       user: req.user._id,
//       isActive: true,
//       endDate: { $gt: new Date() }
//     }).populate(['user', 'subscription']);

//     if (!subscription) {
//       return res.status(404).json({
//         success: false,
//         message: 'No active subscription found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Subscription retrieved successfully',
//       data: subscription
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Server error retrieving subscription'
//     });
//   }
// });


// router.post('/admin/create', [
//   adminAuth,
//   body('id').notEmpty().withMessage('ID is required'),
//   body('name').isIn(['Basic', 'Premium', 'Pro', 'Elite']).withMessage('Invalid subscription name'),
//   body('price').isNumeric().withMessage('Price must be a number'),
//   body('extraAmount').optional().isNumeric().withMessage('Extra amount must be a number'),
//   body('extraAmountT').optional().isString().withMessage('Extra amount text must be a string'),
//   body('yearlyPrice').optional().isNumeric(),
//   body('features').isArray().withMessage('Features must be an array of strings'),
//   body('extraBenefits').optional().isArray(),
//   body('paymentUrl').optional().isURL()
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array(),
//       });
//     }

//     // 🔥 Extract and safely convert number values
//     const price = Number(req.body.price);
//     const extraAmount = req.body.extraAmount && req.body.extraAmount !== ""
//       ? Number(req.body.extraAmount)
//       : 0;

//     const totalAmount = price + extraAmount;

//     // 🔥 Create subscription
//     const subscription = await Subscription.create({
//       id: req.body.id,
//       name: req.body.name,
//       price,
//       extraAmount,
//       totalAmount,  // 🆕 Save calculated amount
//       yearlyPrice: req.body.yearlyPrice ? Number(req.body.yearlyPrice) : undefined,
//       description: req.body.description || '',
//       extraAmountT: req.body.extraAmountT || '',
//       period: req.body.period || '/month',
//       savings: req.body.savings || '',
//       popular: req.body.popular || false,
//       features: req.body.features,
//       color: req.body.color || '#6B7280',
//       icon: req.body.icon || 'shield',
//       paymentUrl: req.body.paymentUrl || '',
//       extraBenefits: req.body.extraBenefits || [],
//       isActive: true
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Subscription plan created successfully',
//       data: subscription
//     });

//   } catch (error) {
//     console.error('Server error creating subscription plan:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error creating subscription plan'
//     });
//   }
// });



// module.exports = router;

//above PRODUCTION CODE
const express = require("express");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const stripe = require("../config/stripe");

const Subscription = require("../models/Subscription");
const UserSubscription = require("../models/UserSubscription");
const { auth, adminAuth } = require("../middleware/auth");
const razorpay = require("../config/razorpay");

const router = express.Router();

/* ================================
   GET PLANS
================================ */
router.get("/", async (req, res) => {
  const plans = await Subscription.find({ isActive: true });
  res.json({ success: true, data: plans });
});

/* ================================
   USER CURRENT SUBSCRIPTION
================================ */
router.get("/my-subscription", auth, async (req, res) => {
  const sub = await UserSubscription.findOne({
    user: req.user._id,
    isActive: true,
    endDate: { $gt: new Date() },
  }).populate("subscription");

  // if (!sub) {
  //   return res
  //     .status(404)
  //     .json({ success: false, message: "No active subscription" });
  // }
  if (!sub) {
  return res.json({
    success: true,
    data: null,
  });
}

  res.json({ success: true, data: sub });
});

/* ================================
   ADMIN CREATE PLAN
================================ */
router.post(
  "/admin/create",
  adminAuth,
  [
    body("id").notEmpty(),
    body("name").notEmpty(),
    body("price").isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const price = Number(req.body.price);
    const extraAmount = Number(req.body.extraAmount || 0);
    const totalAmount = price + extraAmount;

    const plan = await Subscription.create({
      ...req.body,
      price,
      extraAmount,
      totalAmount,
      isActive: true,
    });

    res.status(201).json({ success: true, data: plan });
  }
);

/* ================================
   STRIPE CHECKOUT
================================ */
router.post("/stripe-checkoutt", auth, async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const plan = await Subscription.findById(subscriptionId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const existing = await UserSubscription.findOne({
      user: req.user._id,
      isActive: true,
      endDate: { $gt: new Date() },
    });

    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Already subscribed" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: Math.round(plan.totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: req.user._id.toString(),
        subscriptionId: plan._id.toString(),
      },
      success_url: "myapp://payment-success",
      cancel_url: "myapp://payment-failed",
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Stripe Checkout Error ❌", err);
    res.status(500).json({ success: false });
  }
});
function isYearlyCheckout(body) {
  const interval = String(body.interval || body.billingCycle || "").toLowerCase();
  return interval === "year" || interval === "yearly" || interval === "annual";
}

function appReturnUrl(value, fallback) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (trimmed.startsWith("myapp://")) return trimmed;
  if (trimmed.startsWith("https://vintagecms.cloud/")) return trimmed;
  return fallback;
}

router.post("/stripe-checkout", auth, async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const plan = await Subscription.findById(subscriptionId);
    if (!plan || plan.isActive === false) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const yearly = isYearlyCheckout(req.body);
    const monthlyPrice = Number(plan.price);
    const yearlyPrice = Number(plan.yearlyPrice);
    const baseAmount = yearly
      ? (Number.isFinite(yearlyPrice) && yearlyPrice > 0 ? yearlyPrice : monthlyPrice * 12)
      : (Number.isFinite(monthlyPrice) && monthlyPrice > 0 ? monthlyPrice : Number(plan.totalAmount));
    const extraAmount = Number(req.body.extraAmount);
    const extraFee = Number.isFinite(extraAmount) && extraAmount > 0 ? extraAmount : 0;
    const charge = baseAmount + extraFee;

    if (!Number.isFinite(charge) || charge <= 0) {
      return res.status(400).json({ success: false, message: "Invalid plan price" });
    }

    const months = yearly ? 12 : 1;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: yearly ? `${plan.name} (yearly)` : plan.name,
              description: plan.description,
            },
            unit_amount: Math.round(charge * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: req.user._id.toString(),
        subscriptionId: plan._id.toString(),
        months: String(months),
        interval: yearly ? "year" : "month",
        extraAmount: String(extraFee),
      },
      success_url: appReturnUrl(
        req.body.success_url || req.body.successUrl,
        "myapp://payment-success"
      ),
      cancel_url: appReturnUrl(
        req.body.cancel_url || req.body.cancelUrl,
        "myapp://payment-cancel"
      ),
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Stripe error ❌", err);
    res.status(500).json({ success: false, message: "Unable to start checkout" });
  }
});



/* ================================
   STRIPE WEBHOOK (FINAL AUTHORITY)
================================ */

router.get("/admin/payments", adminAuth, async (req, res) => {
  try {
    const payments = await stripe.paymentIntents.list({
      limit: 50,
    });

    const formatted = payments.data.map(p => ({
      paymentId: p.id,
      amount: p.amount / 100,
      currency: p.currency,
      status: p.status,
      email: p.receipt_email,
      createdAt: new Date(p.created * 1000),
      metadata: p.metadata,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});
router.get("/payments/total", auth, async (req, res) => {
  try {
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });

    let totalINR = 0;

    sessions.data.forEach(s => {
      if (s.payment_status === "paid") {
        totalINR += s.amount_total; // in paise
      }
    });

    const totalInRupees = totalINR / 100;

    const EXCHANGE_RATE = 83; // 1 USD ≈ ₹83 (change anytime)
    const totalUSD = +(totalInRupees / EXCHANGE_RATE).toFixed(2);

    res.json({
      success: true,
      totalINR: totalInRupees,
      totalUSD: totalUSD,
      currency: {
        inr: "₹",
        usd: "$",
      }
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});




module.exports = router;



// //razorpay below
// router.post('/admin/create', [
//   adminAuth,
//   body('id').notEmpty().withMessage('ID is required'),
//   body('name').isIn(['Basic', 'Premium', 'Pro', 'Elite']).withMessage('Invalid subscription name'),
//   body('price').isNumeric().withMessage('Price must be a number'),
//   body('yearlyPrice').optional().isNumeric(),
//   body('features').isArray().withMessage('Features must be an array of strings'),
//   body('extraBenefits').optional().isArray()
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
//     }

//     const subscription = await Subscription.create({
//       id: req.body.id,
//       name: req.body.name,
//       price: Number(req.body.price),
//       yearlyPrice: req.body.yearlyPrice ? Number(req.body.yearlyPrice) : undefined,
//       description: req.body.description || '',
//       period: req.body.period || '/month',
//       savings: req.body.savings || '',
//       popular: req.body.popular || false,
//       features: req.body.features,
//       color: req.body.color || '#6B7280',
//       icon: req.body.icon || 'shield',
//       extraBenefits: req.body.extraBenefits || [],
//       isActive: true
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Subscription plan created successfully',
//       data: subscription
//     });

//   } catch (error) {
//     console.error('Server error creating subscription plan:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error creating subscription plan'
//     });
//   }
// });
// router.post("/razorpay-order", auth, async (req, res) => {
//   try {
//     const { subscriptionId } = req.body;

//     const plan = await Subscription.findById(subscriptionId);
//     if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

//     const order = await razorpay.orders.create({
//       amount: plan.price * 100,
//       currency: "INR",
//       receipt: "rcpt_" + Date.now(),
//       notes: { userId: req.user._id, subscriptionId }
//     });

//     res.json({
//       success: true,
//       orderId: order.id,
//       amount: order.amount,
//       currency: "INR",
//       key: process.env.RAZORPAY_KEY_ID
//     });

//   } catch (err) {
//     res.status(500).json({ success: false, message: "Order creation failed" });
//   }
// });

// router.post("/verify-payment", auth, async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       subscriptionId
//     } = req.body;

//     const sign = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSign = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(sign)
//       .digest("hex");

//     if (expectedSign !== razorpay_signature) {
//       return res.status(400).json({ success: false, message: "Invalid signature" });
//     }

//     const plan = await Subscription.findById(subscriptionId);
//     const endDate = new Date();
//     endDate.setMonth(endDate.getMonth() + plan.duration);

//     const userSubscription = await UserSubscription.create({
//       user: req.user._id,
//       subscription: subscriptionId,
//       endDate,
//       razorpay_order_id,
//       razorpay_payment_id
//     });

//     res.json({
//       success: true,
//       message: "Payment verified & subscription activated",
//       data: userSubscription
//     });

//   } catch (err) {
//     res.status(500).json({ success: false, message: "Verification failed" });
//   }
// });
