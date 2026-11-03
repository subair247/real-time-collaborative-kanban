const taskService = require('../services/task.service');
const { createTaskSchema, updateTaskSchema, moveTaskSchema } = require('../utils/validators');

const createTask = async (req, res) => {
    try {
        const validated = createTaskSchema.parse(req.body);

        if (validated.tenant_id !== req.tenantId) {
            return res.status(403).json({ error: 'Cannot create task for a different tenant.' });
        }

        const task = await taskService.createTask({
            ...validated,
            userId: req.user.id,
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`tenant:${req.tenantId}`).emit('task:created', task);
        }

        return res.status(201).json(task);
    } catch (err) {
        if (err.errors) {
            return res.status(400).json({ error: 'Validation failed', details: err.errors });
        }
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const getTenantTasks = async (req, res) => {
    try {
        const { board_id } = req.query;
        const tasks = await taskService.getTenantTasks(req.tenantId, board_id);
        return res.status(200).json(tasks);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await taskService.getTaskById(req.params.id, req.tenantId);
        return res.status(200).json(task);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const validated = updateTaskSchema.parse(req.body);
        const updated = await taskService.updateTask(req.params.id, req.tenantId, validated, req.user.id);

        const io = req.app.get('io');
        if (io) {
            io.to(`tenant:${req.tenantId}`).emit('task:updated', updated);
        }

        return res.status(200).json(updated);
    } catch (err) {
        if (err.errors) {
            return res.status(400).json({ error: 'Validation failed', details: err.errors });
        }
        if (err.status === 409) {
            return res.status(409).json({
                error: err.message,
                serverTask: err.serverTask,
            });
        }
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const moveTask = async (req, res) => {
    try {
        const validated = moveTaskSchema.parse(req.body);
        const updated = await taskService.moveTask(req.params.id, req.tenantId, validated, req.user.id);

        const io = req.app.get('io');
        if (io) {
            io.to(`tenant:${req.tenantId}`).emit('task:moved', updated);
        }

        return res.status(200).json(updated);
    } catch (err) {
        if (err.errors) {
            return res.status(400).json({ error: 'Validation failed', details: err.errors });
        }
        if (err.status === 409) {
            return res.status(409).json({
                error: err.message,
                serverTask: err.serverTask,
            });
        }
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const result = await taskService.deleteTask(req.params.id, req.tenantId, req.user.id);

        const io = req.app.get('io');
        if (io) {
            io.to(`tenant:${req.tenantId}`).emit('task:deleted', { id: req.params.id });
        }

        return res.status(200).json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
};

module.exports = {
    createTask,
    getTenantTasks,
    getTaskById,
    updateTask,
    moveTask,
    deleteTask,
};
