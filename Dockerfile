# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.11.1

FROM node:${NODE_VERSION}-alpine as base
EXPOSE 3000

FROM base as dev
ENV NODE_ENV development
ENV HUSKY 0
USER node
WORKDIR /usr/src/app
RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=package-lock.json,target=package-lock.json \
  --mount=type=cache,target=/root/.npm \
  npm ci --include=dev
COPY . .
CMD npx prisma migrate deploy && npx prisma generate && npm run dev

FROM base as prod-build
ENV NODE_ENV production
ENV HUSKY 0
USER node
WORKDIR /usr/src/app
COPY package*.json ./
COPY prisma/schema.prisma prisma/migrations ./prisma/
RUN npm ci --include=dev
COPY . .
RUN npm run build

FROM base as prod
ENV NODE_ENV production
ENV HUSKY 0
USER node
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=prod-build /usr/src/app/dist ./dist
COPY --from=prod-build /usr/src/app/prisma ./prisma
COPY --from=prod-build /usr/src/app/swagger ./swagger
CMD npx prisma migrate deploy && npx prisma generate && npm start
