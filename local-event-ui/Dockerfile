# ─── Build stage ───
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json build.mjs ./
COPY public ./public
COPY src ./src
RUN npm run build

# ─── Serve stage ───
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# The events API base URL. Override at run time:
#   docker run -e EVENTS_API_URL=http://my-events-api:8080 ...
ENV EVENTS_API_URL=http://local-event-aggregator
# Restrict envsubst to only our variable so nginx's own $vars stay literal.
ENV NGINX_ENVSUBST_FILTER=^EVENTS_

EXPOSE 80
