# Shiro VPS Deployment

This directory contains files for deploying Shiro to your VPS using Docker.

## Prerequisites

1. Docker and Docker Compose installed on your VPS
2. Login to GitHub Container Registry:
   ```bash
   docker login ghcr.io -u dante-dan
   ```
   Use a GitHub Personal Access Token with `read:packages` permission as the password.

## Setup

1. Copy this entire `deploy` folder to your VPS:
   ```bash
   scp -r deploy/ user@your-vps:~/shiro/
   ```

2. SSH into your VPS and navigate to the directory:
   ```bash
   ssh user@your-vps
   cd ~/shiro
   ```

3. Create the `.env` file with your runtime secrets:
   ```bash
   cp .env.example .env
   nano .env  # Edit with your actual values
   ```

4. Make the setup script executable:
   ```bash
   chmod +x setup.sh
   ```

5. Run the initial deployment:
   ```bash
   ./setup.sh
   ```

## Updating

To update to the latest version, simply run:
```bash
./setup.sh
```

The script will:
1. Pull the latest image from ghcr.io
2. Start a new container and wait for health check
3. Stop the old container only if the new one is healthy
4. Clean up unused images

## Rollback

To rollback to a specific version:
```bash
# Pull a specific commit version
docker pull ghcr.io/dante-dan/shiro:sha-abc1234

# Tag it as latest
docker tag ghcr.io/dante-dan/shiro:sha-abc1234 ghcr.io/dante-dan/shiro:latest

# Restart
docker compose up -d
```

## Cloudflare Tunnel

The container binds to `127.0.0.1:2323` only. Configure your Cloudflare Tunnel to point to:
```
http://localhost:2323
```

## Environment Variables

### Build-time (set in GitHub Secrets)
These are baked into the Docker image during build:
- `NEXT_PUBLIC_GATEWAY_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `GA_ID`
- `GTM_ID`

### Runtime (set in .env on VPS)
These are passed to the container at runtime:
- `CLERK_SECRET_KEY`

## Files

- `docker-compose.yml` - Container configuration
- `setup.sh` - Zero-downtime deployment script
- `.env` - Runtime secrets (create from .env.example)
- `.env.example` - Template for .env
