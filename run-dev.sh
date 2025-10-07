#!/bin/bash

# Script to run the entire PulseMonitor application (backend, frontend, and service)

# Function to print a colored message
print_message() {
  echo -e "\n\e[1;34m$1\e[0m\n"
}

# Create a log directory if it doesn't exist
mkdir -p logs

# Trap Ctrl+C and kill all background processes
trap 'kill $(jobs -p); echo -e "\n\e[1;31mAll services have been stopped.\e[0m"; exit' INT

# Start the Backend Server
print_message "Starting Backend Server... (logs in logs/backend.log)"
(cd backend && npm install && npm run dev) > logs/backend.log 2>&1 &

# Start the Frontend Development Server
print_message "Starting Frontend Development Server... (logs in logs/frontend.log)"
(cd frontend && npm install && npm run dev) > logs/frontend.log 2>&1 &

# Start the Monitoring Service
print_message "Starting Monitoring Service... (logs in logs/service.log)"
(cd service && npm install && npm run dev) > logs/service.log 2>&1 &

echo -e "\n\e[1;32mAll services are starting up in the background.\e[0m"
echo -e "You can view the logs in the \e[1;33mlogs/\e[0m directory."
echo -e "Press \e[1;31mCtrl+C\e[0m to stop all services."

# Wait for all background processes to finish (which they won't, until Ctrl+C)
wait