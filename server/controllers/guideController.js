/**
 * Guide Controller
 * Handles guide catalog, purchases, and access control
 */

const db = require('../config/database');
const stripeService = require('../services/stripeService');
const yookassaService = require('../services/yookassaService');

/**
 * Get all guides (public catalog)
 */
const getAllGuides = async (req, res) => {
  try {
    const guides = await db.all(
      `SELECT id, title, slug, description, price_usd, category, version, created_at
       FROM guides WHERE is_published = 1 ORDER BY category, title`
    );

    res.status(200).json({
      success: true,
      data: guides,
    });
  } catch (err) {
    console.error('Get guides error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guides',
    });
  }
};

/**
 * Get single guide details
 */
const getGuideById = async (req, res) => {
  try {
    const { id } = req.params;

    const guide = await db.get(
      `SELECT id, title, slug, description, price_usd, category, version
       FROM guides WHERE id = ? AND is_published = 1`,
      [id]
    );

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found',
      });
    }

    res.status(200).json({
      success: true,
      data: guide,
    });
  } catch (err) {
    console.error('Get guide error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guide',
    });
  }
};

/**
 * Check if user has access to guide
 */
const checkGuideAccess = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id: guideId } = req.params;

    // Check if user has purchased this guide
    const purchase = await db.get(
      `SELECT id, expires_at FROM purchases
       WHERE user_id = ? AND guide_id = ? AND expires_at > datetime('now')`,
      [userId, guideId]
    );

    if (purchase) {
      return res.status(200).json({
        success: true,
        data: {
          hasAccess: true,
          type: 'purchase',
          expiresAt: purchase.expires_at,
        },
      });
    }

    // Check if user has active Pro subscription
    const subscription = await db.get(
      `SELECT type, expires_at FROM subscriptions
       WHERE user_id = ? AND status = 'active' AND (expires_at IS NULL OR expires_at > datetime('now'))`,
      [userId]
    );

    if (subscription && subscription.type !== 'free') {
      return res.status(200).json({
        success: true,
        data: {
          hasAccess: true,
          type: 'subscription',
          subscriptionType: subscription.type,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hasAccess: false,
      },
    });
  } catch (err) {
    console.error('Check access error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to check access',
    });
  }
};

/**
 * Initiate guide purchase (create checkout session)
 */
const initiateGuidePurchase = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id: guideId } = req.params;
    const { paymentMethod = 'stripe' } = req.body;

    // Get guide
    const guide = await db.get(
      'SELECT id, title, description, price_usd FROM guides WHERE id = ? AND is_published = 1',
      [guideId]
    );

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found',
      });
    }

    // Check if user already purchased this guide
    const existingPurchase = await db.get(
      'SELECT id FROM purchases WHERE user_id = ? AND guide_id = ?',
      [userId, guideId]
    );

    if (existingPurchase) {
      return res.status(409).json({
        success: false,
        message: 'You already own this guide',
      });
    }

    // Get or create customer
    const user = await db.get(
      'SELECT email, username FROM users WHERE id = ?',
      [userId]
    );

    let session;

    if (paymentMethod === 'stripe') {
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

      // Create checkout session
      session = await stripeService.createCheckoutSession(
        userId,
        guideId,
        guide,
        stripeCustomer.id
      );

      return res.status(200).json({
        success: true,
        message: 'Checkout session created',
        data: {
          checkoutUrl: session.url,
          sessionId: session.id,
          paymentMethod: 'stripe',
        },
      });
    } else if (paymentMethod === 'yookassa') {
      // Create YooKassa payment
      const payment = await yookassaService.createPayment(
        userId,
        guideId,
        guide
      );

      // Log payment
      await db.run(
        `INSERT INTO payments (user_id, amount_usd, currency, payment_method, status, reference_id, guide_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, guide.price_usd, 'USD', 'yookassa', 'pending', payment.id, guideId]
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
    console.error('Initiate purchase error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate purchase',
    });
  }
};

/**
 * Get user's purchased guides
 */
const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user.userId;

    const purchases = await db.all(
      `SELECT g.id, g.title, g.slug, g.description, g.price_usd, g.category,
              p.purchase_date, p.expires_at, p.download_count, p.last_download
       FROM purchases p
       JOIN guides g ON p.guide_id = g.id
       WHERE p.user_id = ? AND p.expires_at > datetime('now')
       ORDER BY p.purchase_date DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: purchases,
    });
  } catch (err) {
    console.error('Get purchases error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases',
    });
  }
};

module.exports = {
  getAllGuides,
  getGuideById,
  checkGuideAccess,
  initiateGuidePurchase,
  getUserPurchases,
};
