# Use the official Node.js TypeScript devcontainer as base
FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Install additional development tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    sqlite3 \
    && apt-get autoremove -y && apt-get clean -y

# Install global npm packages for development
RUN npm install -g @nestjs/cli @vue/cli prisma @types/node

# Set the default user
USER node
