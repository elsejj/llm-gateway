#!/usr/bin/env node

import { serve } from '@hono/node-server';

import app from './index';

// Extract the port number from the command line arguments
const defaultPort = 8787;
const defaultHost = '127.0.0.1';
const args = process.argv.slice(2);
const portArg = args.find((arg) => arg.startsWith('--port='));
const hostArg = args.find((arg) => arg.startsWith('--host='));
const port = portArg ? parseInt(portArg.split('=')[1]) : defaultPort;
const host = hostArg ? hostArg.split('=')[1] : defaultHost;

serve({
  fetch: app.fetch,
  port: port,
  hostname: host,
});

console.log(`Your AI Gateway is now running on http://${host}:${port} 🚀`);
