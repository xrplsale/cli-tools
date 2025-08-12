#!/usr/bin/env node

/**
 * XRPL.Sale CLI Entry Point
 * 
 * This executable script serves as the main entry point for the XRPL.Sale CLI.
 * It handles initial setup, error handling, and routes to the main CLI application.
 */

const path = require('path');
const fs = require('fs');

// Check if we're running in development or production
const isDev = fs.existsSync(path.join(__dirname, '../src'));
const mainPath = isDev 
  ? path.join(__dirname, '../src/index.ts')
  : path.join(__dirname, '../dist/index.js');

if (isDev) {
  // Development mode - use ts-node
  require('ts-node/register');
  require(mainPath);
} else {
  // Production mode - use compiled JavaScript
  require(mainPath);
}