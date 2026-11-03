const express = require('express');
const router = express.Router();
const orgController = require('../controllers/organization.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(authenticate);

router.post('/', orgController.createOrganization);
router.get('/', orgController.getAuthorizedOrganizations);
router.get('/:id', orgController.getOrganizationById);
router.put('/:id', requireRole(['Org Admin']), orgController.updateOrganization);
router.delete('/:id', requireRole(['Org Admin']), orgController.deleteOrganization);

module.exports = router;