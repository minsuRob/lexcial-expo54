#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function checkPort(port) {
  try {
    // lsof 명령어로 포트 사용 확인
    await execAsync(`lsof -i :${port}`);
    return true; // 포트가 사용 중
  } catch (error) {
    return false; // 포트가 사용되지 않음
  }
}

async function findAvailablePort(startPort, maxAttempts = 10) {
  let port = startPort;
  let attempts = 0;

  while (attempts < maxAttempts) {
    if (!(await checkPort(port))) {
      return port;
    }
    console.log(`Port ${port} is in use, trying ${port + 1}...`);
    port++;
    attempts++;
  }

  throw new Error(`Could not find available port after ${maxAttempts} attempts`);
}

async function startExpo() {
  try {
    const port = await findAvailablePort(8081);
    console.log(`Starting Expo on port ${port}...`);

    const expoProcess = spawn('npx', ['expo', 'start', '--clear', '--web', '--port', port.toString()], {
      stdio: 'inherit'
    });

    expoProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(`Expo process exited with code ${code}`);
      }
    });

    expoProcess.on('error', (error) => {
      console.error('Failed to start Expo:', error);
    });

    // 프로세스가 성공적으로 시작되었는지 확인
    setTimeout(() => {
      console.log(`Expo server should be running on http://localhost:${port}`);
    }, 3000);

  } catch (error) {
    console.error('Error starting Expo:', error);
    process.exit(1);
  }
}

startExpo();
