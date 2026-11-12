const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth.middleware');

function authenticateOptional(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, fullName, email, bloodGroup, contactPhone, city, role FROM customers WHERE id = ?').get(decoded.id) ||
                 db.prepare('SELECT id, facilityName, nodalOfficer, email, contactPhone, city, role FROM users WHERE id = ?').get(decoded.id);
    if (user) req.user = user;
  } catch (e) {
    // Continue as guest
  }
  next();
}

// POST /api/customer/requests - citizen submits emergency blood requisition
router.post('/requests', authenticateToken, customerController.createCustomerRequest);

// GET /api/customer/requests - personal tracking of submitted requests
router.get('/requests', authenticateToken, customerController.getCustomerRequests);

// POST /api/customer/donate - appointment / voluntary pledge / camp RSVP
router.post('/donate', authenticateOptional, customerController.registerDonationAppointment);

module.exports = router;
