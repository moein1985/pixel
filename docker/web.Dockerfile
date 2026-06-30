FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
RUN pnpm install --shamefully-hoist --ignore-scripts --config.platform=linux --config.arch=x64
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('apps/web/node_modules/next/package.json'));console.log('next version:',p.version)"

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public
COPY apps/web/next.config.mjs ./apps/web/next.config.mjs
COPY apps/web/tsconfig.json ./apps/web/tsconfig.json
COPY apps/web/tailwind.config.ts ./apps/web/tailwind.config.ts
COPY apps/web/postcss.config.cjs ./apps/web/postcss.config.cjs
COPY apps/web/package.json ./apps/web/package.json
COPY packages/db/src ./packages/db/src
COPY packages/db/package.json ./packages/db/package.json
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/src ./packages/ui/src
COPY packages/ui/package.json ./packages/ui/package.json
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY tsconfig.base.json ./tsconfig.base.json
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npx", "next", "dev", "--port", "3000", "--hostname", "0.0.0.0"]
