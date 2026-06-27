#!/bin/bash

# TrustTicket Quick Start Script
# This script starts both backend and frontend servers

echo "🚀 Starting TrustTicket Application..."
echo ""
echo "This script will open two terminals:"
echo "  1. Backend (Port 3000)"
echo "  2. Frontend (Port 5173)"
echo ""

# Check if we're in the project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the TrustTicket-Project root directory"
    exit 1
fi

echo "Starting Backend..."
cd backend
npm start &
BACKEND_PID=$!

sleep 3

echo ""
echo "Starting Frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers starting..."
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

wait
