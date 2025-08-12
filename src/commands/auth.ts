import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import qrcode from 'qrcode-terminal';
import clipboard from 'clipboard';
import { config } from '../config';
import { getClient } from '../utils/client';
import { handleError } from '../utils/error-handler';
import { outputResult } from '../utils/output';

export const authCommand = new Command('auth')
  .description('🔐 Authentication and API key management');

// Login command
authCommand
  .command('login')
  .description('🔑 Authenticate with XRPL.Sale')
  .option('--api-key <key>', 'API key for authentication')
  .option('--wallet <address>', 'XRPL wallet address for wallet authentication')
  .option('--interactive', 'use interactive wallet authentication', false)
  .action(async (options) => {
    try {
      if (options.apiKey) {
        // API key authentication
        const spinner = ora('Validating API key...').start();
        
        try {
          // Save API key to config
          await config.set('apiKey', options.apiKey);
          
          // Test the API key
          const client = await getClient();
          await client.auth.validateApiKey();
          
          spinner.stop();
          console.log(chalk.green('✅ Successfully authenticated with API key'));
          
          // Show current user info
          const userInfo = await client.auth.getCurrentUser();
          console.log(`${chalk.bold('Logged in as:')} ${userInfo.email || userInfo.walletAddress}`);
        } catch (error) {
          spinner.stop();
          await config.delete('apiKey');
          throw new Error('Invalid API key');
        }
      } else if (options.wallet || options.interactive) {
        // Wallet authentication
        let walletAddress = options.wallet;
        
        if (!walletAddress) {
          const answer = await inquirer.prompt([
            {
              type: 'input',
              name: 'walletAddress',
              message: 'Enter your XRPL wallet address:',
              validate: (input) => {
                return input.startsWith('r') && input.length >= 25 
                  || 'Please enter a valid XRPL wallet address';
              },
            },
          ]);
          walletAddress = answer.walletAddress;
        }

        const spinner = ora('Generating authentication challenge...').start();
        
        const client = await getClient();
        const challenge = await client.auth.generateChallenge(walletAddress);
        
        spinner.stop();

        console.log(chalk.cyan.bold('\n🔐 Wallet Authentication'));
        console.log(chalk.dim('─'.repeat(40)));
        console.log(`${chalk.bold('Wallet Address:')} ${walletAddress}`);
        console.log(`${chalk.bold('Challenge:')} ${challenge.challenge}`);
        console.log(`${chalk.bold('Timestamp:')} ${challenge.timestamp}`);

        // Show QR code for mobile wallets
        console.log(chalk.cyan('\n📱 QR Code for mobile wallets:'));
        qrcode.generate(challenge.challenge, { small: true });

        // Copy to clipboard
        try {
          clipboard.writeSync(challenge.challenge);
          console.log(chalk.green('📋 Challenge copied to clipboard!'));
        } catch (error) {
          console.log(chalk.yellow('⚠️  Could not copy to clipboard'));
        }

        console.log(chalk.yellow('\n⚡ Please sign this challenge with your XRPL wallet'));
        console.log(chalk.dim('   • Use your preferred XRPL wallet (Xaman, Crossmark, etc.)'));
        console.log(chalk.dim('   • Sign the challenge message'));
        console.log(chalk.dim('   • Enter the signature below'));

        const signatureAnswer = await inquirer.prompt([
          {
            type: 'input',
            name: 'signature',
            message: 'Enter the signature:',
            validate: (input) => input.length > 0 || 'Signature is required',
          },
        ]);

        const authSpinner = ora('Authenticating with signature...').start();
        
        try {
          const authResult = await client.auth.authenticate({
            walletAddress,
            signature: signatureAnswer.signature,
            timestamp: challenge.timestamp,
          });

          // Save auth token
          await config.set('authToken', authResult.token);
          await config.set('walletAddress', walletAddress);
          
          authSpinner.stop();
          console.log(chalk.green('✅ Successfully authenticated with wallet!'));
          console.log(`${chalk.bold('Wallet:')} ${walletAddress}`);
          console.log(`${chalk.bold('Token expires:')} ${new Date(authResult.expiresAt).toLocaleString()}`);
        } catch (error) {
          authSpinner.stop();
          throw new Error('Authentication failed. Please check your signature.');
        }
      } else {
        // Interactive mode - choose authentication method
        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'method',
            message: 'Choose authentication method:',
            choices: [
              { name: '🔑 API Key', value: 'apiKey' },
              { name: '👛 XRPL Wallet', value: 'wallet' },
            ],
          },
        ]);

        if (answer.method === 'apiKey') {
          const apiKeyAnswer = await inquirer.prompt([
            {
              type: 'password',
              name: 'apiKey',
              message: 'Enter your API key:',
              mask: '*',
              validate: (input) => input.length > 0 || 'API key is required',
            },
          ]);

          // Recursively call with API key
          return authCommand.commands
            .find(cmd => cmd.name() === 'login')
            ?.action({ apiKey: apiKeyAnswer.apiKey });
        } else {
          // Recursively call with wallet authentication
          return authCommand.commands
            .find(cmd => cmd.name() === 'login')
            ?.action({ interactive: true });
        }
      }
    } catch (error) {
      handleError(error);
    }
  });

// Logout command
authCommand
  .command('logout')
  .description('🚪 Logout and clear stored credentials')
  .action(async (options) => {
    try {
      const spinner = ora('Logging out...').start();
      
      // Clear stored credentials
      await config.delete('apiKey');
      await config.delete('authToken');
      await config.delete('walletAddress');
      
      spinner.stop();
      console.log(chalk.green('✅ Successfully logged out'));
      console.log(chalk.dim('💡 Use "xrplsale auth login" to authenticate again'));
    } catch (error) {
      handleError(error);
    }
  });

