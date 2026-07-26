# Frontend Dockerfile — builds the React app, then serves it with Nginx.
# Multi-stage: stage 1 builds static files, stage 2 is a tiny Nginx image
# that just serves them (keeps the final image small).

# ---- Stage 1: build ----
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Stage 2: serve ----
FROM nginx:alpine

# Nginx config that serves the built files and forwards /api to the
# backend container (reachable by its service name "backend" on the
# Docker network created by docker-compose).
COPY docker.nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
