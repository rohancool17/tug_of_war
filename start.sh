#!/bin/bash

# Configuration
PORT=3250
HOST=0.0.0.0
APP_MODULE="app.main:app"

# Export PYTHONPATH to include the current directory
export PYTHONPATH=$PYTHONPATH:.

# Check if .env exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found. Make sure to set DIRECTUS_TOKEN and DIRECTUS_URL."
fi

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install requirements
echo "Installing/Updating requirements..."
pip install --upgrade pip
pip install -r requirements.txt

# Start the application
echo "Starting Tug of War app on port $PORT..."
uvicorn "$APP_MODULE" --host "$HOST" --port "$PORT" --reload
