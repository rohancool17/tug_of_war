#!/bin/bash

# Tug of War Project Deployment Script
# This script handles environment setup and PM2 deployment on the Linux box

# Exit on error
set -e

echo "🚀 Starting Tug of War Deployment..."

# 1. Directory Check
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

# 2. Check for .env file
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with DIRECTUS_URL and DIRECTUS_TOKEN before deploying."
    exit 1
fi

# 3. Virtual Environment Setup
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

echo "🐍 Activating virtual environment..."
source .venv/bin/activate

# 4. Install Dependencies
echo "📥 Installing/Updating dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# 5. Ensure log directory exists
mkdir -p logs

# 6. PM2 Deployment
if command -v pm2 >/dev/null 2>&1; then
    echo "🔄 Deploying with PM2..."
    # Reload if exists, start if not
    pm2 startOrReload ecosystem.config.js
    
    echo "✅ Tug of War project deployed successfully via PM2!"
    echo "Use 'pm2 status' to check the application state."
else
    echo "⚠️ PM2 not found. Skipping PM2 deployment."
    echo "Please install PM2 (npm install -g pm2) to manage the process."
fi
