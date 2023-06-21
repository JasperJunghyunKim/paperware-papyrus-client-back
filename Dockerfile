FROM node:18 AS builder

WORKDIR /app
COPY . .

RUN yarn install

FROM node:18-alpine3.17

WORKDIR /app
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/prisma/ ./prisma/
COPY --from=builder /app/package* .
COPY --from=builder /app/.env .

ENTRYPOINT ["sh", "-c"]

