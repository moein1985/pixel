# فاز ۰ — زیرساخت و راه‌اندازی

## هدف

آماده‌سازی سرور اوبونتو، نصب Docker، ایجاد ساختار monorepo، راه‌اندازی دیتابیس و سرویس‌های پایه، و استقرار اولیه روی سرور.

## مدت تخمینی: ۱-۲ هفته

---

## مرحله ۱: آماده‌سازی سرور

### ۱-۱. نصب Docker و Docker Compose

دستورات زیر با plink از ویندوز روی سرور اجرا می‌شوند:

```powershell
# پذیرش host key (فقط اولین بار):
echo y | plink -ssh -pw 1234321 moein@192.168.85.92 "echo connected"

# نصب Docker:
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "curl -fsSL https://get.docker.com | sudo sh"

# اضافه کردن moein به گروه docker:
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "sudo usermod -aG docker moein"

# فعال‌سازی Docker:
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "sudo systemctl enable docker && sudo systemctl start docker"

# بررسی نصب:
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "docker --version && docker compose version"
```

### ۱-۲. ایجاد مسیرهای پروژه

```powershell
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "sudo mkdir -p /opt/pixel/{data/postgres,data/redis,data/minio,backups,logs,nginx/conf.d,postgres}"
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "sudo chown -R moein:moein /opt/pixel"
```

### ۱-۳. نصب ابزارهای کمکی

```powershell
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "sudo apt-get update && sudo apt-get install -y curl wget htop vim ufw fail2ban"
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw --force enable"
```

---

## مرحله ۲: ایجاد Monorepo (لوکال)

### ۲-۱. ساختار پوشه‌ها

در سیستم لوکال (ویندوز) ساختار زیر ایجاد می‌شود:

```
pixel/
├── apps/
│   ├── web/              # Next.js
│   ├── api/              # Node.js + tRPC
│   ├── ai/               # Python + FastAPI
│   └── worker/           # BullMQ worker
├── packages/
│   ├── db/               # Drizzle schema
│   ├── shared/           # types, zod schemas
│   └── ui/               # shared components
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── conf.d/
│   │       └── default.conf
│   └── postgres/
│       └── init.sql
├── docs/
├── .gitignore
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── .env.example
```

### ۲-۲. فایل‌های پایه monorepo

