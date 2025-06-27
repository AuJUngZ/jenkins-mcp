# Deployment Guide

This guide covers different deployment scenarios for the Jenkins MCP Server.

## Local Development

### Quick Start

1. **Clone and setup:**

```bash
git clone <your-repo-url>
cd jenkins-server-mcp
npm install
./setup.sh  # Interactive setup
```

2. **Configure environment:**

```bash
# Edit .env file with your credentials
nano .env
```

3. **Build and run:**

```bash
npm run build
npm run dev
```

## Production Deployment

### Prerequisites

- Node.js 18+
- npm or yarn
- Access to Jenkins server
- Valid Jenkins API credentials

### Installation Steps

1. **Server setup:**

```bash
# Clone repository
git clone <your-repo-url>
cd jenkins-server-mcp

# Install dependencies
npm ci --only=production

# Build project
npm run build
```

2. **Environment configuration:**

```bash
# Copy environment template
cp .env.example .env

# Edit with production credentials
nano .env
```

3. **Security hardening:**

```bash
# Set proper file permissions
chmod 600 .env
chmod 755 build/index.js
chown -R app:app .  # If running under app user
```

### Systemd Service (Linux)

Create a systemd service for production deployment:

```ini
# /etc/systemd/system/jenkins-mcp.service
[Unit]
Description=Jenkins MCP Server
After=network.target

[Service]
Type=simple
User=app
WorkingDirectory=/opt/jenkins-mcp
ExecStart=/usr/bin/node build/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/jenkins-mcp/.env

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/jenkins-mcp

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable jenkins-mcp
sudo systemctl start jenkins-mcp
sudo systemctl status jenkins-mcp
```

### Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build project
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port (if needed for health checks)
EXPOSE 3000

# Start server
CMD ["node", "build/index.js"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  jenkins-mcp:
    build: .
    environment:
      - JENKINS_URL=${JENKINS_URL}
      - JENKINS_USER=${JENKINS_USER}
      - JENKINS_TOKEN=${JENKINS_TOKEN}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
```

Build and run:

```bash
docker-compose up -d
```

### Kubernetes Deployment

#### Secret Configuration

```yaml
# jenkins-mcp-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: jenkins-mcp-secret
type: Opaque
stringData:
  JENKINS_URL: "https://your-jenkins-server.com"
  JENKINS_USER: "your-username"
  JENKINS_TOKEN: "your-api-token"
```

#### Deployment

```yaml
# jenkins-mcp-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jenkins-mcp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jenkins-mcp
  template:
    metadata:
      labels:
        app: jenkins-mcp
    spec:
      containers:
        - name: jenkins-mcp
          image: your-registry/jenkins-mcp:latest
          envFrom:
            - secretRef:
                name: jenkins-mcp-secret
          resources:
            limits:
              memory: "128Mi"
              cpu: "100m"
            requests:
              memory: "64Mi"
              cpu: "50m"
          securityContext:
            allowPrivilegeEscalation: false
            runAsNonRoot: true
            runAsUser: 1001
            readOnlyRootFilesystem: true
```

Apply:

```bash
kubectl apply -f jenkins-mcp-secret.yaml
kubectl apply -f jenkins-mcp-deployment.yaml
```

## MCP Client Configuration

### Claude Desktop

#### Production Configuration

```json
{
  "mcpServers": {
    "jenkins-server": {
      "command": "node",
      "args": ["/opt/jenkins-mcp/build/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### Development Configuration

```json
{
  "mcpServers": {
    "jenkins-server": {
      "command": "node",
      "args": ["/path/to/dev/jenkins-mcp/build/index.js"],
      "env": {
        "NODE_ENV": "development",
        "JENKINS_URL": "https://dev-jenkins.company.com",
        "JENKINS_USER": "dev-user",
        "JENKINS_TOKEN": "dev-token"
      }
    }
  }
}
```

## Environment Configuration

### Development

```env
NODE_ENV=development
JENKINS_URL=https://dev-jenkins.company.com
JENKINS_USER=dev-user
JENKINS_TOKEN=dev-token-123
SERVER_NAME=jenkins-server-dev
SERVER_VERSION=0.1.0
```

### Production

```env
NODE_ENV=production
JENKINS_URL=https://jenkins.company.com
JENKINS_USER=prod-mcp-user
JENKINS_TOKEN=prod-token-456
SERVER_NAME=jenkins-server
SERVER_VERSION=0.1.0
```

## Monitoring and Logging

### Basic Monitoring

Monitor the service with:

```bash
# Check service status
systemctl status jenkins-mcp

# View logs
journalctl -u jenkins-mcp -f

# Check process
ps aux | grep "jenkins-mcp"
```

### Advanced Monitoring

For production environments, consider:

- **Process monitoring:** Supervisor, PM2, or systemd
- **Log aggregation:** ELK Stack, Fluentd, or similar
- **Metrics collection:** Prometheus + Grafana
- **Health checks:** Custom HTTP endpoint or file-based checks

### Log Configuration

Create log directory:

```bash
mkdir -p /var/log/jenkins-mcp
chown app:app /var/log/jenkins-mcp
```

Rotate logs:

```bash
# /etc/logrotate.d/jenkins-mcp
/var/log/jenkins-mcp/*.log {
    daily
    missingok
    rotate 30
    compress
    create 644 app app
}
```

## Troubleshooting

### Common Issues

1. **Permission denied:**

```bash
# Fix file permissions
chmod 755 build/index.js
chmod 600 .env
```

2. **Module not found:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

3. **Connection issues:**

```bash
# Test Jenkins connectivity
curl -u $JENKINS_USER:$JENKINS_TOKEN $JENKINS_URL/api/json
```

### Health Checks

Create a simple health check script:

```bash
#!/bin/bash
# health-check.sh

if pgrep -f "jenkins-mcp" > /dev/null; then
    echo "✅ Jenkins MCP Server is running"
    exit 0
else
    echo "❌ Jenkins MCP Server is not running"
    exit 1
fi
```

## Backup and Recovery

### Backup

Important files to backup:

- `.env` (encrypted/secure storage)
- Configuration files
- Any custom modifications

### Recovery

1. Restore files from backup
2. Reinstall dependencies: `npm ci`
3. Rebuild project: `npm run build`
4. Start service: `systemctl start jenkins-mcp`

## Security Considerations

- Use dedicated service accounts
- Implement proper file permissions
- Regular security updates
- Monitor access logs
- Rotate credentials regularly

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

## Performance Tuning

### Node.js Optimization

```bash
# Set Node.js options for production
export NODE_OPTIONS="--max-old-space-size=512"
```

### Resource Limits

Monitor and adjust:

- Memory usage
- CPU utilization
- Network connections
- File descriptors

## Scaling

For high-load scenarios:

- Deploy multiple instances
- Use load balancing
- Implement connection pooling
- Consider caching strategies

## Support

For deployment issues:

1. Check logs first
2. Verify configuration
3. Test connectivity
4. Review security settings
5. Open issue with details
