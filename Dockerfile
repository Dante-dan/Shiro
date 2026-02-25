# Stage 1: Base image with Node 20 and pnpm
FROM node:20-alpine AS base

# Install sharp globally for image optimization
RUN npm install -g --arch=x64 --platform=linux sharp

# Enable corepack and prepare pnpm 9
RUN corepack enable && corepack prepare pnpm@9 --activate

# Stage 2: Dependencies (cached unless package files change)
FROM base AS deps

RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package files for layer caching (including workspace packages)
COPY package.json pnpm-lock.yaml .npmrc ./
COPY packages/fetch/package.json ./packages/fetch/

# Use --ignore-scripts to skip prepare script (simple-git-hooks fails without .git)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Stage 3: Builder
FROM base AS builder

RUN apk update && apk add --no-cache git

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_GATEWAY_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG GA_ID
ARG GTM_ID

ENV NODE_ENV=production
ENV NEXT_PUBLIC_GATEWAY_URL=${NEXT_PUBLIC_GATEWAY_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN pnpm build

# Stage 4: Runner (minimal production image)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=2323
ENV HOSTNAME="0.0.0.0"
ENV NEXT_SHARP_PATH=/usr/local/lib/node_modules/sharp

# Install sharp in runner for image optimization
RUN npm install -g --arch=x64 --platform=linux sharp

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 2323

# Health check for zero-downtime deployment
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:2323 || exit 1

CMD ["node", "server.js"]
