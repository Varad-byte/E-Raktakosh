const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const inventoryRoutes = require('./inventory.routes');
const donorRoutes = require('./donor.routes');
const requestRoutes = require('./request.routes');
const donationRoutes = require('./donation.routes');
const settingsRoutes = require('./settings.routes');
const systemRoutes = require('./system.routes');

const publicRoutes = require('./public.routes');
const customerRoutes = require('./customer.routes');

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/customer', customerRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/donors', donorRoutes);
router.use('/requests', requestRoutes);
router.use('/donations', donationRoutes);
router.use('/settings', settingsRoutes);
router.use('/', systemRoutes);

module.exports = router;
