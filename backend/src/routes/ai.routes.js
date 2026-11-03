const express = require('express');
const router = express.Router();
const http = require('http');
const config = require('../config/environment');
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
        timeout: 5000,
    };

    const aiReq = http.request(options, (aiRes) => {
        let data = '';
        aiRes.on('data', (chunk) => (data += chunk));
        aiRes.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                return res.status(aiRes.statusCode).json(parsed);
            } catch (e) {
                return res.status(500).json({ error: 'Invalid response from AI service.' });
            }
        });
    });

    aiReq.on('error', (err) => {
        return res.status(200).json({
            answer: `AI Assistant is offline (start ai-service on port 8000). For your current branch, tasks are actively monitored under ${req.tenant?.name || 'this workspace'}.`,
            tools_executed: [],
        });
    });

    aiReq.write(payload);
    aiReq.end();
});

module.exports = router;