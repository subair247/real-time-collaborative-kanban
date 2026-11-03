const express = require('express');
const router = express.Router();
const columnController = require('../controllers/column.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(authenticate);
router.use(requireTenant);

router.post('/', requireRole(['Org Admin', 'Tenant Admin']), columnController.createColumn);
router.put('/:id', requireRole(['Org Admin', 'Tenant Admin']), columnController.updateColumn);
router.delete('/:id', requireRole(['Org Admin', 'Tenant Admin']), columnController.deleteColumn);

module.exports = router;