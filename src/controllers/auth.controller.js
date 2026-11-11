/**
 * Authentication Controller
 * Handles user/blood bank registration, login, token validation, and logout.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { JWT_SECRET } = require('../middleware/auth.middleware');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const authController = {
  // POST /api/auth/register
  register(req, res, next) {
    try {
      const {
        facilityName,
        licenseNumber,
        nodalOfficer,
        email,
        password,
        contactPhone,
        city
      } = req.body;

      // Validation
      const errors = [];
      if (!facilityName || !facilityName.trim()) errors.push('facilityName is required');
      if (!licenseNumber || !licenseNumber.trim()) errors.push('licenseNumber is required');
      if (!nodalOfficer || !nodalOfficer.trim()) errors.push('nodalOfficer is required');
      if (!email || !email.trim() || !email.includes('@')) errors.push('Valid email is required');
      if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
      if (!contactPhone || !contactPhone.trim()) errors.push('contactPhone is required');
      if (!city || !city.trim()) errors.push('city is required');

      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check duplicate email
      const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'An account with this email address already exists'
        });
      }

      // Hash password
      const passwordHash = bcrypt.hashSync(password, 10);
      const rand = Math.floor(100 + Math.random() * 900);
      const userId = `USR-${rand}`;

      // Insert user
      const stmt = db.prepare(`
        INSERT INTO users (id, facilityName, licenseNumber, nodalOfficer, email, passwordHash, contactPhone, city, role, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'admin', datetime('now'), datetime('now'))
      `);

      stmt.run(
        userId,
        facilityName.trim(),
        licenseNumber.trim(),
        nodalOfficer.trim(),
        normalizedEmail,
        passwordHash,
        contactPhone.trim(),
        city.trim()
      );

      // Also update settings facility credentials if it's the main facility
      db.prepare(`
        UPDATE settings 
        SET facilityName = ?, licenseNumber = ?, nodalOfficer = ?, contactPhone = ?, updatedAt = datetime('now')
        WHERE id = 1
      `).run(facilityName.trim(), licenseNumber.trim(), nodalOfficer.trim(), contactPhone.trim());

      const user = {
        id: userId,
        facilityName: facilityName.trim(),
        licenseNumber: licenseNumber.trim(),
        nodalOfficer: nodalOfficer.trim(),
        email: normalizedEmail,
        contactPhone: contactPhone.trim(),
        city: city.trim(),
        role: 'admin'
      };

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        message: 'Blood bank facility and administrator account registered successfully',
        token,
        user
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/login
  login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'BadRequest',
          message: 'Email and password are required'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(normalizedEmail);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid email or password'
        });
      }

      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid email or password'
        });
      }

      const safeUser = {
        id: user.id,
        facilityName: user.facilityName,
        licenseNumber: user.licenseNumber,
        nodalOfficer: user.nodalOfficer,
        email: user.email,
        contactPhone: user.contactPhone,
        city: user.city,
        role: user.role
      };

      const token = jwt.sign(
        { id: safeUser.id, email: safeUser.email, role: safeUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        message: 'Authentication successful',
        token,
        user: safeUser
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/logout
  logout(req, res) {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  },

  // GET /api/auth/me
  getMe(req, res) {
    res.json({
      success: true,
      user: req.user
    });
  }
};

module.exports = authController;
