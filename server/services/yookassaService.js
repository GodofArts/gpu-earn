/**
 * YooKassa Payment Service
 * Handles all YooKassa payment operations (Russian payment provider)
 */

const https = require('https');
const crypto = require('crypto');
require('dotenv').config();

const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3';
const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const API_KEY = process.env.YOOKASSA_API_KEY;

if (!SHOP_ID || !API_KEY) {
  console.warn('⚠️ YooKassa credentials not configured');
}

/**
 * Make HTTP request to YooKassa API
 */
const makeRequest = async (method, endpoint, data = null) => {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${SHOP_ID}:${API_KEY}`).toString('base64');
    const url = new URL(YOOKASSA_API_URL + endpoint);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 400) {
            reject(new Error(`YooKassa API Error: ${parsed.description || responseData}`));
          } else {
            resolve(parsed);
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

/**
 * Create payment for guide purchase
 */
const createPayment = async (userId, guideId, guide, returnUrl = null) => {
  try {
    const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : uuidv4();

    const payload = {
      amount: {
        value: guide.price_usd.toFixed(2),
        currency: 'RUB', // YooKassa работает в RUB, но может конвертировать
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
      },
      capture: true,
      description: `Покупка гайда: ${guide.title}`,
      metadata: {
        userId: userId.toString(),
        guideId: guideId.toString(),
        type: 'guide_purchase',
      },
    };

    const response = await makeRequest('POST', '/payments', payload);
    return response;
  } catch (error) {
    console.error('Error creating YooKassa payment:', error);
    throw error;
  }
};

/**
 * Create subscription payment
 */
const createSubscriptionPayment = async (userId, subscriptionType, returnUrl = null) => {
  try {
    const priceMap = {
      pro_monthly: 5.00, // $5
      pro_yearly: 42.00, // $42
    };

    if (!priceMap[subscriptionType]) {
      throw new Error(`Invalid subscription type: ${subscriptionType}`);
    }

    const payload = {
      amount: {
        value: priceMap[subscriptionType].toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
      },
      capture: true,
      description: `Подписка: ${subscriptionType === 'pro_monthly' ? 'Про (месячно)' : 'Про (год)'}`,
      metadata: {
        userId: userId.toString(),
        subscriptionType,
        type: 'subscription',
      },
    };

    const response = await makeRequest('POST', '/payments', payload);
    return response;
  } catch (error) {
    console.error('Error creating YooKassa subscription payment:', error);
    throw error;
  }
};

/**
 * Get payment details
 */
const getPayment = async (paymentId) => {
  try {
    return await makeRequest('GET', `/payments/${paymentId}`);
  } catch (error) {
    console.error('Error retrieving YooKassa payment:', error);
    throw error;
  }
};

/**
 * Verify webhook signature
 * YooKassa uses IP whitelisting, but we can verify the payload structure
 */
const verifyWebhookSignature = (rawBody, signature) => {
  try {
    // YooKassa sends plain JSON without signature
    // In production, verify by IP whitelist from YooKassa documentation
    const data = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    return data;
  } catch (error) {
    console.error('Error verifying YooKassa webhook:', error);
    throw error;
  }
};

/**
 * Handle payment.succeeded event
 */
const handlePaymentSucceeded = async (payment) => {
  const { id, amount, status, metadata } = payment;

  if (status !== 'succeeded') {
    return null;
  }

  return {
    yookassaPaymentId: id,
    userId: parseInt(metadata.userId),
    guideId: metadata.guideId ? parseInt(metadata.guideId) : null,
    subscriptionType: metadata.subscriptionType || null,
    amount: parseFloat(amount.value),
    currency: amount.currency,
    paymentStatus: 'succeeded',
  };
};

/**
 * Refund payment
 */
const refundPayment = async (paymentId, refundAmount = null) => {
  try {
    const payload = {
      payment_id: paymentId,
    };

    if (refundAmount) {
      payload.amount = {
        value: refundAmount.toFixed(2),
        currency: 'RUB',
      };
    }

    return await makeRequest('POST', '/refunds', payload);
  } catch (error) {
    console.error('Error refunding YooKassa payment:', error);
    throw error;
  }
};

module.exports = {
  createPayment,
  createSubscriptionPayment,
  getPayment,
  verifyWebhookSignature,
  handlePaymentSucceeded,
  refundPayment,
};
