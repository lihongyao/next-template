import dotenv from 'dotenv';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

const app = process.env.app || 'afun';
const env = process.env.env || 'dev';
const envFile = path.resolve(process.cwd(), `env/.env.${app}.${env}`);
const startPort = Number(process.env.PORT || 3000);
const nextBin = path.resolve(
  process.cwd(),
  'node_modules/.bin',
  process.platform === 'win32' ? 'next.cmd' : 'next',
);

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, override: true, quiet: true });
  console.log(`[start] loaded env: ${path.relative(process.cwd(), envFile)}`);
} else {
  console.warn(`[start] env file not found: ${path.relative(process.cwd(), envFile)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const port = await findAvailablePort(startPort);

  console.log(`[start] app=${app} env=${env}`);
  console.log(`[start] next start -p ${port}`);

  const child = spawn(nextBin, ['start', '-p', String(port)], {
    env: {
      ...process.env,
      app,
      env,
      PORT: String(port),
    },
    stdio: 'inherit',
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

function findAvailablePort(port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
        findAvailablePort(port + 1).then(resolve, reject);
        return;
      }

      reject(error);
    });

    server.once('listening', () => {
      server.close(() => resolve(port));
    });

    server.listen(port);
  });
}
