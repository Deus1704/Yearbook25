#!/bin/bash
set -e

# Start the backend server in the background
echo "Starting backend server..."
cd /app/backend
node server.js &

# Wait a moment to ensure backend starts properly
sleep 2

# Serve the built React app
echo "Serving frontend..."
cd /app
serve -s build -l 3000
