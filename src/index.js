// index.js
const express = require('express');
const Server = require('./server/server.js');
const crypto = require('crypto');

const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 8000;
const server = new Server();
let topic = null;

// Initialize server
async function initializeServer() {
    try {
        await server.run();
        topic = crypto.randomBytes(32);
        await server.join(topic);
        console.log('Server initialized with topic:', topic.toString('hex'));
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
}

initializeServer();

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: "Server running",
        topic: topic.toString('hex'),
        connections: server.getConnectionCount()
    });
});

app.get('/status', (req, res) => {
    res.json({
        topic: topic.toString('hex'),
        connections: server.getConnectionCount()
    });
});

app.post('/test', (req,res) => {
    const rest = req.body;
    res.json({
        body: rest
    });
});

app.post('/broadcast', (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }
    server.broadcast(message);
    res.json({ 
        success: true, 
        message: "Message broadcasted",
        connections: server.getConnectionCount()
    });
});

app.post('/join', (req, res) => {
    const newTopic = req.body.topic;
    if (!newTopic) {
        return res.status(400).json({ error: "Topic is required" });
    }
    try {
        const topicBuffer = Buffer.from(newTopic, 'hex');
        server.join(topicBuffer);
        topic = topicBuffer;
        res.json({ 
            success: true, 
            topic: topic.toString('hex')
        });
    } catch (error) {
        res.status(400).json({ error: "Invalid topic format" });
    }
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: "Page not found" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Express server running on port: ${PORT}`);
});

// Graceful shutdown because we're nice like that
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await server.destroy();
    process.exit(0);
});
