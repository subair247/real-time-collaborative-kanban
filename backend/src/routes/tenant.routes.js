const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(authenticate);

router.post('/', requireRole(['Org Admin']), tenantController.createTenant);
router.get('/', tenantController.getAuthorizedTenants);
router.get('/:id', tenantController.getTenantById);
router.get('/:id/activities', tenantController.getTenantActivities);
router.put('/:id', requireRole(['Org Admin', 'Tenant Admin']), tenantController.updateTenant);
router.delete('/:id', requireRole(['Org Admin']), tenantController.deleteTenant);

module.exports = router;