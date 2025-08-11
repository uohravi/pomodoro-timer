#!/bin/bash

# Personal GitHub Repository Setup Script for Pomodoro Timer
echo "🚀 Setting up Pomodoro Timer on your Personal GitHub account..."

# Get personal GitHub username
echo "Please enter your personal GitHub username:"
read -p "GitHub Username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required!"
    exit 1
fi

echo "✅ Using GitHub username: $GITHUB_USERNAME"

# Check if GitHub CLI is installed and authenticated
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found!"
    
    # Check if user is authenticated
    if gh auth status &> /dev/null; then
        echo "✅ GitHub CLI authenticated!"
        
        # Create the repository
        echo "Creating repository: pomodoro-timer..."
        gh repo create pomodoro-timer \
            --public \
            --description "🍅 A beautiful, feature-rich Pomodoro Timer web application made with ❤️" \
            --homepage "https://github.com/$GITHUB_USERNAME/pomodoro-timer" \
            --source . \
            --remote origin \
            --push
        
        if [ $? -eq 0 ]; then
            echo "✅ Repository created and pushed successfully!"
            echo "🌐 View your repository at: https://github.com/$GITHUB_USERNAME/pomodoro-timer"
            echo ""
            echo "🎉 Your Pomodoro Timer is now live on GitHub!"
            echo "📖 README: https://github.com/$GITHUB_USERNAME/pomodoro-timer#readme"
            echo "🐳 Docker: https://github.com/$GITHUB_USERNAME/pomodoro-timer#docker-deployment"
        else
            echo "❌ Failed to create repository with GitHub CLI"
            echo "Please create it manually on GitHub.com"
            manual_setup_instructions
        fi
    else
        echo "❌ GitHub CLI not authenticated!"
        echo "Please run: gh auth login"
        echo "Then run this script again."
        exit 1
    fi
else
    echo "📝 GitHub CLI not found. Please create the repository manually:"
    manual_setup_instructions
fi

function manual_setup_instructions() {
    echo ""
    echo "📋 Manual Setup Instructions:"
    echo "============================="
    echo ""
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: pomodoro-timer"
    echo "3. Description: 🍅 A beautiful, feature-rich Pomodoro Timer web application made with ❤️"
    echo "4. Make it Public"
    echo "5. DO NOT initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo ""
    echo "After creating the repository, run these commands:"
    echo "git remote add origin https://github.com/$GITHUB_USERNAME/pomodoro-timer.git"
    echo "git branch -M main"
    echo "git push -u origin main"
    echo ""
    echo "🌐 Your repository will be available at:"
    echo "https://github.com/$GITHUB_USERNAME/pomodoro-timer"
} 