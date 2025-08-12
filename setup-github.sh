#!/bin/bash

# GitHub Repository Setup Script for Pomodoro Timer
echo "🚀 Setting up GitHub repository for Pomodoro Timer..."

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found!"
    echo "Creating repository with GitHub CLI..."
    
    # Create the repository
    gh repo create pomodoro-timer \
        --public \
        --description "🍅 A beautiful, feature-rich Pomodoro Timer web application made with ❤️" \
        --homepage "https://github.com/$(gh api user --jq .login)/pomodoro-timer" \
        --source . \
        --remote origin \
        --push
    
    if [ $? -eq 0 ]; then
        echo "✅ Repository created and pushed successfully!"
        echo "🌐 View your repository at: https://github.com/$(gh api user --jq .login)/pomodoro-timer"
    else
        echo "❌ Failed to create repository with GitHub CLI"
        echo "Please create it manually on GitHub.com"
    fi
else
    echo "📝 GitHub CLI not found. Please create the repository manually:"
    echo ""
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: pomodoro-timer"
    echo "3. Description: 🍅 A beautiful, feature-rich Pomodoro Timer web application made with ❤️"
    echo "4. Make it Public"
    echo "5. DO NOT initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo ""
    echo "After creating the repository, run these commands:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/pomodoro-timer.git"
    echo "git branch -M main"
    echo "git push -u origin main"
    echo ""
    echo "Replace YOUR_USERNAME with your actual GitHub username"
fi 