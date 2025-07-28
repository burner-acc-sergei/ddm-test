#!/bin/bash

# ReadsGood DevContainer Setup Script
echo "🚀 Setting up ReadsGood development environment..."

# Set execute permission on the main setup script
chmod +x ./run-in-codespaces.sh

# Show helpful information
echo ""
echo "✅ DevContainer setup complete!"
echo ""
echo "📋 Quick Start:"
echo "   1. Run: ./run-in-codespaces.sh"
echo "   2. Enter your Goodreads API credentials when prompted"
echo "   3. Wait for both servers to start"
echo "   4. Frontend will be available on port 5173"
echo "   5. Backend API will be available on port 3000"
echo ""
echo "🔧 Development Tools:"
echo "   - TypeScript/Vue 3/NestJS extensions installed"
echo "   - Prisma extension for database management"
echo "   - ESLint and Prettier configured"
echo "   - GitHub CLI available"
echo ""
echo "📖 Get started with: ./run-in-codespaces.sh"
echo ""

# Add helpful aliases to bashrc
cat >> ~/.bashrc << 'EOF'

# ReadsGood development aliases
alias start-app='./run-in-codespaces.sh'
alias backend='cd readsgood-backend && npm run start:dev'
alias frontend='cd readsgood-frontend && npm run dev'
alias db-studio='cd readsgood-backend && npx prisma studio'
alias db-reset='cd readsgood-backend && npx prisma db push --force-reset'

echo "💡 ReadsGood development aliases loaded:"
echo "   start-app  - Run the complete setup script"
echo "   backend    - Start backend in development mode"
echo "   frontend   - Start frontend in development mode"
echo "   db-studio  - Open Prisma Studio"
echo "   db-reset   - Reset database schema"
echo ""
EOF

# Display port forwarding info for reference
if [ -n "$CODESPACE_NAME" ]; then
    echo "📡 Port forwarding configured for Codespaces:"
    echo "   Frontend: https://${CODESPACE_NAME}-5173.app.github.dev"
    echo "   Backend:  https://${CODESPACE_NAME}-3000.app.github.dev"
    echo ""
fi
