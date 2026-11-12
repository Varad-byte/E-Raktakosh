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
        role = 'admin',
        facilityName,
        licenseNumber,
        nodalOfficer,
        fullName,
        age,
        gender,
        bloodGroup,
        email,
        password,
        contactPhone,
        city
      } = req.body;

      const normalizedRole = (role === 'customer' || role === 'donor') ? 'donor' : 'admin';
      const errors = [];

      if (!email || !email.trim() || !email.includes('@')) errors.push('Valid email is required');
      if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
      if (!contactPhone || !contactPhone.trim()) errors.push('contactPhone is required');
      if (!city || !city.trim()) errors.push('city is required');

      if (normalizedRole === 'admin') {
        if (!facilityName || !facilityName.trim()) errors.push('facilityName is required');
        if (!licenseNumber || !licenseNumber.trim()) errors.push('licenseNumber is required');
        if (!nodalOfficer || !nodalOfficer.trim()) errors.push('nodalOfficer is required');
      } else {
        if (!fullName || !fullName.trim()) errors.push('fullName is required');
        if (!bloodGroup || !bloodGroup.trim()) errors.push('bloodGroup is required');
      }

      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check duplicate email across both users and customers tables
      const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(normalizedEmail);
      const existingCustomer = db.prepare('SELECT id FROM customers WHERE LOWER(email) = ?').get(normalizedEmail);
      if (existingUser || existingCustomer) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'An account with this email address already exists'
        });
      }

      // Hash password
      const passwordHash = bcrypt.hashSync(password, 10);

      if (normalizedRole === 'admin') {
        const rand = Math.floor(100 + Math.random() * 900);
        const userId = `USR-${rand}`;

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

        // Update settings facility credentials
        try {
          db.prepare(`
            UPDATE settings 
            SET facilityName = ?, licenseNumber = ?, nodalOfficer = ?, contactPhone = ?, updatedAt = datetime('now')
            WHERE id = 1
          `).run(facilityName.trim(), licenseNumber.trim(), nodalOfficer.trim(), contactPhone.trim());
        } catch (e) {
          // Non-critical if settings doesn't exist yet
        }

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

        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(201).json({
          success: true,
          message: 'Blood bank facility and administrator account registered successfully',
          token,
          user
        });
      } else {
        // Citizen / Donor registration
        const rand = Math.floor(200 + Math.random() * 800);
        const customerId = `CST-${rand}`;

        const stmt = db.prepare(`
          INSERT INTO customers (id, fullName, email, passwordHash, age, gender, bloodGroup, contactPhone, city, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'donor', datetime('now'), datetime('now'))
        `);

        stmt.run(
          customerId,
          fullName.trim(),
          normalizedEmail,
          passwordHash,
          age ? Number(age) : null,
          gender ? gender.trim() : 'Unspecified',
          bloodGroup.trim(),
          contactPhone.trim(),
          city.trim()
        );

        const safeCustomer = {
          id: customerId,
          fullName: fullName.trim(),
          email: normalizedEmail,
          age: age ? Number(age) : null,
          gender: gender ? gender.trim() : 'Unspecified',
          bloodGroup: bloodGroup.trim(),
          contactPhone: contactPhone.trim(),
          city: city.trim(),
          role: 'donor'
        };

        const token = jwt.sign(
          { id: safeCustomer.id, email: safeCustomer.email, role: safeCustomer.role },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(201).json({
          success: true,
          message: 'Citizen / Donor registered successfully',
          token,
          user: safeCustomer
        });
      }
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/login
  login(req, res, next) {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'BadRequest',
          message: 'Email and password are required'
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      let account = null;
      let detectedRole = null;

      if (role === 'donor' || role === 'customer') {
        account = db.prepare('SELECT * FROM customers WHERE LOWER(email) = ?').get(normalizedEmail);
        detectedRole = 'donor';
        if (!account) {
          account = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(normalizedEmail);
          if (account) detectedRole = account.role || 'admin';
        }
      } else if (role === 'admin') {
        account = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(normalizedEmail);
        detectedRole = 'admin';
        if (!account) {
          account = db.prepare('SELECT * FROM customers WHERE LOWER(email) = ?').get(normalizedEmail);
          if (account) detectedRole = 'donor';
        }
      } else {
        // No explicit role passed; search users first, then customers
        account = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(normalizedEmail);
        detectedRole = 'admin';
        if (!account) {
          account = db.prepare('SELECT * FROM customers WHERE LOWER(email) = ?').get(normalizedEmail);
          if (account) detectedRole = 'donor';
        }
      }

      if (!account) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid email or password'
        });
      }

      const isMatch = bcrypt.compareSync(password, account.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid email or password'
        });
      }

      let safeUser;
      if (detectedRole === 'donor') {
        safeUser = {
          id: account.id,
          fullName: account.fullName,
          email: account.email,
          age: account.age,
          gender: account.gender,
          bloodGroup: account.bloodGroup,
          contactPhone: account.contactPhone,
          city: account.city,
          role: 'donor'
        };
      } else {
        safeUser = {
          id: account.id,
          facilityName: account.facilityName,
          licenseNumber: account.licenseNumber,
          nodalOfficer: account.nodalOfficer,
          email: account.email,
          contactPhone: account.contactPhone,
          city: account.city,
          role: account.role || 'admin'
        };
      }

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
