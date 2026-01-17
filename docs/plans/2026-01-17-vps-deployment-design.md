# VPS Deployment Design

## Overview

Migrate the Shiro blog from Vercel to self-hosted VPS using Docker, with GitHub Actions CI/CD pushing to ghcr.io.

## Architecture

```
GitHub (main push) → GitHub Actions → ghcr.io/dante-dan/shiro
                                              ↓
                                    VPS (manual pull)
                                              ↓
                                    Docker (localhost:2323)
                                              ↓
                                    Cloudflare Tunnel → domain
```

## Technical Decisions

| Decision | Choice |
|----------|--------|
| Node.js version | 20 LTS (Alpine) |
| Package manager | pnpm 9 via corepack |
| Container registry | ghcr.io |
| Port | 2323 (localhost only) |
| Zero-downtime | Docker Compose health checks |
| Deployment trigger | Manual (pull-based) |

## Environment Variables

**Build-time (baked into image via GitHub Secrets):**
- NEXT_PUBLIC_GATEWAY_URL
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- GA_ID
- GTM_ID

**Runtime (passed via .env on VPS):**
- CLERK_SECRET_KEY

## Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build (base → deps → builder → runner) |
| `.github/workflows/docker-build.yml` | Build and push to ghcr.io |
| `deploy/docker-compose.yml` | Container configuration |
| `deploy/setup.sh` | Zero-downtime deployment script |
| `deploy/.env.example` | Template for runtime secrets |
| `deploy/README.md` | Deployment instructions |

## Layer Caching Strategy

1. `deps` stage only rebuilds when package.json/pnpm-lock.yaml changes
2. GitHub Actions uses BuildKit GHA cache
3. Source changes only affect builder/runner stages

## Zero-Downtime Deployment

1. Pull latest image
2. Start new container with `--wait` (waits for health check)
3. Health check passes → stop old container
4. Health check fails → keep old container, exit with error
5. Prune unused images
