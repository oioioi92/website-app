# chat-server (P0)

## Requirements
- Node.js 20+
- Postgres (独立 DB/用户，最小权限)

## Environment
Copy `.env.example` to `.env` and fill:
- `CHAT_DATABASE_URL`
- `CHAT_ADMIN_JWT_SECRET`
- `CHAT_ALLOWED_ORIGINS`
- `ADMIN_ALLOWED_ORIGINS`

## Prisma
Generate client:
```
npm run prisma:generate
```

Apply migrations (prod):
```
npm run prisma:migrate
```

For local dev (first time), you can use:
```
npx prisma migrate dev --schema prisma/schema.prisma --name p0_init
```

## Run
```
npm run dev
```

Expected logs:
- `SERVER_OK port=4000`
- `DB_OK`
- `WS_OK visitor=/ws-visitor admin=/ws-admin`

