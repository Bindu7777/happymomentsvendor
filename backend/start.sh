#!/bin/bash

# Event Vendor Email API Startup Script

echo "🚀 Starting Event Vendor Email API..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp env.example .env
    echo "📝 Please edit .env file with your SMTP credentials before starting the server."
    echo "   nano .env"
    echo ""
    echo "Required settings:"
    echo "   SMTP_PASSWORD=your_actual_email_password_here"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🌐 Starting server..."
if [ "$1" = "dev" ]; then
    echo "🔧 Development mode (with auto-reload)"
    npm run dev
else
    echo "🚀 Production mode"
    npm start
fi
