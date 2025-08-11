#!/bin/bash

# Pomodoro Timer Docker Setup Script
echo "🚀 Starting Pomodoro Timer in Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t pomodoro-timer .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

# Stop any existing container
echo "🛑 Stopping existing container..."
docker stop pomodoro-timer 2>/dev/null || true
docker rm pomodoro-timer 2>/dev/null || true

# Start the container
echo "▶️  Starting container..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ Pomodoro Timer is now running!"
    echo "🌐 Access the application at: http://localhost:8080"
    echo "🧪 Access the test suite at: http://localhost:8080/tests.html"
    echo ""
    echo "📋 Useful commands:"
    echo "  View logs: docker logs pomodoro-timer"
    echo "  Stop: docker-compose down"
    echo "  Restart: docker-compose restart"
else
    echo "❌ Failed to start container!"
    exit 1
fi 