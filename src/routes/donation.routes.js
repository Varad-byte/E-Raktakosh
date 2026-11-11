const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const { validateDonation } = require('../middleware/validate');

router.get('/', donationController.getAll);
router.get('/:id', donationController.getById);
router.post('/', validateDonation, donationController.create);
router.delete('/:id', donationController.delete);

module.exports = router;
