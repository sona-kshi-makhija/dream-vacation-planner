# Backend Dockerfile — Node.js + Express REST API

FROM node:18-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --production

# Copy the rest of the backend source
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
