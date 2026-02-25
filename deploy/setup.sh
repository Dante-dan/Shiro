#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

IMAGE="ghcr.io/dante-dan/shiro:latest"
CONTAINER_NAME="shiro"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    log_error ".env file not found. Please create one from .env.example"
    exit 1
fi

# Get current image ID before pull (if container exists)
OLD_IMAGE_ID=""
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    OLD_IMAGE_ID=$(docker inspect --format='{{.Image}}' "$CONTAINER_NAME" 2>/dev/null || true)
    log_info "Current container image: ${OLD_IMAGE_ID:0:12}"
fi

# Pull the latest image
log_info "Pulling latest image..."
docker pull "$IMAGE"

NEW_IMAGE_ID=$(docker inspect --format='{{.Id}}' "$IMAGE")
log_info "New image: ${NEW_IMAGE_ID:0:12}"

# Check if update is needed
if [ "$OLD_IMAGE_ID" = "$NEW_IMAGE_ID" ]; then
    log_info "Already running the latest image. No update needed."
    exit 0
fi

# Start new container with health check wait
log_info "Starting new container..."
if docker compose up -d --wait --wait-timeout 120; then
    log_info "New container is healthy and running!"
else
    log_error "New container failed health check. Rolling back..."

    # Dump logs and health check details before rollback
    log_warn "=== Container logs ==="
    docker logs "$CONTAINER_NAME" --tail 50 2>&1
    log_warn "=== Health check details ==="
    docker inspect "$CONTAINER_NAME" --format='{{json .State.Health}}' 2>/dev/null | python3 -m json.tool 2>/dev/null || true

    # If there was an old container, try to restore it
    if [ -n "$OLD_IMAGE_ID" ]; then
        log_warn "Attempting to restore previous version..."
        docker compose down
        docker tag "$OLD_IMAGE_ID" "$IMAGE"
        docker compose up -d
    fi

    exit 1
fi

# Clean up old images
log_info "Cleaning up unused images..."
docker image prune -f

# Show status
log_info "Deployment complete!"
echo ""
docker compose ps
