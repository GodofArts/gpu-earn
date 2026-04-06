/**
 * Subscription Controller
 * Handles subscription management (upgrades, cancellations)
 */

const db = require('../config/database');
const stripeService = require('../services/stripeService');
const yookassaService = require('../services/yookassaService');

/**
 * Get user's current subscription
 */
const getCurrentSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;

    const subscription = await db.get(
      `SELECT id, type, status, expires_at, stripe_subscription_id, yookassa_subscription_id
       FROM subscriptions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found',
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (err) {
    console.error('Get subscription error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
    });
  }
};

/**
 * Upgrade to Pro subscription
 */
const upgradeSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subscriptionType = 'pro_monthly', paymentMethod = 'stripe' } = req.body;

    // Validate subscription type
    if (!['pro_monthly', 'pro_yearly'].includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription type',
      });
    }

    // Get user
    const user = await db.get('SELECT email, username FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let session;

    if (paymentMethod === 'stripe') {
      // Get or create Stripe customer
      const stripeCustomer = await stripeService.createOrGetCustomer(
        userId,
        user.email,
        user.username
      );

      // Update user's Stripe customer ID
      await db.run(
        'UPDATE users SET stripe_customer_id = ? WHERE id = ?',
        [stripeCustomer.id, userId]
      );

      // Create subscription session
      session = await stripeService.createSubscriptionSession(
        userId,
        subscriptionType,
        stripeCustomer.id
      );

      return res.status(200).json({
        success: true,
        message: 'Subscription checkout session created',
        data: {
          checkoutUrl: session.url,
          sessionId: session.id,
          paymentMethod: 'stripe',
        },
      });
    } else if (paymentMethod === 'yookassa') {
      // Create YooKassa subscription payment
      const payment = await yookassaService.createSubscriptionPayment(
        userId,
        subscriptionType
      );

      // Log payment
      await db.run(
        `INSERT INTO payments (user_id, amount_usd, currency, payment_method, status, reference_id, subscription_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, payment.amount.value, payment.amount.currency, 'yookassa', 'pending', payment.id, null]
      );

      return res.status(200).json({
        success: true,
        message: 'Payment initiated',
        data: {
          confirmationUrl: payment.confirmation.confirmation_url,
          paymentId: payment.id,
          paymentMethod: 'yookassa',
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid payment method',
    });
  } catch (err) {
    console.error('Upgrade subscription error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade subscription',
    });
  }
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get current subscription
    const subscription = await db.get(
      'SELECT id, stripe_subscription_id, yookassa_subscription_id FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found',
      });
    }

    // Cancel with payment provider
    if (subscription.stripe_subscription_id) {
      await stripeService.cancelSubscription(subscription.stripe_subscription_id);
    } else if (subscription.yookassa_subscription_id) {
      // YooKassa cancellation would go here
      console.log(`Cancelling YooKassa subscription: ${subscription.yookassa_subscription_id}`);
    }

    // Update database
    await db.run(
      'UPDATE subscriptions SET status = ? WHERE id = ?',
      ['cancelled', subscription.id]
    );

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled',
    });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
    });
  }
};

module.exports = {
  getCurrentSubscription,
  upgradeSubscription,
  cancelSubscription,
};
