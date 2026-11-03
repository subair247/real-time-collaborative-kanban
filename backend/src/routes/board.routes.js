const express = require('express');
const router = express.Router();
const boardController = require('../controllers/board.controller');
const columnController = require('../controllers/column.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(authenticate);
router.use(requireTenant);

router.post('/', requireRole(['Org Admin', 'Tenant Admin']), boardController.createBoard);
router.get('/', boardController.getTenantBoards);
router.get('/:id', boardController.getBoardById);
router.put('/:id', requireRole(['Org Admin', 'Tenant Admin']), boardController.updateBoard);
router.delete('/:id', requireRole(['Org Admin', 'Tenant Admin']), boardController.deleteBoard);

router.get('/:boardId/columns', columnController.getBoardColumns);

module.exports = router;
