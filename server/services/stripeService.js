/**
 * Stripe Payment Service
 * Handles all Stripe payment operations
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

/**
 * Create or get Stripe customer
 */
const createOrGetCustomer = async (userId, email, name = '') => {
  try {
    // Try to find existing customer
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      return customers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name: name || email,
      metadata: {
        userId: userId.toString(),
      },
    });

    return customer;
  } catch (error) {
    console.error('Error creating/getting Stripe customer:', error);
    throw error;
  }
};

/**
 * Create checkout session for guide purchase
 */
const createCheckoutSession = async (userId, guideId, guide, customerId) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: guide.title,
              description: guide.description,
            },
            unit_amount: Math.round(guide.price_usd * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/guides`,
      metadata: {
        userId: userId.toString(),
        guideId: guideId.toString(),
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Create subscription session (for Про monthly/yearly)
 */
const createSubscriptionSession = async (userId, subscriptionType, customerId) => {
  try {
    const priceMap = {
      pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
      pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
    };

    if (!priceMap[subscriptionType]) {
      throw new Error(`Invalid subscription type: ${subscriptionType}`);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceMap[subscriptionType],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/guides`,
      metadata: {
        userId: userId.toString(),
        subscriptionType,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating subscription session:', error);
    throw error;
  }
};

/**
 * Get checkout session details
 */
const getCheckoutSession = async (sessionId) => {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
};

/**
 * Verify webhook signature and get event
 */
const verifyWebhookSignature = (rawBody, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};

/**
 * Handle checkout.session.completed event
 */
const handleCheckoutCompleted = async (session) => {
  const { id, customer, payment_status, metadata } = session;

  if (payment_status !== 'paid') {
    return null;
  }

  return {
    stripeSessionId: id,
    stripeCustomerId: customer,
    userId: parseInt(metadata.userId),
    guideId: metadata.guideId ? parseInt(metadata.guideId) : null,
    subscriptionType: metadata.subscriptionType || null,
    amount: session.amount_total ? session.amount_total / 100 : 0,
    currency: session.currency,
    paymentStatus: 'succeeded',
  };
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (subscriptionId) => {
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

/**
 * Get subscription details
 */
const getSubscription = async (subscriptionId) => {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
};

module.exports = {
  createOrGetCustomer,
  createCheckoutSession,
  createSubscriptionSession,
  getCheckoutSession,
  verifyWebhookSignature,
  handleCheckoutCompleted,
  cancelSubscription,
  getSubscription,
};
