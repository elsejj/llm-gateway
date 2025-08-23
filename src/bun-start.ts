import app from './index';

const defaultPort = process.env.LLM_GATEWAY_PORT || '8787';
const defaultHost = process.env.LLM_GATEWAY_HOST || '127.0.0.1';
const args = process.argv.slice(2);
const portArg = args.find((arg) => arg.startsWith('--port='));
const hostArg = args.find((arg) => arg.startsWith('--host='));
const port = portArg ? parseInt(portArg.split('=')[1]) : parseInt(defaultPort);
const host = hostArg ? hostArg.split('=')[1] : defaultHost;

export default {
  port,
  hostname: host,
  fetch: app.fetch,
};
