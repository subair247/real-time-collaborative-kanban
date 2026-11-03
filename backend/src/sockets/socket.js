const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const prisma = require('../config/database');

const tenantPresence = new Map();

const initializeSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: config.clientUrl || '*',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = jwt.verify(token, config.jwtSecret);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                include: { memberships: true },
            });

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            socket.user = { id: user.id, name: user.name, email: user.email };
            socket.memberships = user.memberships;
            next();
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const user = socket.user;
        let currentTenantRoom = null;

        socket.on('tenant:join', async ({ tenantId }) => {
            try {
                if (!tenantId) return;

                const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
                if (!tenant) {
                    socket.emit('error', { message: 'Tenant not found.' });
                    return;
                }

                const isAuthorized = socket.memberships.some(
                    (m) =>
                        m.tenant_id === tenantId ||
                        (m.organization_id === tenant.organization_id && m.role === 'Org Admin')
                );

                if (!isAuthorized) {
                    socket.emit('error', { message: 'Unauthorized room access blocked.' });
                    return;
                }

                if (currentTenantRoom) {
                    socket.leave(currentTenantRoom);
                    handleUserLeave(io, currentTenantRoom, user.id, socket.id);
                }

                const roomName = `tenant:${tenantId}`;
                socket.join(roomName);
                currentTenantRoom = roomName;

                handleUserJoin(io, roomName, user, socket.id);
            } catch (err) {
                console.error('Error joining tenant room:', err);
            }
        });

        socket.on('disconnect', () => {
            if (currentTenantRoom) {
                handleUserLeave(io, currentTenantRoom, user.id, socket.id);
            }
        });
    });

    return io;
};

function handleUserJoin(io, roomName, user, socketId) {
    if (!tenantPresence.has(roomName)) {
        tenantPresence.set(roomName, new Map());
    }

    const roomUsers = tenantPresence.get(roomName);
    if (!roomUsers.has(user.id)) {
        roomUsers.set(user.id, {
            id: user.id,
            name: user.name,
            email: user.email,
            socketIds: new Set([socketId]),
        });
    } else {
        roomUsers.get(user.id).socketIds.add(socketId);
    }

    broadcastPresence(io, roomName);
}

function handleUserLeave(io, roomName, userId, socketId) {
    if (!tenantPresence.has(roomName)) return;

    const roomUsers = tenantPresence.get(roomName);
    if (roomUsers.has(userId)) {
        const userEntry = roomUsers.get(userId);
        userEntry.socketIds.delete(socketId);
        if (userEntry.socketIds.size === 0) {
            roomUsers.delete(userId);
        }
    }

    broadcastPresence(io, roomName);
}

function broadcastPresence(io, roomName) {
    const roomUsers = tenantPresence.get(roomName);
    const activeUsers = roomUsers
        ? Array.from(roomUsers.values()).map((u) => ({ id: u.id, name: u.name, email: u.email }))
        : [];

    io.to(roomName).emit('presence:update', {
        onlineUsers: activeUsers,
        count: activeUsers.length,
    });
}

module.exports = { initializeSocket };