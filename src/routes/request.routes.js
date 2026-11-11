const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { validateRequest } = require('../middleware/validate');

router.get('/', requestController.getAll);
router.get('/:id', requestController.getById);
router.post('/', validateRequest, requestController.create);
router.patch('/:id/status', requestController.updateStatus);
router.patch('/:id', requestController.updateStatus);
router.put('/:id', requestController.update);
router.delete('/:id', requestController.delete);

module.exports = router;
