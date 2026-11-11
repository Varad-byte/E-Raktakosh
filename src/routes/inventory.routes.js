const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { validateInventoryBatch } = require('../middleware/validate');

router.get('/', inventoryController.getAll);
router.get('/:id', inventoryController.getById);
router.post('/', validateInventoryBatch, inventoryController.create);
router.put('/:id', inventoryController.update);
router.delete('/:id', inventoryController.delete);

module.exports = router;
