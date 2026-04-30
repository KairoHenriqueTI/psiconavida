FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1
ENV npm_config_cache=/tmp/npm-cache

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --include=dev && npm cache clean --force && rm -rf /tmp/npm-cache

COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev && npm cache clean --force && rm -rf /tmp/npm-cache

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["./docker-entrypoint.sh"]
