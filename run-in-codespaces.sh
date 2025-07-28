#!/bin/bash

# ReadsGood GitHub Codespaces Setup Script

echo "🚀 Setting up ReadsGood application for GitHub Codespaces..."

# Define ports
FRONTEND_PORT=5173
BACKEND_PORT=3000

# Check if running in Codespaces
if [ -z "$CODESPACE_NAME" ]; then
    echo "⚠️  Warning: CODESPACE_NAME not found. Are you running this in GitHub Codespaces?"
    echo "   The script will continue, but URLs may not work correctly outside Codespaces."
    echo ""
    CODESPACE_HOST="localhost"
    FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
    BACKEND_URL="http://localhost:${BACKEND_PORT}"
else
    # Determine Codespaces public host
    CODESPACE_HOST="${CODESPACE_NAME}.app.github.dev"
    # Construct dynamic URLs
    FRONTEND_URL="https://${CODESPACE_NAME}-${FRONTEND_PORT}.app.github.dev"
    BACKEND_URL="https://${CODESPACE_NAME}-${BACKEND_PORT}.app.github.dev"
fi

echo "📍 Frontend URL: ${FRONTEND_URL}"
echo "📍 Backend URL:  ${BACKEND_URL}"
echo ""

# Step 1: Prompt for Goodreads API credentials
echo "🔑 Goodreads API Setup"
echo "────────────────────────"
echo "To use the Goodreads integration, you need API credentials."
echo "Get them from: https://www.goodreads.com/api/keys"
echo ""

# Prompt for API credentials (no defaults exposed)
echo "Enter your Goodreads API credentials (required for book search):"
echo ""

read -p "Goodreads API Key: " GOODREADS_API_KEY
read -p "Goodreads API Secret: " GOODREADS_API_SECRET

# Validate that credentials were provided
if [ -z "$GOODREADS_API_KEY" ] || [ -z "$GOODREADS_API_SECRET" ]; then
    echo ""
    echo "⚠️  No API credentials provided. Using placeholder values."
    echo "   The app will start but Goodreads integration won't work."
    echo "   Get real credentials from: https://www.goodreads.com/api/keys"
    echo ""
    GOODREADS_API_KEY="your_goodreads_api_key_here"
    GOODREADS_API_SECRET="your_goodreads_api_secret_here"
fi

echo ""
echo "✅ API credentials configured"
echo ""

# Step 2: Validate project structure
echo "📁 Validating project structure..."
if [ ! -d "readsgood-backend" ] || [ ! -d "readsgood-frontend" ]; then
    echo "❌ Error: Missing project directories. Make sure you're in the root of the project."
    echo "   Expected directories: readsgood-backend/ and readsgood-frontend/"
    exit 1
fi

if [ ! -f "readsgood-backend/package.json" ] || [ ! -f "readsgood-frontend/package.json" ]; then
    echo "❌ Error: Missing package.json files in project directories."
    exit 1
fi

echo "✅ Project structure validated"
echo ""

# Step 3: Create environment files
echo "📝 Creating environment files..."

cat > readsgood-frontend/.env <<EOF
# Frontend Environment Variables for GitHub Codespaces

# Backend API URL
VITE_API_BASE_URL=${BACKEND_URL}

# Application Configuration
PORT=${FRONTEND_PORT}
NODE_ENV=development

# Database Configuration (not used by frontend, but included for completeness)
DATABASE_URL="file:./dev.db"

# Goodreads API Configuration (for reference)
GOODREADS_API_KEY=${GOODREADS_API_KEY}
GOODREADS_API_SECRET=${GOODREADS_API_SECRET}
EOF

cat > readsgood-backend/.env <<EOF
# Backend Environment Variables for GitHub Codespaces

# Database Configuration (SQLite for Codespaces)
DATABASE_URL="file:./dev.db"

# Goodreads API Configuration
GOODREADS_API_KEY=${GOODREADS_API_KEY}
GOODREADS_API_SECRET=${GOODREADS_API_SECRET}

# Application Configuration
PORT=${BACKEND_PORT}
NODE_ENV=development

# Backend URL (for OAuth callbacks)
BACKEND_URL=${BACKEND_URL}

# Frontend URL (for CORS and OAuth redirects)
FRONTEND_APP_URL=${FRONTEND_URL}

# Basic Auth Configuration (for API endpoints)
BASIC_AUTH_USERNAME=testuser
BASIC_AUTH_PASSWORD=testpass123

# JWT Configuration (if needed)
JWT_SECRET=your-super-secret-jwt-key-for-development-only

# CORS Configuration
CORS_ORIGIN=${FRONTEND_URL}
EOF

echo "✅ .env files created"

echo "✅ Prisma schema updated for SQLite"

# Step 5: Clean up old migrations and prepare for SQLite
echo "🗑️ Cleaning up migrations..."
rm -rf readsgood-backend/prisma/migrations
rm -f readsgood-backend/prisma/migration_lock.toml

# Step 6: Install dependencies and setup database
echo "📦 Installing backend dependencies..."
cd readsgood-backend
npm install

echo "🗄️ Setting up SQLite database..."
npx prisma generate
npx prisma db push --accept-data-loss
echo "✅ Database setup completed"

cd ..

echo "📦 Installing frontend dependencies..."
cd readsgood-frontend
npm install
cd ..

# Step 7: Start backend
echo "🚀 Starting NestJS backend..."
cd readsgood-backend
PORT=$BACKEND_PORT HOST=0.0.0.0 npm run start:dev &
BACK_PID=$!
cd ..

# Step 8: Start frontend
echo "🌐 Starting Vue 3 frontend..."
cd readsgood-frontend
npm run dev -- --port $FRONTEND_PORT --host 0.0.0.0 &
FRONT_PID=$!
cd ..

# Wait for servers to start
echo "⏳ Waiting for servers to start..."
sleep 10

# Step 9: Show public URLs
echo ""
echo "✅ Your apps are running in GitHub Codespaces!"
echo "🌐 Frontend (Vue 3):   ${FRONTEND_URL}"
echo "🌐 Backend (NestJS):   ${BACKEND_URL}"
echo ""
echo "📋 API Endpoints:"
echo "   ${BACKEND_URL}/users (Basic Auth: testuser/testpass123)"
echo "   ${BACKEND_URL}/goodreads/search?q=book"
echo ""
echo "🔧 Development commands:"
echo "   Frontend logs: cd readsgood-frontend && npm run dev"
echo "   Backend logs:  cd readsgood-backend && npm run start:dev"
echo "   Database:      cd readsgood-backend && npx prisma studio"
echo ""
echo "🔑 Environment variables configured:"
echo "   DATABASE_URL: file:./dev.db"
echo "   GOODREADS_API_KEY: [configured]"
echo "   BASIC_AUTH: testuser/testpass123"
echo ""
echo "🛑 Press Ctrl+C to stop both servers."

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACK_PID $FRONT_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait $BACK_PID $FRONT_PID
