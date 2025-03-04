const { spawn } = require('child_process');
const path = require('path');

console.log('Restarting server...');

// Kill any existing node processes if needed
// This is a simple restart script - in production, you'd use a process manager like PM2

const server = spawn('node', ['src/index.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

console.log('Server restarted!');
