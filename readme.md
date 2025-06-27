# Jenkins Server MCP

A Model Context Protocol (MCP) server that provides tools for interacting with Jenkins CI/CD servers. This server enables AI assistants to check build statuses, trigger builds, and retrieve build logs through a standardized interface.

## Features

- 🔧 **Build Management**: Trigger builds with parameters
- 📊 **Status Monitoring**: Check build statuses and results
- 📝 **Log Access**: Retrieve console outputs from builds
- 🔍 **Parameter Inspection**: Get build parameters from current and historical builds
- 🏆 **Success Tracking**: Find parameters from latest successful builds
- 🔒 **Secure Configuration**: Environment-based credential management

## Project Structure

```
src/
├── config/          # Configuration and environment validation
├── services/        # Jenkins API service layer
├── tools/          # MCP tool definitions and handlers
├── types/          # TypeScript type definitions
├── utils/          # Utility functions and validation
└── index.ts        # Main server entry point
```

## Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/jenkins-server-mcp.git
cd jenkins-server-mcp
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your Jenkins credentials
```

4. **Build the project:**

```bash
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
JENKINS_URL=https://your-jenkins-server.com
JENKINS_USER=your-username
JENKINS_TOKEN=your-api-token

# Optional
SERVER_NAME=jenkins-server
SERVER_VERSION=0.1.0
```

### Getting Jenkins API Token

1. Log into your Jenkins server
2. Click your name in the top right corner
3. Click "Configure"
4. Under "API Token", click "Add new Token"
5. Give it a name and click "Generate"
6. Copy the generated token to your `.env` file

### MCP Client Configuration

#### For Claude Desktop

**MacOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "jenkins-server": {
      "command": "node",
      "args": ["/absolute/path/to/jenkins-server-mcp/build/index.js"],
      "env": {
        "JENKINS_URL": "https://your-jenkins-server.com",
        "JENKINS_USER": "your-username",
        "JENKINS_TOKEN": "your-api-token"
      }
    }
  }
}
```

#### For Other MCP Clients

Refer to your MCP client's documentation for configuration. The server runs as a stdio-based MCP server.

## Available Tools

### `get_build_status`

Get the status of one or more Jenkins builds.

**Parameters:**

- `jobPaths`: Array of job paths (e.g., `["folder/job-name", "simple-job"]`)
- `buildNumbers`: Array of build numbers (use `"lastBuild"` for most recent)

### `trigger_build`

Trigger a new Jenkins build with optional parameters.

**Parameters:**

- `jobPath`: Path to the Jenkins job
- `parameters`: Object with build parameters (optional)

### `get_build_log`

Get the console output of a Jenkins build.

**Parameters:**

- `jobPath`: Path to the Jenkins job
- `buildNumber`: Build number (use `"lastBuild"` for most recent)

### `get_latest_success_build_params`

Get parameters from the latest successful build for one or more jobs.

**Parameters:**

- `jobPaths`: Array of job paths

### `get_build_params`

Get parameters and status from specific builds.

**Parameters:**

- `jobPaths`: Array of job paths
- `buildNumbers`: Array of build numbers (must match jobPaths length)

## Development

### Scripts

```bash
# Build the project
npm run build

# Build and watch for changes
npm run build:watch

# Run the built server
npm run start

# Build and run (development)
npm run dev

# Clean build directory
npm run clean

# Run MCP inspector for debugging
npm run inspector
```

### Adding New Features

1. **Add types** in `src/types/index.ts`
2. **Create service methods** in `src/services/jenkins.ts`
3. **Add tool definition** in `src/tools/definitions.ts`
4. **Implement handler** in `src/tools/handlers.ts`
5. **Register in main server** in `src/index.ts`

## Security Best Practices

- ✅ Environment variables for sensitive data
- ✅ `.env` files in `.gitignore`
- ✅ Environment validation on startup
- ✅ Input validation for all tools
- ✅ Error handling without exposing internals
- ✅ Timeout configuration for API calls

## Troubleshooting

### Common Issues

1. **"Required environment variables not set"**

   - Ensure `.env` file exists and contains all required variables
   - Check that variables are not empty or just whitespace

2. **"Jenkins API error: 401"**

   - Verify your username and API token are correct
   - Ensure the token has necessary permissions

3. **"Jenkins API error: 404"**

   - Check that the job path is correct
   - Verify the build number exists

4. **Connection timeouts**
   - Check your Jenkins server URL is accessible
   - Verify network connectivity and firewall settings

### Debug Mode

To enable debug logging, check the console output when running the server. All API calls are logged in development.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### Version 0.1.0

- Initial release with core Jenkins integration
- Support for build status, triggering, and log retrieval
- Parameter management for builds
- Secure environment-based configuration

````

## Tools and Usage

### 1. Get Build Status

Get the status of a Jenkins build:

```typescript
// Example usage
const result = await mcpClient.useTool("jenkins-server", "get_build_status", {
  jobPath: "view/xxx_debug",
  buildNumber: "lastBuild"  // Optional, defaults to lastBuild
});
````

Input Schema:

```json
{
  "jobPath": "string", // Path to Jenkins job
  "buildNumber": "string" // Optional, build number or "lastBuild"
}
```

### 2. Trigger Build

Trigger a new Jenkins build with parameters:

```typescript
// Example usage
const result = await mcpClient.useTool("jenkins-server", "trigger_build", {
  jobPath: "view/xxx_debug",
  parameters: {
    BRANCH: "main",
    BUILD_TYPE: "debug",
  },
});
```

Input Schema:

```json
{
  "jobPath": "string", // Path to Jenkins job
  "parameters": {
    // Build parameters as key-value pairs
  }
}
```

### 3. Get Build Log

Retrieve the console output of a Jenkins build:

```typescript
// Example usage
const result = await mcpClient.useTool("jenkins-server", "get_build_log", {
  jobPath: "view/xxx_debug",
  buildNumber: "lastBuild",
});
```

Input Schema:

```json
{
  "jobPath": "string", // Path to Jenkins job
  "buildNumber": "string" // Build number or "lastBuild"
}
```

## Development

For development with auto-rebuild:

```bash
npm run watch
```

### Debugging

Since MCP servers communicate over stdio, you can use the MCP Inspector for debugging:

```bash
npm run inspector
```

This will provide a URL to access debugging tools in your browser.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
