FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# Final image
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma/
RUN npm install --production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

# Create fresh PostgreSQL migrations and start server
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate dev --name init && node dist/main.js"]