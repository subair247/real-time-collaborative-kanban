const columnService = require('../services/column.service');
const { createColumnSchema } = require('../utils/validators');

const createColumn = async (req, res) => {
    try {
        const validated = createColumnSchema.parse(req.body);
        const column = await columnService.createColumn({
            ...validated,
            tenant_id: req.tenantId,
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`tenant:${req.tenantId}`).emit('board:updated', { action: 'column_created', column });
        }

        return res.status(201).json(column);
    } catch (err) {
        if (err.errors) {
            return res.status(400).json({ error: 'Validation failed', details: err.errors });
        }
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const getBoardColumns = async (req, res) => {
    try {
        const { boardId } = req.params;
        const columns = await columnService.getBoardColumns(boardId, req.tenantId);
        return res.status(200).json(columns);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const updateColumn = async (req, res) => {
    try {
        const { name, position } = req.body;
        await columnService.updateColumn(req.params.id, req.tenantId, { name, position });

        const io = req.app.get('io');
        if (io) {
            io.to(`tenant:${req.tenantId}`).emit('board:updated', { action: 'column_updated', columnId: req.params.id });
        }

        return res.status(200).json({ message: 'Column updated successfully.' });
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const deleteColumn = async (req, res) => {
    try {
        await columnService.deleteColumn(req.params.id, req.tenantId);

        const io = req.app.get('io');
        if (io) {
            io.to(`tenant:${req.tenantId}`).emit('board:updated', { action: 'column_deleted', columnId: req.params.id });
        }

        return res.status(200).json({ message: 'Column deleted successfully.' });
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
};

module.exports = {
    createColumn,
    getBoardColumns,
    updateColumn,
    deleteColumn,
};
