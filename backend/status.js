#!/usr/bin/env node

/**
 * Server status script for Klenhub backend
 * 
 * This script checks if the server is running and displays basic status information.
 * 
 * Usage: node status.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Path to the PID file
const PID_FILE_PATH = path.join(__dirname, 'server.pid');
// Path to the log file
const LOG_FILE_PATH = path.join(__dirname, 'server.log');

// Function to format uptime
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
};

// Function to get process memory usage in MB
const getMemoryUsage = (pid) => {
  try {
    // This works on Windows
    const output = execSync(`powershell "Get-Process -Id ${pid} | Select-Object WorkingSet64"`, { encoding: 'utf8' });
    const match = output.match(/\d+/);
    if (match) {
      return (parseInt(match[0]) / (1024 * 1024)).toFixed(2);
    }
    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
};

// Function to get CPU usage
const getCpuUsage = (pid) => {
  try {
    // This works on Windows
    const output = execSync(`powershell "Get-Process -Id ${pid} | Select-Object CPU"`, { encoding: 'utf8' });
    const match = output.match(/\d+(\.\d+)?/);
    if (match) {
      return `${match[0]}%`;
    }
    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
};

// Function to check if the server is running
const checkServerStatus = () => {
  console.log('=== Klenhub Backend Server Status ===\n');
  
  if (!fs.existsSync(PID_FILE_PATH)) {
    console.log('Status: STOPPED');
    console.log('The server is not running. Use "node start.js" to start it.');
    return;
  }
  
  try {
    const pid = fs.readFileSync(PID_FILE_PATH, 'utf8').trim();
    
    // Check if process with this PID exists
    try {
      process.kill(pid, 0);
      
      // Get process start time
      let startTime;
      try {
        const output = execSync(`powershell "Get-Process -Id ${pid} | Select-Object StartTime"`, { encoding: 'utf8' });
        const match = output.match(/\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}:\d{2} [AP]M/);
        if (match) {
          startTime = new Date(match[0]);
        }
      } catch (e) {
        startTime = null;
      }
      
      // Get system info
      const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
      const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
      
      console.log('Status: RUNNING');
      console.log(`Process ID: ${pid}`);
      
      if (startTime) {
        const uptime = (Date.now() - startTime.getTime()) / 1000;
        console.log(`Started: ${startTime.toLocaleString()}`);
        console.log(`Uptime: ${formatUptime(uptime)}`);
      }
      
      console.log(`Memory Usage: ${getMemoryUsage(pid)} MB`);
      console.log(`CPU Usage: ${getCpuUsage(pid)}`);
      console.log(`System Memory: ${freeMem}GB free of ${totalMem}GB`);
      
      // Get recent logs
      if (fs.existsSync(LOG_FILE_PATH)) {
        try {
          const logs = execSync(`powershell "Get-Content -Path '${LOG_FILE_PATH}' -Tail 5"`, { encoding: 'utf8' });
          console.log('\nRecent Logs:');
          console.log('------------');
          console.log(logs.trim());
        } catch (e) {
          console.log('\nCould not read recent logs.');
        }
      }
      
      console.log('\nCommands:');
      console.log('  node start.js   - Start the server');
      console.log('  node shutdown.js - Stop the server');
      console.log('  node status.js   - Show this status');
      
    } catch (e) {
      console.log('Status: STOPPED (Stale PID file)');
      console.log(`The server with PID ${pid} is not running, but a PID file exists.`);
      console.log('Use "node start.js" to start the server.');
      
      // Clean up stale PID file
      try {
        fs.unlinkSync(PID_FILE_PATH);
        console.log('Cleaned up stale PID file.');
      } catch (e) {
        console.error('Failed to clean up stale PID file:', e.message);
      }
    }
  } catch (error) {
    console.error('Error reading PID file:', error.message);
    console.log('Status: UNKNOWN');
    console.log('Could not determine server status due to an error.');
  }
};

// Execute the status check
checkServerStatus();
