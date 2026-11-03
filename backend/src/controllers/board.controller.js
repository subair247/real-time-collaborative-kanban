const boardService = require('../services/board.service');
const { createBoardSchema } = require('../utils/validators');

const createBoard = async (req, res) => {
    try {
        const validated = createBoardSchema.parse(req.body);
        const board = await boardService.createBoard({
            ...validated,
            userId: req.user.id,
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`tenant:${board.tenant_id}`).emit('board:updated', { action: 'created', board });
        }

        return res.status(201).json(board);
    } catch (err) {
        if (err.errors) {
            return res.status(400).json({ error: 'Validation failed', details: err.errors });
        }
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const getTenantBoards = async (req, res) => {
    try {
        const boards = await boardService.getTenantBoards(req.tenantId);
        return res.status(200).json(boards);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getBoardById = async (req, res) => {
    try {
        const board = await boardService.getBoardById(req.params.id, req.tenantId);
        return res.status(200).json(board);
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const updateBoard = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Board name must be at least 2 characters.' });
        }

        await boardService.updateBoard(req.params.id, req.tenantId, { name, description });

        const io = req.app.get('io');
        if (io) {
            io.to(`tenant:${req.tenantId}`).emit('board:updated', { action: 'updated', boardId: req.params.id });
        }

        return res.status(200).json({ message: 'Board updated successfully.' });
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const deleteBoard = async (req, res) => {
    try {
        await boardService.deleteBoard(req.params.id, req.tenantId);

        const io = req.app.get('io');
        if (io) {
            io.to(`tenant:${req.tenantId}`).emit('board:updated', { action: 'deleted', boardId: req.params.id });
        }

        return res.status(200).json({ message: 'Board deleted successfully.' });
    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message });
    }
};

module.exports = {
    createBoard,
    getTenantBoards,
    getBoardById,
    updateBoard,
    deleteBoard,
};
