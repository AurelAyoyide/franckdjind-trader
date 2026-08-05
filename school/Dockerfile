FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app

ARG DATABASE_URL
ARG SESSION_SECRET
ARG APP_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG PRIVATE_UPLOAD_DIR
ARG PLATFORM_NAME
ARG CRON_SECRET

ENV DATABASE_URL=$DATABASE_URL
ENV SESSION_SECRET=$SESSION_SECRET
ENV APP_URL=$APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV PRIVATE_UPLOAD_DIR=$PRIVATE_UPLOAD_DIR
ENV PLATFORM_NAME=$PLATFORM_NAME
ENV CRON_SECRET=$CRON_SECRET

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/next.config.ts ./next.config.ts

RUN apk add --no-cache ffmpeg
RUN mkdir -p /app/private_uploads

EXPOSE 3002

CMD ["./node_modules/.bin/next", "start", "--hostname", "0.0.0.0", "--port", "3002"]
