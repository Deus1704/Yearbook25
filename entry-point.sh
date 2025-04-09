#!/bin/bash
set -e

# Start the backend server in the background
echo "Starting backend server..."
cd /app/backend
node server.js &

# Wait a moment to ensure backend starts properly
sleep 2

# Start the frontend server
echo "Starting frontend server..."
cd /app
npm start
