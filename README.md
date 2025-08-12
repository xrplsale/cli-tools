# XRPL.Sale CLI Tools

Official command-line interface for the XRPL.Sale platform - the native XRPL launchpad for token sales and project funding.

[![npm version](https://img.shields.io/npm/v/@xrplsale/cli.svg)](https://www.npmjs.com/package/@xrplsale/cli)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Project Management** - Create, launch, and manage token sales from the command line
- 💰 **Investment Tracking** - Monitor investments and portfolio performance
- 📊 **Analytics & Reporting** - Access comprehensive platform analytics
- 🔐 **Dual Authentication** - Support for both API keys and XRPL wallet authentication
- 🔔 **Webhook Management** - Configure and test webhook endpoints
- 📱 **Interactive Mode** - User-friendly prompts and wizards
- 🎨 **Rich Output** - Colored output, tables, and progress indicators
- 📋 **JSON Output** - Machine-readable output for scripting and automation
- ⚡ **Auto-completion** - Tab completion for commands and options
- 🔄 **Auto-updates** - Automatic notification of new CLI versions

## Installation

### NPM (Recommended)

```bash
# Install globally
npm install -g @xrplsale/cli

# Or use npx for one-time usage
npx @xrplsale/cli --help
```

### Yarn

```bash
yarn global add @xrplsale/cli
```

### Direct Download

Download the latest release from [GitHub Releases](https://github.com/xrplsale/cli-tools/releases).

## Quick Start

### 1. Authentication

Choose your preferred authentication method:

#### API Key Authentication (Recommended for CI/CD)

```bash
# Interactive login
xrplsale auth login

# Direct API key login
xrplsale auth login --api-key your-api-key

# Environment variable
export XRPLSALE_API_KEY="your-api-key"
xrplsale auth status
```

#### XRPL Wallet Authentication

```bash
# Interactive wallet authentication
xrplsale auth login --interactive

# Direct wallet authentication
xrplsale auth login --wallet rYourWalletAddress...
```

### 2. Basic Usage

```bash
# Check authentication status
xrplsale auth status

# List active projects
xrplsale projects list --status active

# Get project details
xrplsale projects get proj_abc123

# View analytics
xrplsale analytics platform

# Get help
xrplsale --help
xrplsale projects --help
```

## Commands Reference

### Authentication Commands

```bash
# Login with different methods
xrplsale auth login                    # Interactive mode
xrplsale auth login --api-key <key>    # API key authentication
xrplsale auth login --wallet <addr>    # Wallet authentication

# Check current status
xrplsale auth status
xrplsale auth whoami

# Generate API key (requires wallet auth)
xrplsale auth generate-key --name "My CLI Key"

# List your API keys
xrplsale auth list-keys

# Logout
xrplsale auth logout
```

### Project Management

```bash
# List projects
xrplsale projects list
xrplsale projects list --status active --limit 20
xrplsale projects list --sort-by total_raised --sort-order desc

# Get project details
xrplsale projects get proj_abc123
xrplsale projects show proj_abc123 --json

# Create new project
xrplsale projects create                           # Interactive mode
xrplsale projects create --name "My Project" \
                        --description "Description" \
                        --token-symbol "MPT" \
                        --total-supply "1000000"

# Project operations
xrplsale projects launch proj_abc123               # Launch project
xrplsale projects pause proj_abc123                # Pause project
xrplsale projects resume proj_abc123               # Resume project
xrplsale projects cancel proj_abc123               # Cancel project

# Update project
xrplsale projects update proj_abc123 --name "New Name"

# Project statistics
xrplsale projects stats proj_abc123

# Search projects
xrplsale projects search "DeFi" --status active
```

### Investment Management

```bash
# List investments
xrplsale investments list
xrplsale investments list --project proj_abc123
xrplsale investments list --investor rWalletAddr...

# Investment details
xrplsale investments get inv_xyz789

# Create investment
xrplsale investments create proj_abc123 \
                           --amount 100 \
                           --investor rInvestorAddr...

# Simulate investment
xrplsale investments simulate proj_abc123 --amount 100

# Investor summary
xrplsale investments summary rInvestorAddr...

# Export investments
xrplsale investments export --format csv --project proj_abc123
```

### Analytics & Reporting

```bash
# Platform analytics
xrplsale analytics platform
xrplsale analytics platform --period 30d

# Project analytics
xrplsale analytics project proj_abc123
xrplsale analytics project proj_abc123 --start 2025-01-01 --end 2025-01-31

# Market trends
xrplsale analytics trends --period 7d

# Top projects
xrplsale analytics top-projects --metric total_raised --limit 10

# Export analytics data
xrplsale analytics export --type projects --format json
xrplsale analytics export --type investments --format csv --start 2025-01-01
```

### Webhook Management

```bash
# List webhooks
xrplsale webhooks list

# Create webhook
xrplsale webhooks create https://api.example.com/webhooks/xrplsale \
                        --events investment.created,project.launched \
                        --secret your-webhook-secret

# Test webhook
xrplsale webhooks test webhook_123 --event investment.created

# Update webhook
xrplsale webhooks update webhook_123 --url https://new-url.com/webhook

# Delete webhook
xrplsale webhooks delete webhook_123

# Webhook logs
xrplsale webhooks logs webhook_123 --limit 50
```

### Configuration

```bash
# View current configuration
xrplsale config show

# Set configuration values
xrplsale config set api-key your-new-key
xrplsale config set environment testnet
xrplsale config set output-format json

# Get specific config value
xrplsale config get api-key

# Reset configuration
xrplsale config reset

# Export/Import configuration
xrplsale config export > xrplsale-config.json
xrplsale config import xrplsale-config.json
```

### Project Initialization

```bash
# Initialize new project workspace
xrplsale init my-token-project

# Initialize with template
xrplsale init my-defi-project --template defi
xrplsale init my-nft-project --template nft

# Available templates
xrplsale init --list-templates
```

## Advanced Usage

### Environment Variables

```bash
# Authentication
export XRPLSALE_API_KEY="your-api-key"
export XRPLSALE_ENVIRONMENT="production"  # or "testnet"

# Output formatting
export XRPLSALE_OUTPUT_FORMAT="json"      # or "table"
export XRPLSALE_NO_COLOR="true"           # Disable colors

# Configuration
export XRPLSALE_CONFIG_PATH="/path/to/config.json"
export XRPLSALE_DEBUG="true"              # Enable debug output
```

### Configuration File

Create `~/.xrplsale/config.json`:

```json
{
  "apiKey": "your-api-key",
  "environment": "production",
  "outputFormat": "table",
  "webhookSecret": "your-webhook-secret",
  "defaults": {
    "projectsLimit": 20,
    "investmentsLimit": 50
  }
}
```

### Batch Operations

```bash
# Create multiple projects from CSV
xrplsale projects import projects.csv

# Bulk update projects
xrplsale projects bulk-update --status active --action pause

# Export all data
xrplsale analytics export-all --format json --output ./exports/
```

### Scripting and Automation

```bash
#!/bin/bash
# Example deployment script

# Check authentication
if ! xrplsale auth status --json | jq -r '.authenticated' | grep -q true; then
  echo "Not authenticated"
  exit 1
fi

# Create project
PROJECT=$(xrplsale projects create \
  --name "Automated Project" \
  --description "Created via script" \
  --token-symbol "AUTO" \
  --total-supply "1000000" \
  --json | jq -r '.id')

echo "Created project: $PROJECT"

# Launch project
xrplsale projects launch $PROJECT --yes

# Monitor until first investment
while true; do
  STATS=$(xrplsale projects stats $PROJECT --json)
  INVESTORS=$(echo $STATS | jq -r '.totalInvestors')
  
  if [ "$INVESTORS" -gt 0 ]; then
    echo "First investment received!"
    break
  fi
  
  echo "Waiting for investments..."
  sleep 30
done
```

### Integration with CI/CD

#### GitHub Actions

```yaml
name: Deploy Project
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install XRPL.Sale CLI
        run: npm install -g @xrplsale/cli
        
      - name: Deploy Project
        env:
          XRPLSALE_API_KEY: ${{ secrets.XRPLSALE_API_KEY }}
        run: |
          xrplsale projects create \
            --name "${{ github.event.repository.name }}" \
            --description "${{ github.event.head_commit.message }}" \
            --token-symbol "PROJ" \
            --total-supply "1000000"
```

#### Docker

```dockerfile
FROM node:18-alpine
RUN npm install -g @xrplsale/cli
COPY . /app
WORKDIR /app
CMD ["xrplsale", "analytics", "platform"]
```

### Interactive Features

The CLI includes several interactive features:

- **Project Creation Wizard** - Step-by-step project setup
- **Wallet Authentication Flow** - QR codes and signature prompts
- **Investment Simulation** - Interactive investment calculator
- **Configuration Setup** - Guided initial configuration

### Output Formats

#### Table Format (Default)

```bash
xrplsale projects list
```

```
┌──────────────┬─────────────────────┬─────────┬───────┬──────────┬─────────────┐
│ ID           │ Name                │ Status  │ Token │ Raised   │ Created     │
├──────────────┼─────────────────────┼─────────┼───────┼──────────┼─────────────┤
│ proj_abc123… │ My DeFi Protocol    │ 🟢 Act… │ MDP   │ 15,250 … │ Jan 15, 2025│
│ proj_def456… │ NFT Marketplace     │ 🔵 Up…  │ NFT   │ 0 XRP    │ Jan 14, 2025│
└──────────────┴─────────────────────┴─────────┴───────┴──────────┴─────────────┘
```

#### JSON Format

```bash
xrplsale projects list --json
```

```json
{
  "data": [
    {
      "id": "proj_abc123",
      "name": "My DeFi Protocol",
      "status": "active",
      "tokenSymbol": "MDP",
      "totalRaisedXrp": "15250.00",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "totalPages": 5,
    "total": 47
  }
}
```

## Error Handling

The CLI provides detailed error messages and suggestions:

```bash
$ xrplsale projects get invalid-project-id

❌ Error: Project not found
💡 Suggestion: Check the project ID with 'xrplsale projects list'

$ xrplsale projects create --name ""

❌ Validation Error: Project name is required
💡 Use 'xrplsale projects create' for interactive mode
```

## Debugging

Enable debug mode for detailed logging:

```bash
# Environment variable
export XRPLSALE_DEBUG=true
xrplsale projects list

# Command line flag
xrplsale --debug projects list

# Verbose HTTP requests
xrplsale --debug --verbose projects list
```

## Examples

### Create and Launch a Project

```bash
# Interactive project creation
xrplsale projects create

# Quick project creation and launch
PROJECT_ID=$(xrplsale projects create \
  --name "My Token" \
  --description "Revolutionary token" \
  --token-symbol "MTK" \
  --total-supply "1000000" \
  --json | jq -r '.id')

xrplsale projects launch $PROJECT_ID --yes
xrplsale projects stats $PROJECT_ID
```

### Monitor Project Performance

```bash
#!/bin/bash
# Monitor script

PROJECT_ID="proj_abc123"

while true; do
  clear
  echo "=== Project Dashboard ==="
  xrplsale projects get $PROJECT_ID
  echo ""
  xrplsale projects stats $PROJECT_ID
  echo ""
  xrplsale investments list --project $PROJECT_ID --limit 5
  sleep 30
done
```

### Webhook Testing

```bash
# Create test webhook
WEBHOOK_ID=$(xrplsale webhooks create \
  https://webhook.site/unique-url \
  --events investment.created \
  --json | jq -r '.id')

# Test webhook
xrplsale webhooks test $WEBHOOK_ID --event investment.created

# Check webhook logs
xrplsale webhooks logs $WEBHOOK_ID
```

## Tab Completion

Enable tab completion for your shell:

### Bash

```bash
echo 'eval "$(xrplsale completion bash)"' >> ~/.bashrc
source ~/.bashrc
```

### Zsh

```bash
echo 'eval "$(xrplsale completion zsh)"' >> ~/.zshrc
source ~/.zshrc
```

### Fish

```bash
xrplsale completion fish > ~/.config/fish/completions/xrplsale.fish
```

## API Reference

The CLI uses the same API as the platform SDKs. For detailed API documentation, visit:

- [API Documentation](https://www.xrpl.sale/documentation/api-reference)
- [CLI API Reference](https://www.xrpl.sale/documentation/cli/api)

## Troubleshooting

### Common Issues

**Authentication Failed**
```bash
# Check your credentials
xrplsale auth status

# Re-authenticate
xrplsale auth logout
xrplsale auth login
```

**Command Not Found**
```bash
# Check installation
npm list -g @xrplsale/cli

# Reinstall if needed
npm install -g @xrplsale/cli
```

**Network Errors**
```bash
# Check environment
xrplsale config get environment

# Try testnet
xrplsale config set environment testnet
```

**Permission Errors**
```bash
# Install with sudo (Linux/macOS)
sudo npm install -g @xrplsale/cli

# Or use npx
npx @xrplsale/cli projects list
```

### Getting Help

```bash
# General help
xrplsale --help

# Command-specific help
xrplsale projects --help
xrplsale auth login --help

# Version information
xrplsale --version

# Check for updates
npm update -g @xrplsale/cli
```

## Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/xrplsale/cli-tools.git
cd cli-tools

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Link for local testing
npm link
```

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Support

- 📖 [Documentation](https://www.xrpl.sale/documentation/cli)
- 💬 [Discord Community](https://discord.gg/xrpl-sale)
- 🐛 [Issue Tracker](https://github.com/xrplsale/cli-tools/issues)
- 📧 [Email Support](mailto:developers@xrpl.sale)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [XRPL.Sale Platform](https://xrpl.sale)
- [API Documentation](https://www.xrpl.sale/documentation/api-reference)
- [Other SDKs](https://www.xrpl.sale/documentation/developers/sdk-downloads)
- [GitHub Organization](https://github.com/xrplsale)

---

Made with ❤️ by the XRPL.Sale team