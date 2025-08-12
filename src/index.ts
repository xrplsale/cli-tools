#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import updateNotifier from 'update-notifier';
import { config } from './config';
import { setupCommands } from './commands';
import { handleError } from './utils/error-handler';
import { checkAuth } from './utils/auth';

const pkg = require('../package.json');

/**
 * Main CLI application entry point
 */
async function main() {
  try {
    // Check for updates
    const notifier = updateNotifier({ pkg });
    notifier.notify({
      defer: false,
      isGlobal: true,
    });

    // Create the main command
    const program = new Command();

    // Configure the main command
    program
      .name('xrplsale')
      .description(chalk.cyan('🚀 XRPL.Sale CLI - Native XRPL Launchpad Platform'))
      .version(pkg.version, '-v, --version', 'display version number')
      .helpOption('-h, --help', 'display help for command');

    // Global options
    program
      .option('--api-key <key>', 'XRPL.Sale API key')
      .option('--environment <env>', 'API environment (production|testnet)', 'production')
      .option('--config <path>', 'path to config file')
      .option('--debug', 'enable debug output')
      .option('--json', 'output results in JSON format')
      .option('--no-color', 'disable colored output');

    // Set up all commands
    setupCommands(program);

    // Parse arguments
    program.parse();

    // If no command was provided, show help
    if (!process.argv.slice(2).length) {
      program.outputHelp();
      console.log(chalk.dim('\n💡 Get started with: xrplsale auth login'));
      console.log(chalk.dim('📚 Learn more: https://docs.xrpl.sale/cli'));
    }
  } catch (error) {
    handleError(error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n❌ Uncaught Exception:'));
  handleError(error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('\n❌ Unhandled Promise Rejection:'));
  handleError(reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Goodbye!'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n\n👋 Goodbye!'));
  process.exit(0);
});

// Run the CLI
main();