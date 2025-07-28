# Use Node.js 20 
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set NODE_OPTIONS to fix crypto compatibility
ENV NODE_OPTIONS="--openssl-legacy-provider"

# Build the application
RUN npm run build

# Serve static files with 'serve' package
RUN npm install -g serve

EXPOSE 8080

# Serve with proper SPA fallback and headers
CMD ["serve", "-s", "dist", "-l", "8080", "--cors"]