# To Do API

NestJS backend for the To Do app. PostgreSQL + Prisma, JWT auth, Swagger at `/docs`.

## Run locally

1. Start Postgres:

```bash
docker compose up -d
```

2. Copy env and install:

```bash
copy .env.example .env
npm install
npx prisma migrate dev --name init
npm run start:dev
```

API: http://localhost:3001  
Docs: http://localhost:3001/docs
