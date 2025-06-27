# Security Guide

## Overview

This document outlines security best practices and considerations when using the Jenkins MCP Server.

## Environment Security

### 1. Environment Variables

**✅ DO:**

- Store credentials in environment variables or `.env` files
- Use the provided `.env.example` template
- Set appropriate file permissions on `.env` files (`chmod 600 .env`)

**❌ DON'T:**

- Commit `.env` files to version control
- Store credentials in source code
- Share environment files containing real credentials

### 2. Jenkins API Token Security

**✅ DO:**

- Use Jenkins API tokens instead of passwords
- Create tokens with minimal required permissions
- Rotate tokens regularly
- Use unique tokens for different applications

**❌ DON'T:**

- Use your Jenkins password for API authentication
- Share API tokens between applications
- Store tokens in plain text files outside of environment configuration

### 3. File Permissions

Set appropriate permissions on sensitive files:

```bash
# Make .env readable only by owner
chmod 600 .env

# Make setup script executable
chmod +x setup.sh

# Ensure build directory has proper permissions
chmod -R 755 build/
```

## Network Security

### 1. HTTPS Configuration

**Always use HTTPS** for Jenkins server connections:

```env
JENKINS_URL=https://your-jenkins-server.com  # ✅ Secure
JENKINS_URL=http://your-jenkins-server.com   # ❌ Insecure
```

### 2. Network Access

- Ensure your Jenkins server is accessible from where the MCP server runs
- Consider firewall rules and network segmentation
- Use VPN if connecting to internal Jenkins servers

## Jenkins Server Configuration

### 1. User Permissions

Create a dedicated Jenkins user for the MCP server with minimal permissions:

**Required Permissions:**

- Read access to jobs you want to monitor
- Build permission for jobs you want to trigger
- Workspace access for log retrieval

**Permission Setup:**

1. Create a new user in Jenkins: `Manage Jenkins` → `Manage Users` → `Create User`
2. Assign minimal required permissions
3. Generate API token for this user

### 2. Job-Level Security

- Limit job access to only necessary projects
- Use Jenkins' matrix-based security if available
- Regularly audit user permissions

## MCP Client Security

### 1. Configuration Files

MCP client configuration files may contain sensitive information:

**Claude Desktop:**

- `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
- `%APPDATA%/Claude/claude_desktop_config.json` (Windows)

Set appropriate file permissions:

```bash
# macOS
chmod 600 "~/Library/Application Support/Claude/claude_desktop_config.json"

# Windows (PowerShell)
icacls "$env:APPDATA\Claude\claude_desktop_config.json" /inheritance:d /grant:r "$env:USERNAME:F"
```

### 2. Alternative Configuration

Instead of storing credentials in MCP client config, you can:

1. **Use environment variables** (recommended):

```json
{
  "mcpServers": {
    "jenkins-server": {
      "command": "node",
      "args": ["/path/to/build/index.js"]
    }
  }
}
```

2. **Create a wrapper script** that sets environment variables:

```bash
#!/bin/bash
export JENKINS_URL="https://your-jenkins-server.com"
export JENKINS_USER="your-username"
export JENKINS_TOKEN="your-api-token"
node /path/to/build/index.js
```

## Monitoring and Auditing

### 1. Log Monitoring

Monitor logs for:

- Authentication failures
- Unusual API usage patterns
- Unexpected error rates

### 2. Jenkins Audit

Regularly check Jenkins audit logs for:

- API token usage
- Build triggers from the MCP server
- Permission changes

## Incident Response

### 1. Compromised Credentials

If credentials are compromised:

1. **Immediately revoke** the Jenkins API token
2. **Generate new** API token with fresh credentials
3. **Update** environment configuration
4. **Review** Jenkins audit logs for unauthorized activity
5. **Check** any triggered builds for malicious changes

### 2. Unauthorized Access

If unauthorized access is detected:

1. **Disable** the Jenkins user account
2. **Review** all recent activity
3. **Check** for any configuration changes
4. **Update** security measures

## Best Practices Summary

1. **Never commit credentials** to version control
2. **Use HTTPS** for all Jenkins communications
3. **Apply principle of least privilege** for Jenkins users
4. **Regularly rotate** API tokens
5. **Monitor** usage and audit logs
6. **Secure** configuration files with proper permissions
7. **Use environment variables** for credential management
8. **Keep software updated** to latest versions

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Jenkins API token created with minimal permissions
- [ ] HTTPS used for Jenkins URL
- [ ] File permissions set correctly (`chmod 600 .env`)
- [ ] Regular token rotation schedule established
- [ ] Monitoring and logging configured
- [ ] Incident response plan documented
- [ ] Team trained on security practices

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** open a public issue
2. **Email** security concerns to [your-security-email]
3. **Include** detailed description and reproduction steps
4. **Allow** reasonable time for response before disclosure

## Compliance

This project follows security best practices for:

- API credential management
- Network communications
- Access control
- Audit logging

Ensure your deployment meets your organization's security and compliance requirements.
