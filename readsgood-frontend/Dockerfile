FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Serve static files with 'serve' package
FROM node:18-alpine

RUN npm install -g serve

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
