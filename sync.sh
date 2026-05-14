#!/bin/bash

# --- CONFIGURATION ---
# Edit these to match your Linux server details
REMOTE_USER="root"          
REMOTE_HOST="your_linux_ip" 
REMOTE_PATH="/var/www/tug_of_war"
# ---------------------

echo "🚀 Starting deployment to $REMOTE_HOST..."

# Check if rsync is installed
if ! command -v rsync &> /dev/null
then
    echo "Error: rsync is not installed. Please install it to use this script."
    exit 1
fi

# Create remote directory if it doesn't exist
echo "Checking remote directory..."
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_PATH"

# Sync files
# -a: archive mode (preserves permissions)
# -v: verbose
# -z: compress during transfer
# --delete: remove files on remote that aren't local
echo "Syncing files..."
rsync -avz --delete \
    --exclude '.git*' \
    --exclude '.github' \
    --exclude '.DS_Store' \
    --exclude 'deploy.sh' \
    --exclude 'start.sh' \
    ./ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH

echo "✅ Deployment complete!"
echo "------------------------------------------------"
echo "Next steps on your Linux box:"
echo "1. Ensure Nginx root is set to: $REMOTE_PATH"
echo "2. Check permissions: sudo chown -R www-data:www-data $REMOTE_PATH"
echo "3. Restart Nginx: sudo systemctl restart nginx"
echo "------------------------------------------------"
