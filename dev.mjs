import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, 'backend');
const frontendDir = path.resolve(__dirname, 'frontend');

// 1. Locate PHP binary
let phpBin = 'php';
const xamppPhp = 'C:\\xampp\\php\\php.exe';
if (process.env.PHP_BIN && fs.existsSync(process.env.PHP_BIN)) {
  phpBin = process.env.PHP_BIN;
} else if (fs.existsSync(xamppPhp)) {
  phpBin = xamppPhp;
}

console.log(`\x1b[35m[ERN Dev]\x1b[0m Checking environment...`);

let phpProcess = null;
let viteProcess = null;

function cleanup() {
  console.log(`\n\x1b[35m[ERN Dev]\x1b[0m Stopping all services...`);
  if (phpProcess && phpProcess.pid) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', phpProcess.pid.toString(), '/f', '/t']);
      } else {
        phpProcess.kill();
      }
    } catch {}
  }
  if (viteProcess && viteProcess.pid) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', viteProcess.pid.toString(), '/f', '/t']);
      } else {
        viteProcess.kill();
      }
    } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Check if PHP server is already active on port 8000
const req = http.get('http://localhost:8000', () => {
  console.log(`\x1b[36m[PHP Backend]\x1b[0m Port 8000 is already active. Using existing backend.`);
  startVite();
});

req.on('error', () => {
  console.log(`\x1b[32m[PHP Backend]\x1b[0m Starting PHP server on http://localhost:8000 with ${phpBin}...`);
  phpProcess = spawn(phpBin, ['-S', '0.0.0.0:8000', '-t', backendDir], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: false,
  });

  phpProcess.on('error', (err) => {
    console.error(`\x1b[31m[PHP Backend Error]\x1b[0m ${err.message}`);
  });

  // Give PHP 200ms to bind, then start Vite
  setTimeout(startVite, 300);
});

function startVite() {
  console.log(`\x1b[34m[Vite Frontend]\x1b[0m Starting Vite dev server...`);
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  
  viteProcess = spawn(npmCmd, ['run', 'dev'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true,
  });

  viteProcess.on('error', (err) => {
    console.error(`\x1b[31m[Vite Error]\x1b[0m ${err.message}`);
  });
}
