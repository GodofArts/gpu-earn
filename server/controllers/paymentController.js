/**
 * Payment Controller
 * Handles payment webhooks and payment status updates
 */

const db = require('../config/database');
const stripeService = require('../services/stripeService');
const yookassaService = require('../services/yookassaService');

/**
 * Handle Stripe webhook
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  let event;

  try {
    event = stripeService.verifyWebhookSignature(rawBody, sig);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const paymentData = await stripeService.handleCheckoutCompleted(session);

        if (paymentData) {
          // Get full session details
          const fullSession = await stripeService.getCheckoutSession(session.id);

          // Log payment
          await db.run(
            `INSERT INTO payments (user_id, amount_usd, currency, payment_method, status, reference_id, guide_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              paymentData.userId,
              paymentData.amount,
              paymentData.currency,
              'stripe',
              'succeeded',
              paymentData.stripeSessionId,
              paymentData.guideId,
            ]
          );

          // Grant access based on what was purchased
          if (paymentData.guideId) {
            // Single guide purchase - valid for 90 days
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 90);

            await db.run(
              `INSERT INTO purchases (user_id, guide_id, payment_id, expires_at)
               VALUES (?, ?, ?, ?)`,
              [paymentData.userId, paymentData.guideId, paymentData.stripeSessionId, expiresAt.toISOString()]
            );

            console.log(`✅ Purchase granted: User ${paymentData.userId}, Guide ${paymentData.guideId}`);
          } else if (paymentData.subscriptionType) {
            // Subscription upgrade
            const subscriptionDays = paymentData.subscriptionType === 'pro_monthly' ? 30 : 365;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + subscriptionDays);

            await db.run(
              `UPDATE subscriptions
               SET type = ?, status = ?, stripe_subscription_id = ?, expires_at = ?, updated_at = datetime('now')
               WHERE user_id = ?`,
              [paymentData.subscriptionType, 'active', paymentData.stripeSessionId, expiresAt.toISOString(), paymentData.userId]
            );

            console.log(`✅ Subscription upgraded: User ${paymentData.userId}, Type ${paymentData.subscriptionType}`);
          }
        }
        break;

      case 'charge.refunded':
        const charge = event.data.object;
        console.log(`💰 Refund processed: ${charge.id}`);
        // Handle refund logic here
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({
      success: true,
      received: true,
    });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
};

/**
 * Handle YooKassa webhook
 */
const handleYooKassaWebhook = async (req, res) => {
  try {
    const event = yookassaService.verifyWebhookSignature(req.rawBody, req.headers['x-signature']);

    if (event.type === 'payment.succeeded') {
      const payment = event.object;
      const paymentData = await yookassaService.handlePaymentSucceeded(payment);

      if (paymentData) {
        // Log payment in database
        await db.run(
          `INSERT INTO payments (user_id, amount_usd, currency, payment_method, status, reference_id, guide_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            paymentData.userId,
            paymentData.amount,
            paymentData.currency,
            'yookassa',
            'succeeded',
            paymentData.yookassaPaymentId,
            paymentData.guideId,
          ]
        );

        // Grant access based on what was purchased
        if (paymentData.guideId) {
          // Single guide purchase - valid for 90 days
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 90);

          await db.run(
            `INSERT INTO purchases (user_id, guide_id, payment_id, expires_at)
             VALUES (?, ?, ?, ?)`,
            [paymentData.userId, paymentData.guideId, paymentData.yookassaPaymentId, expiresAt.toISOString()]
          );

          console.log(`✅ Purchase granted via YooKassa: User ${paymentData.userId}, Guide ${paymentData.guideId}`);
        }
      }
    }

    res.status(200).json({
      success: true,
      received: true,
    });
  } catch (err) {
    console.error('YooKassa webhook processing error:', err);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
};

/**
 * Get payment details (for debugging)
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { method = 'stripe' } = req.query;

    let paymentData;

    if (method === 'stripe') {
      paymentData = await stripeService.getCheckoutSession(paymentId);
    } else if (method === 'yookassa') {
      paymentData = await yookassaService.getPayment(paymentId);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    res.status(200).json({
      success: true,
      data: paymentData,
    });
  } catch (err) {
    console.error('Get payment status error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
    });
  }
};

module.exports = {
  handleStripeWebhook,
  handleYooKassaWebhook,
  getPaymentStatus,
};
