#!/usr/bin/env node

/**
 * Server startup script for Klenhub backend
 * 
 * This script starts the backend server with proper logging and error handling.
 * It ensures only one instance of the server is running at a time.
 * 
 * Usage: node start.js
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Path to the PID file
const PID_FILE_PATH = path.join(__dirname, 'server.pid');
// Path to the log file
const LOG_FILE_PATH = path.join(__dirname, 'server.log');

// Function to check if the server is already running
const checkIfServerRunning = () => {
  if (fs.existsSync(PID_FILE_PATH)) {
    try {
      const pid = fs.readFileSync(PID_FILE_PATH, 'utf8').trim();
      
      // Check if process with this PID exists
      try {
        process.kill(pid, 0);
        console.error(`Server is already running with PID: ${pid}`);
        console.error('Use "node shutdown.js" to stop the server first.');
        return true;
      } catch (e) {
        // Process doesn't exist, clean up stale PID file
        console.log('Found stale PID file. Cleaning up...');
        fs.unlinkSync(PID_FILE_PATH);
      }
    } catch (error) {
      console.error('Error reading PID file:', error.message);
      // Try to clean up potentially corrupted PID file
      try {
        fs.unlinkSync(PID_FILE_PATH);
      } catch (e) {
        // Ignore errors when trying to delete the file
      }
    }
  }
  return false;
};

// Function to start the server
const startServer = () => {
  // Check if server is already running
  if (checkIfServerRunning()) {
    return;
  }

  console.log('Starting Klenhub backend server...');
  
  // Open log file for writing
  const logFile = fs.openSync(LOG_FILE_PATH, 'a');
  
  // Spawn the server process
  const serverProcess = spawn('node', ['src/index.js'], {
    cwd: __dirname,
    stdio: ['ignore', logFile, logFile],
    detached: true
  });
  
  // Detach the process so it can run independently
  serverProcess.unref();
  
  console.log(`Server started with PID: ${serverProcess.pid}`);
  console.log(`Logs are being written to: ${LOG_FILE_PATH}`);
  console.log('To stop the server, run: node shutdown.js');
};

// Execute the start process
startServer();
