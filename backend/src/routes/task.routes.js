const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

router.use(authenticate);
router.use(requireTenant);

router.post('/', taskController.createTask);
router.get('/', taskController.getTenantTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.patch('/:id/move', taskController.moveTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
