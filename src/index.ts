import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer } from './server.js';
import { setGlobalCookie, setSessionCookie, initAnonymousCookie } from './api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Initialize global cookie from env or anonymous
const envCookie = process.env.NETEASE_COOKIE;
if (envCookie) {
  setGlobalCookie(envCookie);
  console.log('Loaded NETEASE_COOKIE from environment');
} else {
  initAnonymousCookie().then(() => {
    console.log('Anonymous cookie initialization complete');
  });
}

// Store transports to handle POST messages
const transports = new Map<string, SSEServerTransport>();

app.get('/sse', async (req, res) => {
  console.log('New SSE connection');

  const transport = new SSEServerTransport('/messages', res);
  const sessionId = transport.sessionId;

  transports.set(sessionId, transport);

  // Handle Bearer Auth
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const cookie = authHeader.substring(7);
    if (cookie) {
      setSessionCookie(sessionId, cookie);
      console.log(`Set session cookie for session ${sessionId}`);
    }
  }

  const server = createServer(sessionId);

  // Clean up on close
  transport.onclose = () => {
    console.log(`Session ${sessionId} closed`);
    transports.delete(sessionId);
    // server.close();
  };

  await server.connect(transport);
});

app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    res.status(400).send('Missing sessionId');
    return;
  }

  const transport = transports.get(sessionId);
  if (!transport) {
    res.status(404).send('Session not found');
    return;
  }

  await transport.handlePostMessage(req, res);
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Netease MCP Server running on port ${PORT}`);
  console.log(`SSE Endpoint: http://localhost:${PORT}/sse`);
});
