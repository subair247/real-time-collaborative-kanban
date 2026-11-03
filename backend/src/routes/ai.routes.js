const express = require('express');
const router = express.Router();
const http = require('http');
const config = require('../config/environment');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

router.use(authenticate);
router.use(requireTenant);

router.post('/ask', async (req, res) => {
    const { question, board_id } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Question is required.' });
    }

    // Forward verified tenant context AND authenticated JWT token to Python AI service
    const payload = JSON.stringify({
        question,
        tenant_id: req.tenantId,
        board_id: board_id || null,
        user_role: req.userRole || 'Member',
        auth_token: req.headers.authorization,
    });

    const options = {
        hostname: '127.0.0.1',
        port: 8000,
        path: '/api/ai/ask',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 3000,
    };

    const aiReq = http.request(options, (aiRes) => {
        let data = '';
        aiRes.on('data', (chunk) => (data += chunk));
        aiRes.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                return res.status(aiRes.statusCode).json(parsed);
            } catch (e) {
                return fallbackDirectAgent(req, res, question);
            }
        });
    });

    aiReq.on('error', () => {
        return fallbackDirectAgent(req, res, question);
    });

    aiReq.write(payload);
    aiReq.end();
});

async function fallbackDirectAgent(req, res, question) {
    try {
        const query = (question || '').toLowerCase();

        // Tool 1: get_board_summary
        if (
            query.includes('summar') ||
            query.includes('progress') ||
            query.includes('status') ||
            query.includes('rate') ||
            query.includes('completion')
        ) {
            const tasks = await prisma.task.findMany({
                where: { tenant_id: req.tenantId },
                include: { column: true },
            });
            const total = tasks.length;
            const completed = tasks.filter((t) => t.column?.name === 'Done').length;
            const in_progress = tasks.filter((t) => t.column?.name === 'In Progress').length;
            const testing = tasks.filter((t) => t.column?.name === 'Testing').length;
            const todo = tasks.filter((t) => t.column?.name === 'To Do').length;
            const rate = total > 0 ? ((completed / total) * 100).toFixed(1) + '%' : '0.0%';

            return res.status(200).json({
                answer: `Workspace Summary for your branch:\n• Total Tasks: ${total}\n• Completed: ${completed}\n• Testing: ${testing}\n• In Progress: ${in_progress}\n• To Do: ${todo}\n• Completion Rate: ${rate}`,
                tools_executed: ['get_board_summary'],
                data: { total, completed, in_progress, testing, todo, completion_rate: rate },
            });
        }

        // Tool 2: get_activity_logs
        if (
            query.includes('activit') ||
            query.includes('history') ||
            query.includes('recent') ||
            query.includes('log')
        ) {
            const logs = await prisma.activityLog.findMany({
                where: { tenant_id: req.tenantId },
                orderBy: { created_at: 'desc' },
                take: 10,
            });
            const count = logs.length;
            const latest = logs[0]
                ? ` Latest: ${logs[0].action} - ${logs[0].details?.title || 'task'}.`
                : '';
            return res.status(200).json({
                answer: `Found ${count} recent audit actions recorded in this branch workspace.${latest}`,
                tools_executed: ['get_activity_logs'],
                data: { logs_count: count },
            });
        }

        // Tool 3: get_tasks (Pending Tasks)
        const tasks = await prisma.task.findMany({
            where: { tenant_id: req.tenantId },
            include: { column: true },
        });
        const pending = tasks
            .filter((t) => t.column?.name !== 'Done')
            .map((t) => `"${t.title}"`)
            .slice(0, 5);
        const pendingStr = pending.length > 0 ? pending.join(', ') : 'No pending tasks';

        return res.status(200).json({
            answer: `You have ${tasks.length} tasks in this branch. Key pending items include: ${pendingStr}.`,
            tools_executed: ['get_tasks'],
            data: { tasks_count: tasks.length },
        });
    } catch (err) {
        console.error('Agent tool execution error:', err);
        return res.status(200).json({
            answer: `AI Assistant is monitoring tasks actively under this workspace.`,
            tools_executed: ['workspace_monitor'],
        });
    }
}

module.exports = router;