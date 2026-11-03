const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const config = require('../config/environment');

const register = async ({ name, email, password }) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        const error = new Error('Email is already registered.');
        error.status = 400;
        throw error;
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password_hash,
        },
    });

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
    });

    return {
        user: { id: user.id, name: user.name, email: user.email },
        token,
    };
};

const login = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email },
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
        const error = new Error('Invalid email or password.');
        error.status = 401;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        const error = new Error('Invalid email or password.');
        error.status = 401;
        throw error;
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
    });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            memberships: user.memberships,
        },
        token,
    };
};

const getMe = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            created_at: true,
            memberships: {
                include: {
                    organization: true,
                    tenant: true,
                },
            },
        },
    });
};

module.exports = {
    register,
    login,
    getMe,
};