**`package.json` (root):**
```json
{
  "name": "pixel",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "db:generate": "pnpm --filter @pixel/db generate",
    "db:migrate": "pnpm --filter @pixel/db migrate",
    "db:seed": "pnpm --filter @pixel/db seed"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.5.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

**`pnpm-workspace.yaml`:**
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**`turbo.json`:**
```json
{
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    }
  }
}
```

**`.gitignore`:**
```
node_modules/
.next/
dist/
.env
.env.local
*.log
.turbo/
coverage/
```

### ۲-۳. پکیج shared

**`packages/shared/package.json`:**
```json
{
  "name": "@pixel/shared",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "zod": "^3.23.0"
  }
}
```

محتوای `packages/shared/src/`:
- `index.ts` — export همه
- `enums.ts` — enumهای نقش‌ها، وضعیت‌ها، دسته‌بندی‌ها
- `schemas/` — zod schemaهای مشترک (user, product, order و...)
- `constants.ts` — ثابت‌های پروژه (حداکثر طول نام، الگوهای اعتبارسنجی و...)

### ۲-۴. پکیج db

**`packages/db/package.json`:**
```json
{
  "name": "@pixel/db",
  "private": true,
  "scripts": {
    "generate": "drizzle-kit generate",
    "migrate": "drizzle-kit migrate",
    "seed": "tsx src/seed.ts",
    "studio": "drizzle-kit studio"
  },
  "dependencies": {
    "drizzle-orm": "^0.30.0",
    "postgres": "^3.4.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.21.0",
    "tsx": "^4.0.0"
  }
}
```

محتوای `packages/db/`:
- `src/schema/` — تعریف جدول‌ها (در فاز ۱ کامل می‌شود)
- `src/index.ts` — export client و schema
- `src/seed.ts` — داده‌های اولیه
- `drizzle.config.ts` — تنظیمات Drizzle

**`drizzle.config.ts`:**
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## مرحله ۳: راه‌اندازی apps

### ۳-۱. Next.js (apps/web)

```bash
# در مسیر pixel/ لوکال:
pnpm create next-app apps/web --typescript --tailwind --app --src-dir --import-alias "@/*"
```

نصب پکیج‌های اضافی:
```bash
cd apps/web
pnpm add @trpc/client @trpc/react-query @tanstack/react-query
pnpm add @auth/core next-auth
pnpm add zustand react-hook-form @hookform/resolvers
pnpm add dayjs jalaliday
pnpm add lucide-react
pnpm add class-variance-authority clsx tailwind-merge
pnpm add -D @types/node
```

تنظیمات مهم:
- `tailwind.config.ts` — اضافه کردن `dir: "rtl"` و فونت Vazirmatn
- `src/app/layout.tsx` — تنظیم `lang="fa"` و `dir="rtl"` و بارگذاری فونت
- ایجاد `src/lib/trpc.ts` — tRPC client
- ایجاد `src/lib/auth.ts` — تنظیمات Auth.js

### ۳-۲. Node.js + tRPC (apps/api)

**`apps/api/package.json`:**
```json
{
  "name": "@pixel/api",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "start": "node dist/index.js",
    "test": "vitest"
  },
  "dependencies": {
    "@trpc/server": "^11.0.0",
    "trpc-openapi": "^1.2.0",
    "@pixel/db": "workspace:*",
    "@pixel/shared": "workspace:*",
    "fastify": "^4.28.0",
    "@fastify/cors": "^9.0.0",
    "@fastify/cookie": "^9.3.0",
    "@fastify/websocket": "^10.0.0",
    "drizzle-orm": "^0.30.0",
    "postgres": "^3.4.0",
    "redis": "^4.6.0",
    "bullmq": "^5.7.0",
    "zod": "^3.23.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "argon2": "^0.40.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "tsup": "^8.0.0",
    "vitest": "^1.6.0",
    "typescript": "^5.5.0"
  }
}
```

ساختار `apps/api/src/`:
- `index.ts` — راه‌اندازی Fastify server
- `trpc/context.ts` — tRPC context (شامل user session, db, redis)
- `trpc/router.ts` — root router (merge تمام sub-routerها)
- `trpc/routers/` — routerهای هر دامین (auth, user, farmer, supplier, product, order و...)
- `trpc/openapi.ts` — تولید REST endpointها از tRPC
- `middleware/auth.ts` — middleware احراز هویت
- `lib/redis.ts` — Redis client
- `lib/sms.ts` — ارسال پیامک OTP
- `lib/minio.ts` — MinIO client

### ۳-۳. Python + FastAPI (apps/ai)

**`apps/ai/requirements.txt`:**
```
fastapi==0.111.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.30
psycopg2-binary==2.9.9
redis==5.0.4
pydantic==2.7.0
httpx==0.27.0
transformers==4.41.0
torch==2.3.0
scikit-learn==1.5.0
xgboost==2.0.3
Pillow==10.3.0
opencv-python-headless==4.9.0.80
pytest==8.2.0
```

ساختار `apps/ai/`:
- `main.py` — راه‌اندازی FastAPI
- `routers/` — endpointهای AI (chatbot, price-prediction, image-recognition, fraud-detection)
- `models/` — مدل‌های ML
- `services/` — منطق کسب‌وکار AI
- `tests/` — تست‌های pytest
- `Dockerfile`

### ۳-۴. Worker (apps/worker)

ساختار ساده برای پردازش صف BullMQ:
- `src/index.ts` — راه‌اندازی worker و ثبت job handlers
- jobها: ارسال SMS، پردازش تصویر، نوتیفیکیشن، گزارش‌گیری دوره‌ای

---

## مرحله ۴: Dockerfileها

### ۴-۱. Dockerfile برای API

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @pixel/api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/shared ./packages/shared
EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
```

### ۴-۲. Dockerfile برای Web

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @pixel/web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

### ۴-۳. Dockerfile برای AI

```dockerfile
# apps/ai/Dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## مرحله ۵: PostgreSQL Init Script

**`docker/postgres/init.sql`:**

```sql
-- ایجاد extensionهای مورد نیاز
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TimescaleDB در صورت نصب:
-- CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ایجاد indexهای full-text search فارسی
-- این indexها بعد از ایجاد جدول‌ها در فاز ۱ اضافه می‌شوند

