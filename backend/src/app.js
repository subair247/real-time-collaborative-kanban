const http = require('http');
const express = require('express');
const cors = require('cors');
const config = require('./config/environment');
const { initializeSocket } = require('./sockets/socket');

// Import routes
const authRoutes = require('./routes/auth.routes');
const organizationRoutes = require('./routes/organization.routes');
const tenantRoutes = require('./routes/tenant.routes');
const boardRoutes = require('./routes/board.routes');
const columnRoutes = require('./routes/column.routes');
const taskRoutes = require('./routes/task.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);
app.set('io', io);

// Middleware
app.use(
    cors({
        origin: config.clientUrl || '*',
        credentials: true,
    })
);
app.use(express.json());

// Step 5: Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'The server is running.' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    const status = err.status || 500;
    res.status(status).json({
        error: err.message || 'Internal server error.',
    });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
    server.listen(config.port, () => {
        console.log(`JulleyOnline Kanban Backend running on http://localhost:${config.port}`);
        console.log(`Health check: http://localhost:${config.port}/api/health`);
    });
}

module.exports = { app, server };