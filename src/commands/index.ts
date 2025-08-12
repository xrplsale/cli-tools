import { Command } from 'commander';
import { authCommand } from './auth';
import { projectsCommand } from './projects';
import { investmentsCommand } from './investments';
import { analyticsCommand } from './analytics';
import { webhooksCommand } from './webhooks';
import { configCommand } from './config';
import { initCommand } from './init';

/**
 * Set up all CLI commands
 */
export function setupCommands(program: Command): void {
  // Authentication commands
  program.addCommand(authCommand);

  // Project management commands
  program.addCommand(projectsCommand);

  // Investment commands
  program.addCommand(investmentsCommand);

  // Analytics commands
  program.addCommand(analyticsCommand);

  // Webhook commands
  program.addCommand(webhooksCommand);

  // Configuration commands
  program.addCommand(configCommand);

  // Initialization command
  program.addCommand(initCommand);
}