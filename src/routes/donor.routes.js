const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donor.controller');
const { validateDonor } = require('../middleware/validate');

router.get('/', donorController.getAll);
router.get('/:id', donorController.getById);
router.post('/', validateDonor, donorController.create);
router.put('/:id', donorController.update);
router.delete('/:id', donorController.delete);

module.exports = router;
