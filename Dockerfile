FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

COPY tsconfig.json ./
COPY scripts ./scripts
COPY src ./src

EXPOSE 3000

USER node

CMD ["npx", "tsx", "src/index.ts"]
