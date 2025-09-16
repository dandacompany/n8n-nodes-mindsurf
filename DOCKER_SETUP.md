# Docker Setup for n8n-nodes-mindsurf

This guide explains how to use n8n-nodes-mindsurf in Docker environments.

## Installation Options

### Option 1: Install via n8n UI (Recommended)

Use this Dockerfile to prepare the environment, then install the node through n8n's Community Nodes interface:

```dockerfile
FROM docker.n8n.io/n8nio/n8n:latest
USER root

# Install Chromium and required dependencies for browser automation
RUN apk update && apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    ttf-liberation \
    fontconfig \
    dbus-x11 \
    mesa-gl \
    mesa-dri-gallium \
    udev \
    xvfb \
    libxscrnsaver \
    at-spi2-core

# Create dbus directory
RUN mkdir -p /run/dbus && \
    dbus-daemon --system --fork

# Set environment variables for browser
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV DISPLAY=:99

# Create a startup script to handle dbus and xvfb
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'rm -f /run/dbus/pid 2>/dev/null' >> /start.sh && \
    echo 'dbus-daemon --system --fork 2>/dev/null || true' >> /start.sh && \
    echo 'Xvfb :99 -screen 0 1920x1080x24 -nolisten tcp &' >> /start.sh && \
    echo 'n8n' >> /start.sh && \
    chmod +x /start.sh

USER node
ENTRYPOINT ["/start.sh"]
```

After building and running this container:
1. Access n8n at http://localhost:5678
2. Go to Settings → Community Nodes
3. Install `n8n-nodes-mindsurf`
4. The node will automatically use the pre-configured browser environment

### Option 2: Pre-install in Docker Image

If you prefer to have the node pre-installed, add this line before `USER node`:

```dockerfile
RUN npm install -g n8n-nodes-mindsurf
```

## Docker Configuration

### Using Alpine Linux (Recommended for smaller images)

Create a `Dockerfile`:

```dockerfile
FROM n8nio/n8n:latest-alpine

USER root

# Install Chromium and dependencies for Alpine
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver \
    ttf-liberation \
    fontconfig \
    freetype \
    harfbuzz \
    ca-certificates \
    nodejs \
    npm

# Install the mindsurf node
RUN npm install -g n8n-nodes-mindsurf

# Set environment variables to use system Chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
    CHROME_BIN=/usr/bin/chromium \
    CHROME_PATH=/usr/bin/chromium

USER node
```

### Using Debian/Ubuntu (Better compatibility)

Create a `Dockerfile`:

```dockerfile
FROM n8nio/n8n:latest

USER root

# Install Chrome and dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils

# Install Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# Install the mindsurf node
RUN npm install -g n8n-nodes-mindsurf

# Set environment variables
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

USER node
```

## Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  n8n:
    build: .
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
      - PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
    volumes:
      - n8n_data:/home/node/.n8n
      - ./files:/files
    networks:
      - n8n_network

volumes:
  n8n_data:

networks:
  n8n_network:
```

## Environment Variables

The following environment variables can be used to configure browser behavior:

- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` - Skip downloading Playwright browsers (required when using system browsers)
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` - Path to system Chromium/Chrome executable
- `PLAYWRIGHT_FIREFOX_EXECUTABLE_PATH` - Path to system Firefox executable

## Building and Running

1. Build the Docker image:
```bash
docker build -t n8n-mindsurf .
```

2. Run with docker-compose:
```bash
docker-compose up -d
```

3. Access n8n at http://localhost:5678

## Troubleshooting

### Browser Launch Errors

If you encounter browser launch errors like:
```
browserType.launch: Failed to launch chromium because executable doesn't exist
```

**Solution**: Make sure the environment variables are set correctly and the browser is installed in the container.

### Alpine Linux Issues

Alpine Linux uses musl libc instead of glibc, which can cause compatibility issues with Playwright's bundled browsers. Always use system-installed Chromium on Alpine:

```dockerfile
RUN apk add --no-cache chromium chromium-chromedriver
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
```

### Permission Issues

If you encounter permission issues, ensure the node user has access to the browser executable:

```dockerfile
RUN chmod +rx /usr/bin/chromium
```

### Memory Issues

Browser automation can be memory-intensive. Increase Docker's memory limit if needed:

```yaml
services:
  n8n:
    deploy:
      resources:
        limits:
          memory: 2G
```

## Testing Browser Setup

You can test if the browser is correctly set up by creating a simple workflow:

1. Add a Mindsurf node
2. Select "Navigate to URL" operation
3. Enter any URL (e.g., https://www.google.com)
4. Run the node

If the node executes successfully, your Docker setup is working correctly.

## Performance Tips

1. **Use headless mode**: Always use headless mode in Docker for better performance
2. **Limit concurrent sessions**: Don't run too many browser sessions simultaneously
3. **Clean up sessions**: Always close browser sessions when done
4. **Use Alpine for smaller images**: Alpine-based images are much smaller (~400MB vs ~1.5GB)

## Security Considerations

1. **Run as non-root user**: Always switch to a non-root user after installing dependencies
2. **Limit network access**: Use Docker networks to isolate containers
3. **Use secrets management**: Don't hardcode credentials in Dockerfiles
4. **Regular updates**: Keep browsers and dependencies updated for security patches