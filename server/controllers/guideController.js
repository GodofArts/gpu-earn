/**
 * Guide Controller
 * Handles guide catalog, purchases, and access control
 */

const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const stripeService = require('../services/stripeService');
const yookassaService = require('../services/yookassaService');
const { addWatermarkToPDF } = require('../utils/pdfGenerator');
const { sendError, sendSuccess } = require('../utils/errorHandler');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../constants');

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

/**
 * Download guide PDF with watermark
 */
const downloadGuide = async (req, res) => {
  try {
    const { guideId } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Validate guideId
    if (!guideId || isNaN(guideId)) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.INVALID_INPUT);
    }

    // Get guide details
    const guide = await db.get(
      `SELECT id, title, file_path, file_size FROM guides WHERE id = ? AND is_published = 1`,
      [guideId]
    );

    if (!guide) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.GUIDE_NOT_FOUND);
    }

    // Check if user has access to this guide
    // Either through purchase (not expired) or current subscription
    const purchase = await db.get(
      `SELECT id, expires_at FROM purchases WHERE user_id = ? AND guide_id = ? AND expires_at > datetime('now')`,
      [userId, guideId]
    );

    const subscription = await db.get(
      `SELECT type, expires_at FROM subscriptions WHERE user_id = ? AND status = 'active' AND expires_at > datetime('now')`,
      [userId]
    );

    if (!purchase && !subscription) {
      return sendError(res, HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.NO_ACCESS);
    }

    // Construct file path
    const filePath = path.join(__dirname, '../../server/uploads/guides', `${guideId}.pdf`);

    // Check if PDF file exists
    if (!fs.existsSync(filePath)) {
      console.error('PDF file not found:', filePath);
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'PDF file not available');
    }

    try {
      // Add watermark to PDF in memory
      const pdfWithWatermark = await addWatermarkToPDF(filePath, userEmail);

      // Set response headers
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${guide.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
        'Content-Length': pdfWithWatermark.length,
      });

      // Send PDF to client
      res.send(pdfWithWatermark);

      // Update download count asynchronously
      if (purchase) {
        db.run(
          `UPDATE purchases SET download_count = download_count + 1, last_download = datetime('now') WHERE id = ?`,
          [purchase.id]
        ).catch((err) => {
          console.error('Failed to update download count:', err);
        });
      }
    } catch (pdfError) {
      console.error('PDF processing error:', pdfError);
      return sendError(res, HTTP_STATUS.INTERNAL_ERROR, 'Error processing PDF');
    }
  } catch (err) {
    console.error('Download guide error:', err);
    sendError(res, HTTP_STATUS.INTERNAL_ERROR, ERROR_MESSAGES.SERVER_ERROR);
  }
};

/**
 * Get free guide by slug (public, no auth required)
 * Week 6: Free Markdown guides
 */
const getFreeGuide = async (req, res) => {
  try {
    const { slug } = req.params;

    // Fetch guide
    const guide = await db.get(
      `SELECT id, title, slug, description, markdown_content, view_count, category
       FROM guides WHERE slug = ? AND is_free = 1 AND content_type = 'markdown' AND is_published = 1`,
      [slug]
    );

    if (!guide) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'Guide not found');
    }

    // Increment view count
    await db.run(
      `UPDATE guides SET view_count = view_count + 1 WHERE id = ?`,
      [guide.id]
    ).catch((err) => {
      console.error('Failed to update view count:', err);
    });

    // Return guide with markdown content
    return sendSuccess(res, HTTP_STATUS.OK, {
      id: guide.id,
      title: guide.title,
      slug: guide.slug,
      description: guide.description,
      category: guide.category,
      markdown_content: guide.markdown_content,
      view_count: guide.view_count + 1,
    });
  } catch (err) {
    console.error('Get free guide error:', err);
    sendError(res, HTTP_STATUS.INTERNAL_ERROR, ERROR_MESSAGES.SERVER_ERROR);
  }
};

module.exports = {
  getAllGuides,
  getGuideById,
  checkGuideAccess,
  initiateGuidePurchase,
  getUserPurchases,
  downloadGuide,
  getFreeGuide,
};
