/**
 * Content Management Utility
 * Handles both PDF (paid) and Markdown (free) content types
 */

const { CONTENT_TYPES } = require('../constants');

/**
 * Check if user has access to content
 * @param {Object} guide - Guide object
 * @param {Object} purchase - Purchase object (if any)
 * @return {boolean} True if user has access
 */
const isContentAccessible = (guide, purchase) => {
  // Free guides are always accessible
  if (guide.is_free) return true;

  // Paid guides require active purchase
  if (purchase && new Date(purchase.expires_at) > new Date()) {
    return true;
  }

  return false;
};

/**
 * Validate content type
 * @param {string} contentType - Type to validate
 * @return {boolean} True if valid
 */
const isValidContentType = (contentType) => {
  return ['pdf', 'markdown'].includes(contentType);
};

/**
 * Get content type from guide
 * @param {Object} guide - Guide object
 * @return {string} Content type ('pdf' or 'markdown')
 */
const getContentType = (guide) => {
  if (!guide) throw new Error('Guide is required');
  return guide.content_type || 'pdf';
};

/**
 * Check if guide is free
 * @param {Object} guide - Guide object
 * @return {boolean}
 */
const isGuideFree = (guide) => {
  return guide && guide.is_free === 1;
};

/**
 * Check if guide is paid
 * @param {Object} guide - Guide object
 * @return {boolean}
 */
const isGuidePaid = (guide) => {
  return guide && guide.is_free === 0;
};

/**
 * Get guide display label based on type and availability
 * @param {Object} guide - Guide object
 * @param {boolean} hasAccess - User has access?
 * @return {string} Display label with emoji
 */
const getGuideLabel = (guide, hasAccess) => {
  if (isGuideFree(guide)) {
    return '📖 Read Free';
  }

  if (hasAccess) {
    return '🔓 Download PDF';
  }

  return '🔒 Buy PDF';
};

/**
 * Get content description
 * @param {Object} guide - Guide object
 * @return {string} Description
 */
const getContentDescription = (guide) => {
  if (isGuideFreee(guide) && guide.content_type === 'markdown') {
    return 'Free Markdown Guide - Read in browser';
  }

  if (isGuidePaid(guide) && guide.content_type === 'pdf') {
    return 'Premium PDF Guide - Download for offline reading';
  }

  return 'Guide';
};

/**
 * Format guide for API response
 * @param {Object} guide - Raw guide from DB
 * @param {boolean} includeMarkdown - Include markdown_content?
 * @return {Object} Formatted guide
 */
const formatGuideForResponse = (guide, includeMarkdown = false) => {
  const formatted = {
    id: guide.id,
    title: guide.title,
    slug: guide.slug,
    description: guide.description,
    category: guide.category,
    is_free: guide.is_free,
    content_type: guide.content_type,
    view_count: guide.view_count || 0,
  };

  // Add price only for paid guides
  if (!guide.is_free) {
    formatted.price_usd = guide.price_usd;
  }

  // Add markdown content if requested
  if (includeMarkdown && guide.is_free && guide.markdown_content) {
    formatted.markdown_content = guide.markdown_content;
  }

  // Add related guide info if linked
  if (guide.related_guide_id) {
    formatted.related_guide_id = guide.related_guide_id;
  }

  return formatted;
};

module.exports = {
  isContentAccessible,
  isValidContentType,
  getContentType,
  isGuideFreee,
  isGuidePaid,
  getGuideLabel,
  getContentDescription,
  formatGuideForResponse,
};
