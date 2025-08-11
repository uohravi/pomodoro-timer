# 🐳 Pomodoro Timer - Docker Deployment

This document explains how to run the Pomodoro Timer application in a Docker container.

## 📋 Prerequisites

- Docker installed and running
- Docker Compose (usually comes with Docker Desktop)

## 🚀 Quick Start

### Option 1: Using the convenience script (Recommended)

```bash
./docker-start.sh
```

This script will:
- Check if Docker is running
- Build the Docker image
- Stop any existing containers
- Start the application
- Display access URLs

### Option 2: Manual Docker commands

```bash
# Build the image
docker build -t pomodoro-timer .

# Run the container
docker-compose up -d
```

## 🌐 Accessing the Application

Once the container is running, you can access:

- **Main Application**: http://localhost:8080
- **Test Suite**: http://localhost:8080/tests.html

## 📦 Container Details

### Image Specifications
- **Base Image**: Node.js 18 Alpine (lightweight)
- **Web Server**: http-server (simple, fast)
- **Port**: 8080
- **CORS**: Enabled for cross-origin requests

### Container Features
- **Health Checks**: Automatic health monitoring
- **Auto-restart**: Container restarts automatically unless manually stopped
- **CORS Support**: Allows cross-origin requests
- **Production Ready**: Optimized for production deployment

## 🛠️ Management Commands

### View Container Status
```bash
docker ps
```

### View Logs
```bash
docker logs pomodoro-timer
```

### Stop the Application
```bash
docker-compose down
```

### Restart the Application
```bash
docker-compose restart
```

### Update and Rebuild
```bash
# Stop and remove existing container
docker-compose down

# Rebuild with latest changes
docker build -t pomodoro-timer .

# Start again
docker-compose up -d
```

## 🔧 Development Mode

For development with live reload, uncomment the volume mounts in `docker-compose.yml`:

```yaml
volumes:
  - ./:/app
  - /app/node_modules
```

Then rebuild and restart:
```bash
docker-compose down
docker-compose up -d --build
```

## 📊 Monitoring

### Health Check
The container includes a health check that verifies the web server is responding:
```bash
docker inspect pomodoro-timer | grep Health -A 10
```

### Resource Usage
```bash
docker stats pomodoro-timer
```

## 🚢 Production Deployment

### Environment Variables
The container runs with `NODE_ENV=production` for optimal performance.

### Scaling
For production deployment, you can scale the service:
```bash
docker-compose up -d --scale pomodoro-app=3
```

### Reverse Proxy
For production, consider using a reverse proxy (nginx, traefik) in front of the container.

## 🔍 Troubleshooting

### Container Won't Start
```bash
# Check Docker logs
docker logs pomodoro-timer

# Check if port 8080 is available
lsof -i :8080
```

### Application Not Accessible
```bash
# Check container status
docker ps

# Check container logs
docker logs pomodoro-timer

# Test connectivity
curl http://localhost:8080
```

### Permission Issues
```bash
# Make sure the start script is executable
chmod +x docker-start.sh
```

## 📁 File Structure

```
pomodo/
├── Dockerfile              # Container definition
├── docker-compose.yml      # Container orchestration
├── .dockerignore          # Files to exclude from build
├── docker-start.sh        # Convenience startup script
├── DOCKER_README.md       # This file
├── index.html             # Main application
├── styles.css             # Application styles
├── script.js              # Main application logic
├── database.js            # Database operations
├── unit-tests.js          # Unit tests
├── tests.html             # Test suite interface
└── README.md              # Main application documentation
```

## 🎯 Benefits of Docker Deployment

1. **Consistency**: Same environment across development and production
2. **Isolation**: Application runs in its own container
3. **Portability**: Easy to deploy anywhere Docker is available
4. **Scalability**: Easy to scale horizontally
5. **Version Control**: Container images can be versioned
6. **Resource Efficiency**: Lightweight Alpine-based image
7. **Security**: Isolated from host system

## 🔄 Continuous Integration

You can integrate this Docker setup into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Build and test Docker image
  run: |
    docker build -t pomodoro-timer .
    docker run --rm pomodoro-timer npm test
```

## 📞 Support

If you encounter issues with the Docker deployment:

1. Check the container logs: `docker logs pomodoro-timer`
2. Verify Docker is running: `docker info`
3. Check port availability: `lsof -i :8080`
4. Review this documentation for common solutions 