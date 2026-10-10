# syntax=docker/dockerfile:1

# 1) Dependencies, installed from the committed bun.lock so versions match what was tested.
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 2) Type-check and build the frontend.
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node_modules/.bin/tsc --noEmit && node_modules/.bin/vite build

# 3) Runtime. tsx runs server.ts directly, so node_modules stays complete.
FROM node:22-slim AS runtime
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json tsconfig.json server.ts firebase-applet-config.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node drizzle ./drizzle
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node_modules/.bin/tsx", "server.ts"]
