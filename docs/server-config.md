# تنظیمات سرور و راه‌اندازی

## مشخصات سرور

| مورد | مقدار |
|---|---|
| سیستم‌عامل | Ubuntu |
| IP | 192.168.85.110 |
| SSH Port | 22 |
| Username | pihole |
| Password | 12321 |

---

## اتصال غیرتعاملی با plink

برای اتصال به سرور بدون نیاز به تأیید دستی، از `plink` استفاده می‌شود.

### نصب plink (در صورت نبود)

```powershell
# اگر PuTTY نصب نیست، از winget استفاده کنید:
winget install PuTTY.PuTTY

# یا مسیر plink را مستقیم دانلود کنید:
# https://the.earth.li/~sgtatham/putty/latest/w64/plink.exe
```

### دستور پایه

```powershell
# متغیرهای پایه — در هر session یکبار تنظیم کنید:
$SERVER = "192.168.85.110"
$USER = "pihole"
$PASS = "12321"

# اجرای دستور روی سرور (غیرتعاملی):
plink -ssh -batch -pw $PASS ${USER}@${SERVER} "command here"

# اجرای چند دستور پشت سر هم:
plink -ssh -batch -pw $PASS ${USER}@${SERVER} "command1 && command2 && command3"

# انتقال فایل به سرور:
pscp -pw $PASS -batch local_file.txt ${USER}@${SERVER}:/remote/path/

# انتقال فایل از سرور:
pscp -pw $PASS -batch ${USER}@${SERVER}:/remote/file.txt ./local/path/
```

### پذیرش host key (فقط اولین بار)

اولین اتصال نیاز به پذیرش host key دارد:

```powershell
# اولین بار — host key را cache کنید:
echo y | plink -ssh -pw $PASS ${USER}@${SERVER} "echo connected"
```

پس از این، `-batch` بدون مشکل کار می‌کند.

---

## ساختار Docker روی سرور

### پورت‌های سرویس‌ها

| سرویس | پورت داخلی | پورت خارجی (در سرور) |
|---|---|---|
| Nginx (HTTP) | 80 | 80 |
| Nginx (HTTPS) | 443 | 443 |
| Next.js (Web) | 3000 | 3000 (داخلی — پشت Nginx) |
| Node.js (API) | 4000 | 4000 (داخلی — پشت Nginx) |
| FastAPI (AI) | 8000 | 8000 (داخلی — پشت Nginx) |
| PostgreSQL | 5432 | 5432 (فقط داخلی) |
| Redis | 6379 | 6379 (فقط داخلی) |
| MinIO (API) | 9000 | 9000 (داخلی — پشت Nginx) |
| MinIO (Console) | 9001 | 9001 (فقط داخلی) |

### مسیرهای مهم روی سرور

| مسیر | کاربرد |
|---|---|
| `/opt/pixel/` | مسیر اصلی پروژه |
| `/opt/pixel/docker-compose.yml` | فایل compose اصلی |
| `/opt/pixel/.env` | متغیرهای محیطی (پسورد دیتابیس، کلیدها و...) |
| `/opt/pixel/data/postgres/` | volume دیتابیس |
| `/opt/pixel/data/redis/` | volume ردیس |
| `/opt/pixel/data/minio/` | volume مینی‌او |
| `/opt/pixel/logs/` | لاگ‌های سرویس‌ها |

---

## متغیرهای محیطی (.env)

فایل `.env` در مسیر `/opt/pixel/.env` روی سرور قرار می‌گیرد:

```env
# Database
POSTGRES_USER=pixel
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=pixel
DATABASE_URL=postgresql://pixel:<secure-password>@postgres:5432/pixel

# Redis
REDIS_URL=redis://redis:6379

# MinIO
MINIO_ROOT_USER=pixel_admin
MINIO_ROOT_PASSWORD=<secure-password>
MINIO_ENDPOINT=http://minio:9000
MINIO_BUCKET=pixel-assets

# API
API_PORT=4000
JWT_SECRET=<random-64-char-string>

# Web
WEB_PORT=3000
NEXT_PUBLIC_API_URL=http://192.168.85.110/api
NEXT_PUBLIC_AI_URL=http://192.168.85.110/ai

# AI Service
AI_PORT=8000

# SMS Provider (کاوه‌نگار / فراز / ...)
SMS_API_KEY=<key>
SMS_SENDER=<number>

# Payment Gateway
PAYMENT_MERCHANT_ID=<merchant-id>
PAYMENT_CALLBACK_URL=http://192.168.85.110/api/payment/callback
```

---

## اسکریپت deploy غیرتعاملی

### ساختار اسکریپت deploy از ویندوز به سرور

