#!/bin/bash

# Store the root directory path
ROOT_DIR=$(pwd)

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

# Function to check if a port is in use
check_port() {
  local port=$1
  if command -v lsof &> /dev/null; then
    lsof -i:$port -P -n >/dev/null 2>&1
    return $?
  else
    netstat -tuln | grep -q ":$port "
    return $?
  fi
}

# Function to check if a port is in use and kill the process if needed
kill_process_on_port() {
  local port=$1
  local pid
  local max_attempts=3
  local attempt=1

  while check_port $port && [ $attempt -le $max_attempts ]; do
    echo "Attempt $attempt: Port $port is in use. Trying to free it..."

    # Check if lsof is available
    if command -v lsof &> /dev/null; then
      pid=$(lsof -t -i:$port)
    else
      # Alternative method if lsof is not available
      pid=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1)
    fi

    if [ ! -z "$pid" ]; then
      echo "Port $port is in use by process $pid. Killing it..."
      kill -9 $pid 2>/dev/null || true
      sleep 2
    else
      echo "Could not identify process using port $port"
      sleep 2
    fi

    attempt=$((attempt+1))
  done

  if check_port $port; then
    echo "Warning: Could not free port $port after $max_attempts attempts"
  else
    echo "Port $port is now free"
  fi
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

# Free up the ports before starting servers
echo "Checking if ports are in use..."
kill_process_on_port 5000
kill_process_on_port 3000

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

# Navigate back to the root directory
cd "$ROOT_DIR" || handle_error "Cannot navigate back to root directory"

# Start the frontend server
echo "Starting frontend server..."

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
echo -e "\n✅ Both servers are running successfully!"
echo "   - Backend server running on http://localhost:5000"
echo "   - Frontend server running on http://localhost:3000"
echo -e "\nPress Ctrl+C to stop both servers.\n"

wait $BACKEND_PID $FRONTEND_PID
