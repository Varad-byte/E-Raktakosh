/**
 * JWT Authentication Middleware
 * Validates Bearer token in Authorization header.
 */

const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'bbims_clinical_vault_jwt_secret_key_2026_prod';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists in DB
    let user = null;
    if (decoded.role === 'admin') {
      user = db.prepare(`
        SELECT id, facilityName, licenseNumber, nodalOfficer, email, contactPhone, city, role, createdAt
        FROM users 
        WHERE id = ?
      `).get(decoded.id);
    } else {
      user = db.prepare(`
        SELECT id, fullName, email, age, gender, bloodGroup, contactPhone, city, role, createdAt
        FROM customers
        WHERE id = ?
      `).get(decoded.id);

      if (!user) {
        user = db.prepare(`
          SELECT id, facilityName, licenseNumber, nodalOfficer, email, contactPhone, city, role, createdAt
          FROM users 
          WHERE id = ?
        `).get(decoded.id);
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid session. User account not found.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: err.name === 'TokenExpiredError' 
        ? 'Session expired. Please log in again.' 
        : 'Invalid authentication token.'
    });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