```powershell
# deploy.ps1 — اسکریپت استقرار پروژه روی سرور

param(
    [string]$Server = "192.168.85.110",
    [string]$User = "pihole",
    [string]$Pass = "12321"
)

$PLINK = "plink -ssh -batch -pw $Pass"
$PSCP = "pscp -pw $Pass -batch"
$TARGET = "${User}@${Server}"

Write-Host "1. انتقال فایل‌ها به سرور..."
& cmd /c "$PSCP -r ./docker/* $TARGET:/opt/pixel/"

Write-Host "2. ساخت و راه‌اندازی کانتینرها..."
& cmd /c "$PLINK $TARGET 'cd /opt/pixel && docker compose down && docker compose build --no-cache && docker compose up -d'"

Write-Host "3. اجرای migration دیتابیس..."
& cmd /c "$PLINK $TARGET 'cd /opt/pixel && docker compose exec api pnpm db:migrate'"

Write-Host "4. بررسی وضعیت سرویس‌ها..."
& cmd /c "$PLINK $TARGET 'cd /opt/pixel && docker compose ps'"

Write-Host "Deploy complete."
```

### دستورات پرکاربرد

```powershell
# مشاهده وضعیت کانتینرها:
plink -ssh -batch -pw 12321 pihole@192.168.85.110 "cd /opt/pixel && docker compose ps"

# مشاهده لاگ‌ها:
plink -ssh -batch -pw 12321 pihole@192.168.85.110 "cd /opt/pixel && docker compose logs -f --tail=100"

# ریستارت یک سرویس:
plink -ssh -batch -pw 12321 pihole@192.168.85.110 "cd /opt/pixel && docker compose restart api"

# ورود به کانتینر API:
plink -ssh -batch -pw 12321 pihole@192.168.85.110 "cd /opt/pixel && docker compose exec api bash"

# backup دیتابیس:
plink -ssh -batch -pw 12321 pihole@192.168.85.110 "cd /opt/pixel && docker compose exec postgres pg_dump -U pixel pixel > /opt/pixel/backups/db_$(date +%Y%m%d).sql"
```

---

## Docker Compose پایه

این فایل در فاز ۰ کامل می‌شود، ولی ساختار کلی:

```yaml
# /opt/pixel/docker-compose.yml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - ./data/redis:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - ./data/minio:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 15s
      timeout: 10s
      retries: 3

  api:
    build:
      context: ../apps/api
      dockerfile: Dockerfile
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}
      MINIO_ENDPOINT: ${MINIO_ENDPOINT}
      MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
    ports:
      - "4000:4000"

  web:
    build:
      context: ../apps/web
      dockerfile: Dockerfile
    restart: always
    depends_on:
      - api
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      NEXT_PUBLIC_AI_URL: ${NEXT_PUBLIC_AI_URL}
    ports:
      - "3000:3000"

  ai:
    build:
      context: ../apps/ai
      dockerfile: Dockerfile
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
    ports:
      - "8000:8000"

  nginx:
    image: nginx:alpine
    restart: always
    depends_on:
      - web
      - api
      - ai
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf.d:/etc/nginx/conf.d
    ports:
      - "80:80"
      - "443:443"
```

---

## Nginx Configuration پایه

```nginx
# /opt/pixel/nginx/conf.d/default.conf

upstream web_upstream {
    server web:3000;
}

upstream api_upstream {
    server api:4000;
}

upstream ai_upstream {
    server ai:8000;
}

server {
    listen 80;
    server_name 192.168.85.110;

    # API
    location /api/ {
        proxy_pass http://api_upstream/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # AI Service
    location /ai/ {
        proxy_pass http://ai_upstream/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # MinIO (برای دسترسی به تصاویر)
    location /assets/ {
        proxy_pass http://minio:9000/pixel-assets/;
        proxy_set_header Host $host;
    }

    # Next.js (بقیه)
    location / {
        proxy_pass http://web_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # WebSocket support برای Next.js HMR
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## چک‌لیست آماده‌سازی سرور (فاز ۰)

این مراحل در فاز ۰ با plink اجرا می‌شوند:

- [ ] نصب Docker و Docker Compose روی سرور
- [ ] ایجاد مسیر `/opt/pixel/` و زیرمسیرها
- [ ] ایجاد فایل `.env` با پسوردهای امن
- [ ] استقرار `docker-compose.yml`
- [ ] استقرار تنظیمات Nginx
- [ ] اجرای اولیه کانتینرها (postgres, redis, minio, nginx)
- [ ] بررسی health check تمام سرویس‌ها
- [ ] ایجاد bucket در MinIO
- [ ] نصب extensionهای PostgreSQL (pg_trgm, unaccent, TimescaleDB)
- [ ] تست backup اولیه دیتابیس
