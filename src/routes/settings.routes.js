const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');

router.get('/', settingsController.getSettings);
router.post('/', settingsController.saveSettings);
router.put('/', settingsController.saveSettings);

module.exports = router;
