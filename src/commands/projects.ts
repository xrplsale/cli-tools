import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { table } from 'table';
import moment from 'moment';
import { getClient } from '../utils/client';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { handleError } from '../utils/error-handler';
import { requireAuth } from '../utils/auth';
import { outputResult } from '../utils/output';

export const projectsCommand = new Command('projects')
  .alias('project')
  .description('🚀 Manage token sale projects')
  .hook('preAction', requireAuth);

// List projects
projectsCommand
  .command('list')
  .alias('ls')
  .description('📋 List projects')
  .option('-s, --status <status>', 'filter by status (active, upcoming, completed)')
  .option('-p, --page <page>', 'page number', '1')
  .option('-l, --limit <limit>', 'number of items per page', '10')
  .option('--sort-by <field>', 'sort by field (name, created_at, total_raised)')
  .option('--sort-order <order>', 'sort order (asc, desc)', 'desc')
  .action(async (options) => {
    const spinner = ora('Fetching projects...').start();
    
    try {
      const client = await getClient();
      const response = await client.projects.list({
        status: options.status,
        page: parseInt(options.page),
        limit: parseInt(options.limit),
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
      });

      spinner.stop();

      if (options.json) {
        outputResult(response);
        return;
      }

      if (!response.data || response.data.length === 0) {
        console.log(chalk.yellow('📭 No projects found'));
        return;
      }

      // Create table
      const tableData = [
        ['ID', 'Name', 'Status', 'Token', 'Raised', 'Created']
      ];

      response.data.forEach(project => {
        tableData.push([
          project.id.substring(0, 12) + '...',
          project.name.length > 25 ? project.name.substring(0, 22) + '...' : project.name,
          getStatusBadge(project.status),
          project.tokenSymbol,
          formatCurrency(project.totalRaisedXrp || '0', 'XRP'),
          moment(project.createdAt).format('MMM DD, YYYY'),
        ]);
      });

      console.log(table(tableData, {
        border: {
          topBody: `─`,
          topJoin: `┬`,
          topLeft: `┌`,
          topRight: `┐`,
          bottomBody: `─`,
          bottomJoin: `┴`,
          bottomLeft: `└`,
          bottomRight: `┘`,
          bodyLeft: `│`,
          bodyRight: `│`,
          bodyJoin: `│`,
          joinBody: `─`,
          joinLeft: `├`,
          joinRight: `┤`,
          joinJoin: `┼`
        }
      }));

      // Show pagination info
      if (response.pagination) {
        const { page, totalPages, total } = response.pagination;
        console.log(chalk.dim(`\nPage ${page} of ${totalPages} (${total} total projects)`));
      }
    } catch (error) {
      spinner.stop();
      handleError(error);
    }
  });

// Get project details
projectsCommand
  .command('get <projectId>')
  .alias('show')
  .description('🔍 Get project details')
  .action(async (projectId, options) => {
    const spinner = ora(`Fetching project ${projectId}...`).start();
    
    try {
      const client = await getClient();
      const project = await client.projects.get(projectId);
      
      spinner.stop();

      if (options.parent.json) {
        outputResult(project);
        return;
      }

      // Display project details
      console.log(chalk.cyan.bold(`\n🚀 ${project.name}`));
      console.log(chalk.dim('─'.repeat(50)));
      
      console.log(`${chalk.bold('ID:')} ${project.id}`);
      console.log(`${chalk.bold('Status:')} ${getStatusBadge(project.status)}`);
      console.log(`${chalk.bold('Token Symbol:')} ${project.tokenSymbol}`);
      console.log(`${chalk.bold('Total Supply:')} ${formatNumber(project.totalSupply)}`);
      console.log(`${chalk.bold('Total Raised:')} ${formatCurrency(project.totalRaisedXrp || '0', 'XRP')}`);
      console.log(`${chalk.bold('Created:')} ${moment(project.createdAt).format('MMMM DD, YYYY [at] HH:mm')}`);
      
      if (project.description) {
        console.log(`\n${chalk.bold('Description:')}`);
        console.log(project.description);
      }

      if (project.tiers && project.tiers.length > 0) {
        console.log(`\n${chalk.bold('Tiers:')}`);
        project.tiers.forEach((tier, index) => {
          console.log(`  ${index + 1}. Tier ${tier.tier}: ${formatNumber(tier.totalTokens)} tokens at ${tier.pricePerToken} XRP each`);
        });
      }
    } catch (error) {
      spinner.stop();
      handleError(error);
    }
  });

