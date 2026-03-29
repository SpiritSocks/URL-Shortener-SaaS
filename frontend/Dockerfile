# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Run stage — serve static files with lightweight server
FROM caddy:2-alpine

COPY --from=builder /app/dist /srv

COPY <<'EOF' /etc/caddy/Caddyfile
:80 {
    root * /srv
    file_server
    try_files {path} /index.html
}
EOF

EXPOSE 80
