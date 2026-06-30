FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --shamefully-hoist --ignore-scripts --config.platform=linux --config.arch=x64

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY apps/worker/src ./apps/worker/src
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/db/src ./packages/db/src
COPY packages/db/package.json ./packages/db/package.json
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/package.json ./packages/shared/package.json
COPY package.json ./
COPY pnpm-workspace.yaml ./
CMD ["npx", "tsx", "apps/worker/src/index.ts"]
