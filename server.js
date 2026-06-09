const express = require('express');
const cors = require('cors');
const { execFile } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const PHP_SCRIPT_PATH = path.join(__dirname, 'backend.php');

/**
 * Core Helper Function: Standardizes execution bridges between JavaScript and PHP pipelines
 */
function runPHPModule(action, payload, res) {
    const stringifiedPayload = JSON.stringify(payload);

    // Securely calls the PHP runtime executable via system stream pipelines
    execFile('php', [PHP_SCRIPT_PATH, action, stringifiedPayload], (error, stdout, stderr) => {
        if (error || stderr) {
            console.error(`Execution Engine Error: ${stderr || error.message}`);
            return res.status(500).json({ success: false, message: "Internal Engine processing error." });
        }
        try {
            const parsedData = JSON.parse(stdout.trim());
            res.json(parsedData);
        } catch (parseErr) {
            console.error(`Malformed PHP Output string: ${stdout}`);
            res.status(500).json({ success: false, message: "Response processing serialization error." });
        }
    });
}

// =========================================================================
// REST API ENDPOINT OVERLAYS
// =========================================================================

app.get('/api/inventory', (req, res) => {
    runPHPModule('inventory', {}, res);
});

app.post('/api/register-donor', (req, res) => {
    runPHPModule('register-donor', req.body, res);
});

app.get('/api/search', (req, res) => {
    // Collect parameters mapping from URL search query parameters
    const payload = {
        mode: req.query.mode,
        query: req.query.query
    };
    runPHPModule('search', payload, res);
});

app.listen(PORT, () => {
    console.log(`Unified Web Backend Active: Node.js running on http://localhost:${PORT}`);
});