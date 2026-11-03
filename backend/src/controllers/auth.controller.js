const authService = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../utils/validators');

const register = async (req, res) => {
    try {
        const validated = registerSchema.parse(req.body);
        const result = await authService.register(validated);
        return res.status(201).json(result);
    } catch (err) {
        if (err.errors) {
            return res.status(400).json({ error: 'Validation failed', details: err.errors });
        }
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const validated = loginSchema.parse(req.body);
        const result = await authService.login(validated);
        return res.status(200).json(result);
    } catch (err) {
        if (err.errors) {
            return res.status(400).json({ error: 'Validation failed', details: err.errors });
        }
        return res.status(err.status || 500).json({ error: err.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await authService.getMe(req.user.id);
        return res.status(200).json({ user });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    register,
    login,
    getMe,
};
