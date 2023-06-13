FROM --platform=linux/amd64 node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY ./package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY ./prisma ./prisma/

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM --platform=linux/amd64 base AS builder

WORKDIR /app
ARG DEVELOP_ENV

RUN echo $DEVELOP_ENV > .env.development

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn prisma generate
RUN yarn build

FROM --platform=arm64 base AS runner
WORKDIR /app

ENV NODE_ENV=development

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN chmod -R 777 /app

COPY --from=builder /app/.env.development ./.env.development
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./

USER nestjs

EXPOSE 3000

CMD ["node", "src/main.js"]