// Status command
authCommand
  .command('status')
  .alias('whoami')
  .description('👤 Show current authentication status')
  .action(async (options) => {
    try {
      const apiKey = await config.get('apiKey');
      const authToken = await config.get('authToken');
      const walletAddress = await config.get('walletAddress');

      if (options.parent.json) {
        outputResult({
          authenticated: !!(apiKey || authToken),
          authMethod: apiKey ? 'apiKey' : authToken ? 'wallet' : null,
          walletAddress: walletAddress || null,
        });
        return;
      }

      if (!apiKey && !authToken) {
        console.log(chalk.red('❌ Not authenticated'));
        console.log(chalk.dim('💡 Use "xrplsale auth login" to authenticate'));
        return;
      }

      console.log(chalk.green('✅ Authenticated'));
      
      if (apiKey) {
        console.log(`${chalk.bold('Method:')} API Key`);
        console.log(`${chalk.bold('API Key:')} ${apiKey.substring(0, 8)}${'*'.repeat(Math.max(0, apiKey.length - 8))}`);
      }
      
      if (authToken && walletAddress) {
        console.log(`${chalk.bold('Method:')} XRPL Wallet`);
        console.log(`${chalk.bold('Wallet:')} ${walletAddress}`);
        
        try {
          const client = await getClient();
          const userInfo = await client.auth.getCurrentUser();
          
          if (userInfo.tier) {
            console.log(`${chalk.bold('Tier:')} ${userInfo.tier}`);
          }
          
          if (userInfo.tokenBalance) {
            console.log(`${chalk.bold('XSALE Balance:')} ${userInfo.tokenBalance}`);
          }
        } catch (error) {
          console.log(chalk.yellow('⚠️  Could not fetch user details'));
        }
      }
    } catch (error) {
      handleError(error);
    }
  });

// Generate API key command
authCommand
  .command('generate-key')
  .alias('gen-key')
  .description('🔑 Generate a new API key')
  .option('--name <name>', 'API key name/description')
  .action(async (options) => {
    try {
      // Check if already authenticated
      const authToken = await config.get('authToken');
      if (!authToken) {
        console.log(chalk.red('❌ You must be authenticated with a wallet to generate API keys'));
        console.log(chalk.dim('💡 Use "xrplsale auth login --interactive" first'));
        return;
      }

      const keyName = options.name || `CLI Key - ${new Date().toISOString()}`;
      
      const spinner = ora('Generating API key...').start();
      
      const client = await getClient();
      const apiKey = await client.auth.generateApiKey({ name: keyName });
      
      spinner.stop();

      if (options.parent.json) {
        outputResult(apiKey);
        return;
      }

      console.log(chalk.green.bold('🔑 API Key Generated Successfully!'));
      console.log(chalk.dim('─'.repeat(50)));
      console.log(`${chalk.bold('Name:')} ${apiKey.name}`);
      console.log(`${chalk.bold('Key:')} ${chalk.cyan(apiKey.key)}`);
      console.log(`${chalk.bold('Created:')} ${new Date(apiKey.createdAt).toLocaleString()}`);
      
      console.log(chalk.yellow.bold('\n⚠️  IMPORTANT:'));
      console.log(chalk.yellow('   • Save this API key securely'));
      console.log(chalk.yellow('   • This is the only time you will see the full key'));
      console.log(chalk.yellow('   • Use it with: xrplsale auth login --api-key <key>'));

      // Offer to copy to clipboard
      try {
        const copyAnswer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'copy',
            message: 'Copy API key to clipboard?',
            default: true,
          },
        ]);

        if (copyAnswer.copy) {
          clipboard.writeSync(apiKey.key);
          console.log(chalk.green('📋 API key copied to clipboard!'));
        }
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not copy to clipboard'));
      }
    } catch (error) {
      handleError(error);
    }
  });

// List API keys command
authCommand
  .command('list-keys')
  .alias('keys')
  .description('📋 List your API keys')
  .action(async (options) => {
    try {
      const authToken = await config.get('authToken');
      if (!authToken) {
        console.log(chalk.red('❌ You must be authenticated with a wallet to list API keys'));
        return;
      }

      const spinner = ora('Fetching API keys...').start();
      
      const client = await getClient();
      const apiKeys = await client.auth.listApiKeys();
      
      spinner.stop();

      if (options.parent.json) {
        outputResult(apiKeys);
        return;
      }

      if (!apiKeys || apiKeys.length === 0) {
        console.log(chalk.yellow('📭 No API keys found'));
        console.log(chalk.dim('💡 Use "xrplsale auth generate-key" to create one'));
        return;
      }

      console.log(chalk.cyan.bold(`\n🔑 Your API Keys (${apiKeys.length})`));
      console.log(chalk.dim('─'.repeat(50)));

      apiKeys.forEach((key: any, index: number) => {
        console.log(`${index + 1}. ${chalk.bold(key.name)}`);
        console.log(`   ${chalk.dim('Key:')} ${key.keyPrefix}${'*'.repeat(32)}`);
        console.log(`   ${chalk.dim('Created:')} ${new Date(key.createdAt).toLocaleString()}`);
        console.log(`   ${chalk.dim('Last Used:')} ${key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}`);
        console.log('');
      });
    } catch (error) {
      handleError(error);
    }
  });