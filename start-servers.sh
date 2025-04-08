#!/bin/bash

# Function to handle errors
handle_error() {
  echo "Error: $1"
  exit 1
}

# Function to handle script termination
cleanup() {
  echo "Stopping servers..."
  if [ ! -z "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
  fi
  if [ ! -z "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null || true
  fi
  exit 0
}

# Set up trap to catch termination signals
trap cleanup SIGINT SIGTERM EXIT

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  handle_error "Node.js is not installed. Please install Node.js and npm first."
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  handle_error "npm is not installed. Please install npm first."
fi

# Start the backend server
echo "Starting backend server..."
cd backend || handle_error "Cannot find backend directory"

echo "Installing backend dependencies..."
npm install || handle_error "Failed to install backend dependencies"

echo "Starting backend server on port 5000..."
npm start &
BACKEND_PID=$!

# Check if backend started successfully
sleep 3
if ! ps -p $BACKEND_PID > /dev/null; then
  handle_error "Backend server failed to start"
fi

# Wait for backend to initialize
echo "Waiting for backend to initialize..."
sleep 2

# Start the frontend server
echo "Starting frontend server..."
cd ../maprc || handle_error "Cannot find maprc directory"

echo "Installing frontend dependencies..."
npm install || handle_error "Failed to install frontend dependencies"

echo "Starting frontend server on port 3000..."
npm start &
FRONTEND_PID=$!

# Check if frontend started successfully
sleep 3
if ! ps -p $FRONTEND_PID > /dev/null; then
  handle_error "Frontend server failed to start"
fi

# Keep script running
echo "\n✅ Both servers are running successfully!"
echo "   - Backend server running on http://localhost:5000"
echo "   - Frontend server running on http://localhost:3000"
echo "\nPress Ctrl+C to stop both servers.\n"

wait $BACKEND_PID $FRONTEND_PID