-- تنظیم encoding
SET client_encoding TO 'UTF8';
```

---

## مرحله ۶: استقرار اولیه روی سرور

### ۶-۱. انتقال فایل‌های Docker به سرور

```powershell
# انتقال پوشه docker به سرور:
pscp -pw 1234321 -batch -r .\docker\* moein@192.168.85.92:/opt/pixel/
```

### ۶-۲. ایجاد فایل .env روی سرور

```powershell
# ایجاد فایل .env با مقادیر امن:
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "cat > /opt/pixel/.env << 'EOF'
POSTGRES_USER=pixel
POSTGRES_PASSWORD=ChangeMe_Str0ng_Pass!
POSTGRES_DB=pixel
DATABASE_URL=postgresql://pixel:ChangeMe_Str0ng_Pass!@postgres:5432/pixel
REDIS_URL=redis://redis:6379
MINIO_ROOT_USER=pixel_admin
MINIO_ROOT_PASSWORD=ChangeMe_MinIO_Str0ng!
MINIO_ENDPOINT=http://minio:9000
MINIO_BUCKET=pixel-assets
API_PORT=4000
JWT_SECRET=ChangeThisToRandom64CharString_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
WEB_PORT=3000
NEXT_PUBLIC_API_URL=http://192.168.85.92/api
NEXT_PUBLIC_AI_URL=http://192.168.85.92/ai
AI_PORT=8000
SMS_API_KEY=placeholder
SMS_SENDER=1000xxxx
PAYMENT_MERCHANT_ID=placeholder
PAYMENT_CALLBACK_URL=http://192.168.85.92/api/payment/callback
EOF"
```

### ۶-۳. اجرای کانتینرهای پایه

```powershell
# فقط سرویس‌های پایه (بدون appها که هنوز ساخته نشدند):
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "cd /opt/pixel && docker compose up -d postgres redis minio nginx"

# بررسی وضعیت:
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "cd /opt/pixel && docker compose ps"
```

### ۶-۴. ایجاد MinIO Bucket

```powershell
# نصب mc (MinIO Client) روی سرور:
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "docker run --rm minio/mc alias set local http://192.168.85.92:9000 pixel_admin ChangeMe_MinIO_Str0ng!"

plink -ssh -batch -pw 1234321 moein@192.168.85.92 "docker run --rm minio/mc mb local/pixel-assets"

plink -ssh -batch -pw 1234321 moein@192.168.85.92 "docker run --rm minio/mc anonymous set download local/pixel-assets"
```

---

## مرحله ۷: تست‌های فاز ۰

### ۷-۱. تست‌های خودکار

**تست اتصال دیتابیس:**
```bash
# در apps/api:
pnpm vitest run tests/infrastructure/db.test.ts
```

تست‌هایی که باید نوشته شوند:
- اتصال به PostgreSQL و اجرای query ساده
- اتصال به Redis و set/get
- اتصال به MinIO و upload/download فایل
- بررسی وجود extensionهای pg_trgm, unaccent, uuid-ossp

**تست Nginx routing:**
- درخواست به `http://192.168.85.92/api/health` باید به API برسد
- درخواست به `http://192.168.85.92/` باید به Next.js برسد (وقتی راه‌اندازی شد)

### ۷-۲. تست‌های استقرار

```powershell
# تست health check تمام سرویس‌ها:
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "cd /opt/pixel && docker compose ps --format json | jq '.[] | {Name: .Name, Status: .Status}'"

# تست backup دیتابیس:
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "docker exec pixel-postgres-1 pg_dump -U pixel pixel > /opt/pixel/backups/test_backup.sql && echo 'Backup OK'"

# تست restore:
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "docker exec -i pixel-postgres-1 psql -U pixel -c 'CREATE DATABASE test_restore;' && docker exec -i pixel-postgres-1 psql -U pixel test_restore < /opt/pixel/backups/test_backup.sql && echo 'Restore OK'"

# پاکسازی تست:
plink -ssh -batch -pw 1234321 moein@192.168.85.92 "docker exec -i pixel-postgres-1 psql -U pixel -c 'DROP DATABASE test_restore;'"
```

### ۷-۳. چک‌لیست تأیید فاز ۰

- [x] Docker و Docker Compose نصب شده‌اند
- [ ] مسیر `/opt/pixel/` با زیرمسیرها ایجاد شده — هنوز روی سرور استقرار ندادیم
- [ ] فایل `.env` با مقادیر امن ایجاد شده — فایل لوکال موجود، فایل سرور هنوز نه
- [x] PostgreSQL بالا و extensionها نصب شده‌اند
- [x] Redis بالا و پاسخ‌گو است
- [x] MinIO بالا و bucket ایجاد شده
- [x] Nginx بالا و routing درست کار می‌کند
- [x] Monorepo لوکال با Turborepo + pnpm راه‌اندازی شده
- [x] Dockerfileهای web, api, ai نوشته شده‌اند
- [ ] تست backup/restore دیتابیس موفق بوده — هنوز انجام نشده
- [ ] firewall فعال و فقط پورت‌های ۲۲، ۸۰، ۴۴۳ باز هستند — هنوز پیکربندی نشده

---

## خروجی نهایی فاز ۰

- سرور اوبونتو آماده با Docker
- تمام سرویس‌های پایه (PostgreSQL, Redis, MinIO, Nginx) در حال اجرا
- Monorepo با ساختار Turborepo + pnpm آماده توسعه
- Dockerfileهای تمام appها آماده
- اسکریپت deploy غیرتعاملی با plink کار می‌کند
- سیستم backup دیتابیس تست شده
