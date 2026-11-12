const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

// GET /api/public/inventory - Live stock lookup with bloodGroup and city filters
router.get('/inventory', customerController.getPublicInventory);

// GET /api/public/camps - List upcoming voluntary donation camps
router.get('/camps', customerController.getPublicCamps);

module.exports = router;
