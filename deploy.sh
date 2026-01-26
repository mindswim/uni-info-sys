#!/bin/bash
# Deploy University SIS to Hetzner
# Usage: ./deploy.sh

set -e

SERVER="root@116.203.59.244"
REMOTE_DIR="/root/university-sis"

echo "=== Deploying University SIS to Hetzner ==="

# 1. Sync files to server (excluding unnecessary files)
echo "Syncing files..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude 'vendor' \
    --exclude '.git' \
    --exclude 'storage/logs/*' \
    --exclude 'storage/framework/cache/*' \
    --exclude 'storage/framework/sessions/*' \
    --exclude 'storage/framework/views/*' \
    --exclude 'frontend/node_modules' \
    --exclude 'frontend/.next' \
    --exclude '.env' \
    --exclude 'database/schema' \
    --exclude 'tests' \
    ./ ${SERVER}:${REMOTE_DIR}/

# 2. Run deployment commands on server
echo "Building and starting containers..."
ssh ${SERVER} << 'EOF'
cd /root/university-sis

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    # Generate secure passwords
    DB_PASS=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24)
    DB_ROOT_PASS=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24)

    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASS}/" .env
    sed -i "s/DB_ROOT_PASSWORD=.*/DB_ROOT_PASSWORD=${DB_ROOT_PASS}/" .env

    # Also create a .env file for docker-compose
    echo "DB_PASSWORD=${DB_PASS}" > .env.docker
    echo "DB_ROOT_PASSWORD=${DB_ROOT_PASS}" >> .env.docker
fi

# Source docker env
export $(cat .env.docker | xargs)

# Build and start (no-cache to ensure fresh image)
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Wait for MySQL to be ready
echo "Waiting for MySQL..."
sleep 10

# Run migrations (first time only or when needed)
docker compose -f docker-compose.prod.yml --profile setup run --rm migrate

echo "=== Deployment complete! ==="
echo "API running on port 3010"
EOF

echo ""
echo "=== Next Steps ==="
echo "1. Add DNS record: api.sis.mindswim.co -> 116.203.59.244"
echo "2. Add Caddy config (see below)"
echo ""
echo "Caddy config to add:"
echo "api.sis.mindswim.co {"
echo "    reverse_proxy localhost:3010"
echo "}"
