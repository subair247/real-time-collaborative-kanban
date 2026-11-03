const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const prisma = require('../config/database');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                memberships: {
                    include: {
                        organization: true,
                        tenant: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found or session expired.' });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
        };
        req.memberships = user.memberships;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid authentication token.' });
    }
};

module.exports = { authenticate };
