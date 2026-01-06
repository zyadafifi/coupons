#!/usr/bin/env node

/**
 * Android Doctor - Environment Checker
 * 
 * Validates that Capacitor commands are run from the correct directory.
 * Prevents common mistakes like running cap commands from inside /android folder.
 * 
 * Usage: node scripts/android-doctor.mjs
 */

import { existsSync } from 'fs';
import { resolve, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function logSection(title) {
  console.log('');
  log(`═══════════════════════════════════════════════`, colors.bold);
  log(`  ${title}`, colors.bold);
  log(`═══════════════════════════════════════════════`, colors.bold);
}

/**
 * Main doctor checks
 */
function runDiagnostics() {
  logSection('Android Environment Doctor');
  
  const cwd = process.cwd();
  const currentDir = basename(cwd);
  let hasErrors = false;

  // Check 1: Current working directory
  logInfo(`Current directory: ${cwd}`);
  console.log('');

  // Check 2: Are we inside /android folder?
  if (currentDir === 'android' || cwd.endsWith('/android') || cwd.endsWith('\\android')) {
    logError('FATAL: You are inside the /android folder!');
    console.log('');
    log('  Capacitor commands MUST be run from the PROJECT ROOT, not from /android.', colors.red);
    console.log('');
    log('  To fix:', colors.yellow);
    log('  1. cd ..', colors.yellow);
    log('  2. Run your command again from the root folder', colors.yellow);
    console.log('');
    process.exit(1);
  }

  logSuccess('Not inside /android folder');

  // Check 3: Does capacitor.config exist?
  const configFiles = [
    'capacitor.config.ts',
    'capacitor.config.js',
    'capacitor.config.json'
  ];
  
  let foundConfig = false;
  for (const configFile of configFiles) {
    if (existsSync(resolve(cwd, configFile))) {
      logSuccess(`Found ${configFile}`);
      foundConfig = true;
      break;
    }
  }

  if (!foundConfig) {
    logError('Capacitor config not found!');
    logWarning('Expected one of: capacitor.config.ts, capacitor.config.js, capacitor.config.json');
    hasErrors = true;
  }

  // Check 4: Does android/ folder exist?
  const androidPath = resolve(cwd, 'android');
  if (existsSync(androidPath)) {
    logSuccess('Found android/ folder');
  } else {
    logError('android/ folder not found!');
    logWarning('Run "npx cap add android" to add Android platform');
    hasErrors = true;
  }

  // Check 5: Does package.json exist?
  const packageJsonPath = resolve(cwd, 'package.json');
  if (existsSync(packageJsonPath)) {
    logSuccess('Found package.json');
  } else {
    logWarning('package.json not found (optional but recommended)');
  }

  // Check 6: Does node_modules exist?
  const nodeModulesPath = resolve(cwd, 'node_modules');
  if (existsSync(nodeModulesPath)) {
    logSuccess('Found node_modules/');
  } else {
    logWarning('node_modules/ not found - run "npm install" first');
  }

  // Summary
  logSection('Summary');
  
  if (hasErrors) {
    logError('Environment check failed!');
    console.log('');
    logInfo('Please fix the errors above before running Capacitor commands.');
    process.exit(1);
  } else {
    logSuccess('All checks passed!');
    console.log('');
    logInfo('You can safely run Capacitor commands from this directory.');
    console.log('');
    log('  Common commands:', colors.cyan);
    log('  • npm run cap:sync:android     - Sync web assets to Android', colors.cyan);
    log('  • npm run cap:open:android     - Open in Android Studio', colors.cyan);
    log('  • npm run android:run          - Open Android Studio with instructions', colors.cyan);
    console.log('');
  }
}

// Run diagnostics
try {
  runDiagnostics();
} catch (error) {
  logError(`Doctor failed: ${error.message}`);
  process.exit(1);
}

