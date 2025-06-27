#!/bin/bash

# Jenkins MCP Server Setup Script
# This script helps you set up the Jenkins MCP server quickly

set -e

echo "🚀 Jenkins MCP Server Setup"
echo "=========================="

# Check if .env exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backup created as .env.backup"
    cp .env .env.backup
fi

# Copy environment template
echo "📋 Creating .env file from template..."
cp .env.example .env

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Jenkins credentials:"
echo "   - JENKINS_URL: Your Jenkins server URL"
echo "   - JENKINS_USER: Your Jenkins username"  
echo "   - JENKINS_TOKEN: Your Jenkins API token"
echo ""
echo "2. Build the project:"
echo "   npm run build"
echo ""
echo "3. Test the server:"
echo "   npm run dev"
echo ""
echo "4. Configure your MCP client (Claude Desktop, etc.)"
echo "   See README.md for detailed instructions"
echo ""
echo "🔧 Need help getting a Jenkins API token?"
echo "   1. Go to Jenkins → Your Profile → Configure"
echo "   2. Under 'API Token', click 'Add new Token'"
echo "   3. Copy the generated token to your .env file"
echo ""
echo "📚 For more information, see README.md"
