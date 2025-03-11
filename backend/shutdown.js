#!/usr/bin/env node

/**
 * Server shutdown script for Klenhub backend
 * 
 * This script sends a SIGTERM signal to the running server process,
 * allowing it to gracefully shut down, close connections, and release resources.
 * 
 * Usage: node shutdown.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Path to the PID file
const PID_FILE_PATH = path.join(__dirname, 'server.pid');

// Function to check if the server is running
const isServerRunning = (pid) => {
  try {
    // Sending signal 0 doesn't actually send a signal, but checks if process exists
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
};

// Function to shut down the server
const shutdownServer = () => {
  try {
    // Check if PID file exists
    if (!fs.existsSync(PID_FILE_PATH)) {
      console.error('Server PID file not found. Server may not be running.');
      return;
    }

    // Read the PID from the file
    const pid = fs.readFileSync(PID_FILE_PATH, 'utf8').trim();
    
    if (!pid) {
      console.error('Invalid PID file content.');
      return;
    }

    // Check if the process is running
    if (!isServerRunning(pid)) {
      console.log('Server process is not running. Cleaning up PID file...');
      fs.unlinkSync(PID_FILE_PATH);
      return;
    }

    console.log(`Shutting down server with PID: ${pid}`);
    
    // Send SIGTERM signal to gracefully shut down the server
    process.kill(pid, 'SIGTERM');
    
    // Wait for the server to shut down
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkInterval = setInterval(() => {
      if (!isServerRunning(pid) || attempts >= maxAttempts) {
        clearInterval(checkInterval);
        
        if (attempts >= maxAttempts && isServerRunning(pid)) {
          console.log('Server did not shut down gracefully. Forcing shutdown...');
          try {
            process.kill(pid, 'SIGKILL');
          } catch (e) {
            console.error('Failed to force shutdown:', e.message);
          }
        } else {
          console.log('Server has been shut down successfully.');
        }
        
        // Clean up PID file
        if (fs.existsSync(PID_FILE_PATH)) {
          fs.unlinkSync(PID_FILE_PATH);
        }
      }
      attempts++;
    }, 1000);
  } catch (error) {
    console.error('Error shutting down server:', error.message);
  }
};

// Execute the shutdown process
shutdownServer();
