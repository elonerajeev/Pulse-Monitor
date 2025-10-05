#!/bin/bash

# This script will install dependencies and run both the backend and frontend servers.

# Exit immediately if a command exits with a non-zero status.
set -e

cleanup() {
    echo "--- Stopping servers ---"
    # Kill all background jobs of this script
    kill 0
}

# Run the cleanup function on exit
trap cleanup EXIT

echo "--- Setting up backend ---"
cd /home/user/server/backend
npm install
echo "--- Starting backend server in the background ---"
npm start &

# Wait a moment for the backend to start
sleep 5

echo "--- Setting up frontend ---"
cd /home/user/server/frontend
npm install
echo "--- Starting frontend dev server ---"
npm run dev