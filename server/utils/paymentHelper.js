/**
 * Payment Helper Utility
 * Consolidated payment processing logic to eliminate duplication between Stripe and YooKassa handlers
 */

const { ACCESS_DURATION, SUBSCRIPTION_STATUS, SUBSCRIPTION_TYPES } = require('../constants');

/**
 * Grant access to a guide purchase
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @param {number} guideId - Guide ID
 * @param {string} paymentId - Payment reference ID (stripe or yookassa)
 * @return {Promise} Database operation result
 */
const grantGuidePurchaseAccess = async (db, userId, guideId, paymentId) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ACCESS_DURATION.GUIDE_PURCHASE);

  return db.run(
    `INSERT INTO purchases (user_id, guide_id, payment_id, expires_at)
     VALUES (?, ?, ?, ?)`,
    [userId, guideId, paymentId, expiresAt.toISOString()]
  );
};

/**
 * Update subscription after successful payment
 * @param {Object} db - Database connection
 * @param {number} userId - User ID
 * @param {string} subscriptionType - Subscription type (pro_monthly/pro_yearly)
 * @param {string} stripeSubscriptionId - Stripe subscription ID (optional)
 * @param {string} yookassaSubscriptionId - YooKassa subscription ID (optional)
 * @return {Promise} Database operation result
 */
const updateSubscriptionAfterPayment = async (
  db,
  userId,
  subscriptionType,
  stripeSubscriptionId = null,
  yookassaSubscriptionId = null
) => {
  const subscriptionDays =
    subscriptionType === SUBSCRIPTION_TYPES.PRO_MONTHLY
      ? ACCESS_DURATION.SUBSCRIPTION_MONTHLY
      : ACCESS_DURATION.SUBSCRIPTION_YEARLY;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + subscriptionDays);

  const updateData = [
    subscriptionType,
    SUBSCRIPTION_STATUS.ACTIVE,
    expiresAt.toISOString(),
    userId,
  ];

  let query = `UPDATE subscriptions SET type = ?, status = ?, expires_at = ?, updated_at = datetime('now')`;

  if (stripeSubscriptionId) {
    query += `, stripe_subscription_id = ?`;
    updateData.splice(3, 0, stripeSubscriptionId);
  }

  if (yookassaSubscriptionId) {
    query += `, yookassa_subscription_id = ?`;
    updateData.push(yookassaSubscriptionId);
  }

  query += ` WHERE user_id = ?`;

  return db.run(query, updateData);
};

/**
 * Log payment transaction
 * @param {Object} db - Database connection
 * @param {Object} paymentData - Payment details
 * @return {Promise} Database operation result
 */
const logPayment = async (db, paymentData) => {
  const {
    userId,
    amountUsd,
    currency = 'USD',
    paymentMethod,
    status,
    referenceId,
    guideId = null,
    subscriptionId = null,
  } = paymentData;

  return db.run(
    `INSERT INTO payments (user_id, amount_usd, currency, payment_method, status, reference_id, guide_id, subscription_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, amountUsd, currency, paymentMethod, status, referenceId, guideId, subscriptionId]
  );
};

module.exports = {
  grantGuidePurchaseAccess,
  updateSubscriptionAfterPayment,
  logPayment,
};
