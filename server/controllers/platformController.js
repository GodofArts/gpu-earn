/**
 * Platform Controller
 * Handles platform catalog, categorization, and comparisons
 */

const db = require('../config/database');

/**
 * Get all platforms grouped by category
 */
const getPlatformsByCategory = async (req, res) => {
  try {
    const categories = {
      miners: await db.all(
        'SELECT * FROM platforms WHERE category = ? ORDER BY name',
        ['miners']
      ),
      singlePC: await db.all(
        'SELECT * FROM platforms WHERE category = ? ORDER BY name',
        ['single_pc']
      ),
      business: await db.all(
        'SELECT * FROM platforms WHERE category = ? ORDER BY name',
        ['business']
      ),
    };

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    console.error('Get platforms error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platforms',
    });
  }
};

/**
 * Get platform comparison table
 */
const getPlatformComparison = async (req, res) => {
  try {
    const platforms = await db.all(
      `SELECT id, name, earning_type, min_gpu, profit_level, setup_complexity,
              commission, legacy_support, scalability
       FROM platforms
       WHERE is_active = 1
       ORDER BY profit_level DESC, name`
    );

    res.status(200).json({
      success: true,
      data: {
        criteria: [
          "Тип заработка",
          "Требования к GPU",
          "Минимальная прибыль",
          "Сложность настройки",
          "Стабильность",
          "Комиссия платформы",
          "Поддержка старого оборудования",
          "Масштабируемость"
        ],
        platforms: platforms,
      },
    });
  } catch (err) {
    console.error('Get comparison error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comparison',
    });
  }
};

/**
 * Get platform recommendations based on user profile
 */
const getRecommendations = async (req, res) => {
  try {
    const { userType } = req.query;

    const typeMap = {
      'beginner': 'miners',
      'advanced': 'business',
      'decentralized': 'decentralized',
      'passive': 'passive',
    };

    const category = typeMap[userType] || 'business';

    const recommendations = await db.all(
      `SELECT DISTINCT p.id, p.name, p.description, p.profit_level, p.setup_complexity
       FROM platforms p
       JOIN platform_recommendations pr ON p.id = pr.platform_id
       WHERE pr.user_type = ?
       ORDER BY p.profit_level DESC`,
      [userType || 'business']
    );

    res.status(200).json({
      success: true,
      userType: userType || 'business',
      data: recommendations,
    });
  } catch (err) {
    console.error('Get recommendations error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
    });
  }
};

/**
 * Get single platform details with full info
 */
const getPlatformDetails = async (req, res) => {
  try {
    const { slug } = req.params;

    const platform = await db.get(
      `SELECT * FROM platforms WHERE slug = ?`,
      [slug]
    );

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: 'Platform not found',
      });
    }

    // Get related guides for this platform
    const guides = await db.all(
      `SELECT id, title, slug, price_usd FROM guides WHERE category = ? AND is_published = 1`,
      [slug]
    );

    res.status(200).json({
      success: true,
      data: {
        ...platform,
        guides: guides,
      },
    });
  } catch (err) {
    console.error('Get platform details error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform details',
    });
  }
};

/**
 * Calculate potential earnings for a platform
 */
const calculateEarnings = async (req, res) => {
  try {
    const { platformId, gpuModel, hoursPerDay } = req.body;

    const platform = await db.get(
      'SELECT hourly_rate FROM platforms WHERE id = ?',
      [platformId]
    );

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: 'Platform not found',
      });
    }

    const dailyEarnings = platform.hourly_rate * (hoursPerDay || 24);
    const monthlyEarnings = dailyEarnings * 30;
    const yearlyEarnings = monthlyEarnings * 12;

    res.status(200).json({
      success: true,
      data: {
        platformId,
        gpuModel,
        hoursPerDay: hoursPerDay || 24,
        dailyEarnings: dailyEarnings.toFixed(2),
        monthlyEarnings: monthlyEarnings.toFixed(2),
        yearlyEarnings: yearlyEarnings.toFixed(2),
      },
    });
  } catch (err) {
    console.error('Calculate earnings error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate earnings',
    });
  }
};

module.exports = {
  getPlatformsByCategory,
  getPlatformComparison,
  getRecommendations,
  getPlatformDetails,
  calculateEarnings,
};
