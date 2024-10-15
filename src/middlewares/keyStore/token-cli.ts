import { generateApiKey } from './verifyApiKey';

let masterKey = process.env.LLM_GATEWAY_MASTER_KEY;
let expiredDuration = 60 * 60;

for (const arg of process.argv) {
  if (arg.startsWith('--master=') || arg.startsWith('-m=')) {
    masterKey = arg.split('=')[1];
  }
  if (arg.startsWith('--duration=') || arg.startsWith('-d=')) {
    const d = arg.split('=')[1];
    if (d.endsWith('s')) {
      expiredDuration = parseInt(d.slice(0, -1));
    } else if (d.endsWith('m')) {
      expiredDuration = parseInt(d.slice(0, -1)) * 60;
    } else if (d.endsWith('h')) {
      expiredDuration = parseInt(d.slice(0, -1)) * 60 * 60;
    } else if (d.endsWith('d')) {
      expiredDuration = parseInt(d.slice(0, -1)) * 60 * 60 * 24;
    } else if (d.endsWith('M')) {
      expiredDuration = parseInt(d.slice(0, -1)) * 60 * 60 * 24 * 30;
    } else if (d.endsWith('y')) {
      expiredDuration = parseInt(d.slice(0, -1)) * 60 * 60 * 24 * 365;
    } else {
      expiredDuration = parseInt(d);
    }
  }
  if (arg === '--help' || arg === '-h') {
    console.log(`Usage: bun token-cli.ts [options]
      --master | -m: master key, default is from env LLM_GATEWAY_MASTER_KEY
      --duration | -d: duration of token, default is 1h
      --help | -h: show this help message`);
    process.exit(0);
  }
}

if (!masterKey) {
  console.log('Master key is required');
  process.exit(1);
}

const token = await generateApiKey(expiredDuration, masterKey);
console.log(expiredDuration);
console.log(token);
