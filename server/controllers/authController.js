/**
 * Authentication Controller
 * Handles user registration, login, token refresh, etc.
 */

const db = require('../config/database');
const authService = require('../services/authService');

/**
 * Register new user
 */
const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check if email already exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const passwordHash = await authService.hashPassword(password);

    // Create user
    const result = await db.run(
      'INSERT INTO users (email, password_hash, username, is_active) VALUES (?, ?, ?, ?)',
      [email, passwordHash, username || null, 1]
    );

    const userId = result.id;

    // Create free subscription for new user
    await db.run(
      'INSERT INTO subscriptions (user_id, type, status) VALUES (?, ?, ?)',
      [userId, 'free', 'active']
    );

    // Generate tokens
    const accessToken = authService.generateAccessToken(userId, email);
    const refreshToken = authService.generateRefreshToken(userId);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId,
        email,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = await db.get(
      'SELECT id, password_hash, email, is_active FROM users WHERE email = ?',
      [email]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const passwordMatch = await authService.comparePassword(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    await db.run(
      'UPDATE users SET last_login = datetime("now") WHERE id = ?',
      [user.id]
    );

    // Generate tokens
    const accessToken = authService.generateAccessToken(user.id, user.email);
    const refreshToken = authService.generateRefreshToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        email: user.email,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = authService.verifyRefreshToken(token);

    // Get user info
    const user = await db.get(
      'SELECT id, email FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new access token
    const accessToken = authService.generateAccessToken(user.id, user.email);
    const newRefreshToken = authService.generateRefreshToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(401).json({
      success: false,
      message: 'Token refresh failed',
    });
  }
};

/**
 * Get current user info
 */
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await db.get(
      'SELECT id, email, username, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user subscription
    const subscription = await db.get(
      'SELECT type, status, expires_at FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...user,
        subscription: subscription || { type: 'free', status: 'active' },
      },
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get user info',
    });
  }
};

/**
 * Logout (token blacklist would be implemented here in production)
 */
const logout = async (req, res) => {
  try {
    // In production, add token to blacklist
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getCurrentUser,
  logout,
};