// Create project
projectsCommand
  .command('create')
  .alias('new')
  .description('➕ Create a new project')
  .option('--name <name>', 'project name')
  .option('--description <description>', 'project description')
  .option('--token-symbol <symbol>', 'token symbol')
  .option('--total-supply <supply>', 'total token supply')
  .option('--interactive', 'use interactive mode', true)
  .action(async (options) => {
    try {
      let projectData: any = {};

      if (options.interactive && !options.name) {
        // Interactive mode
        console.log(chalk.cyan.bold('\n🚀 Create New Project\n'));
        
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Project name:',
            validate: (input) => input.length > 0 || 'Project name is required',
          },
          {
            type: 'input',
            name: 'description',
            message: 'Project description:',
            validate: (input) => input.length > 0 || 'Description is required',
          },
          {
            type: 'input',
            name: 'tokenSymbol',
            message: 'Token symbol:',
            validate: (input) => {
              if (input.length === 0) return 'Token symbol is required';
              if (input.length > 10) return 'Token symbol must be 10 characters or less';
              return true;
            },
          },
          {
            type: 'input',
            name: 'totalSupply',
            message: 'Total token supply:',
            validate: (input) => {
              const num = parseFloat(input);
              return !isNaN(num) && num > 0 || 'Must be a valid positive number';
            },
          },
          {
            type: 'confirm',
            name: 'addTiers',
            message: 'Add pricing tiers now?',
            default: true,
          },
        ]);

        projectData = answers;

        if (answers.addTiers) {
          projectData.tiers = [];
          let addMoreTiers = true;
          let tierNumber = 1;

          while (addMoreTiers) {
            console.log(chalk.cyan(`\n📊 Tier ${tierNumber}`));
            
            const tierAnswers = await inquirer.prompt([
              {
                type: 'input',
                name: 'pricePerToken',
                message: 'Price per token (in XRP):',
                validate: (input) => {
                  const num = parseFloat(input);
                  return !isNaN(num) && num > 0 || 'Must be a valid positive number';
                },
              },
              {
                type: 'input',
                name: 'totalTokens',
                message: 'Total tokens for this tier:',
                validate: (input) => {
                  const num = parseFloat(input);
                  return !isNaN(num) && num > 0 || 'Must be a valid positive number';
                },
              },
            ]);

            projectData.tiers.push({
              tier: tierNumber,
              pricePerToken: tierAnswers.pricePerToken,
              totalTokens: tierAnswers.totalTokens,
            });

            const continueAnswer = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'addAnother',
                message: 'Add another tier?',
                default: false,
              },
            ]);

            addMoreTiers = continueAnswer.addAnother;
            tierNumber++;
          }
        }
      } else {
        // Command line mode
        projectData = {
          name: options.name,
          description: options.description,
          tokenSymbol: options.tokenSymbol,
          totalSupply: options.totalSupply,
        };
      }

      const spinner = ora('Creating project...').start();
      
      const client = await getClient();
      const project = await client.projects.create(projectData);
      
      spinner.stop();

      if (options.parent.json) {
        outputResult(project);
        return;
      }

      console.log(chalk.green.bold('\n✅ Project created successfully!'));
      console.log(`${chalk.bold('Project ID:')} ${project.id}`);
      console.log(`${chalk.bold('Name:')} ${project.name}`);
      console.log(`${chalk.bold('Status:')} ${getStatusBadge(project.status)}`);
      
      console.log(chalk.dim('\n💡 Next steps:'));
      console.log(chalk.dim(`   • Configure project details: xrplsale projects update ${project.id}`));
      console.log(chalk.dim(`   • Launch project: xrplsale projects launch ${project.id}`));
    } catch (error) {
      handleError(error);
    }
  });

// Launch project
projectsCommand
  .command('launch <projectId>')
  .description('🚀 Launch a project')
  .option('-y, --yes', 'skip confirmation prompt')
  .action(async (projectId, options) => {
    try {
      if (!options.yes) {
        const answer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to launch project ${projectId}?`,
            default: false,
          },
        ]);

        if (!answer.confirm) {
          console.log(chalk.yellow('❌ Launch cancelled'));
          return;
        }
      }

      const spinner = ora('Launching project...').start();
      
      const client = await getClient();
      const project = await client.projects.launch(projectId);
      
      spinner.stop();

      if (options.parent.json) {
        outputResult(project);
        return;
      }

      console.log(chalk.green.bold('🚀 Project launched successfully!'));
      console.log(`${chalk.bold('Status:')} ${getStatusBadge(project.status)}`);
    } catch (error) {
      handleError(error);
    }
  });

// Project statistics
projectsCommand
  .command('stats <projectId>')
  .alias('statistics')
  .description('📊 Get project statistics')
  .action(async (projectId, options) => {
    const spinner = ora('Fetching project statistics...').start();
    
    try {
      const client = await getClient();
      const stats = await client.projects.stats(projectId);
      
      spinner.stop();

      if (options.parent.json) {
        outputResult(stats);
        return;
      }

      console.log(chalk.cyan.bold(`\n📊 Project Statistics`));
      console.log(chalk.dim('─'.repeat(30)));
      
      console.log(`${chalk.bold('Total Raised:')} ${formatCurrency(stats.totalRaisedXrp || '0', 'XRP')}`);
      console.log(`${chalk.bold('Total Investors:')} ${formatNumber(stats.totalInvestors || '0')}`);
      console.log(`${chalk.bold('Tokens Sold:')} ${formatNumber(stats.tokensSold || '0')}`);
      console.log(`${chalk.bold('Current Tier:')} ${stats.currentTier || 'N/A'}`);
      
      if (stats.progress) {
        console.log(`${chalk.bold('Progress:')} ${(stats.progress * 100).toFixed(1)}%`);
      }
    } catch (error) {
      spinner.stop();
      handleError(error);
    }
  });

// Helper function to get status badge with colors
function getStatusBadge(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return chalk.green('🟢 Active');
    case 'upcoming':
      return chalk.blue('🔵 Upcoming');
    case 'completed':
      return chalk.gray('⚫ Completed');
    case 'paused':
      return chalk.yellow('🟡 Paused');
    case 'cancelled':
      return chalk.red('🔴 Cancelled');
    default:
      return status;
  }
}