# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install ALL deps (including devDeps: tsc, prisma CLI, ts-node)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client, then compile TypeScript
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN npx prisma generate
RUN npm run build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# OpenSSL required by Prisma engine on Alpine
RUN apk add --no-cache openssl

# Only production deps in final image
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output + Prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

EXPOSE 4000

CMD ["node", "dist/server.js"]
