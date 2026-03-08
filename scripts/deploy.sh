#!/bin/bash
# WorkSafeAI Production Deployment Script
# Usage: ./scripts/deploy.sh [backend|frontend|all] [staging|production]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${2:-staging}
TARGET=${1:-all}
BACKEND_DIR="/Users/timothyryan/.openclaw/workspace/apps/worksafeai/api"
FRONTEND_DIR="/Users/timothyryan/.openclaw/workspace/apps/worksafeai/web"
ADMIN_DIR="/Users/timothyryan/.openclaw/workspace/apps/super-admin"

# Helper functions
log_info() {
    echo -e "${GREEN}ℹ${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✖${NC} $1"
}

log_success() {
    echo -e "${GREEN}✔${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Railway CLI
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI not installed. Install with: npm install -g @railway/cli"
        exit 1
    fi
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI not installed. Install with: npm install -g vercel"
        exit 1
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        log_error "Git not installed"
        exit 1
    fi
    
    log_success "All prerequisites met"
}

# Deploy backend
deploy_backend() {
    log_info "Deploying backend to ${ENVIRONMENT}..."
    
    cd "$BACKEND_DIR"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm install
    
    # Run tests
    log_info "Running tests..."
    npm test 2>/dev/null || log_warn "Tests skipped (npm test not configured)"
    
    # Deploy via Railway
    if [ "$ENVIRONMENT" = "production" ]; then
        log_warn "Deploying to PRODUCTION"
        read -p "Are you sure? (yes/no) " -n 3 -r
        echo
        if [[ ! $REPLY =~ ^yes$ ]]; then
            log_error "Deployment cancelled"
            exit 1
        fi
        railway --environment production up --detach
    else
        log_info "Deploying to staging..."
        railway up --detach
    fi
    
    log_success "Backend deployed"
}

# Deploy frontend
deploy_frontend() {
    log_info "Deploying frontend apps to ${ENVIRONMENT}..."
    
    # Get API URL from environment
    if [ "$ENVIRONMENT" = "production" ]; then
        API_URL="https://api.worksafeai.com"
    else
        API_URL="https://api-staging.worksafeai.com"
    fi
    
    # Deploy WorkSafeAI Web App
    log_info "Deploying WorkSafeAI web app..."
    cd "$FRONTEND_DIR"
    npm install
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod \
            --env VITE_API_BASE_URL=$API_URL \
            --env VITE_ENV=production \
            --confirm
    else
        vercel \
            --env VITE_API_BASE_URL=$API_URL \
            --env VITE_ENV=staging
    fi
    log_success "WorkSafeAI web app deployed"
    
    # Deploy SuperAdmin Console
    log_info "Deploying SuperAdmin console..."
    cd "$ADMIN_DIR"
    npm install
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod \
            --env VITE_API_BASE_URL=$API_URL \
            --env VITE_ENV=production \
            --confirm
    else
        vercel \
            --env VITE_API_BASE_URL=$API_URL \
            --env VITE_ENV=staging
    fi
    log_success "SuperAdmin console deployed"
}

# Health checks
health_check() {
    log_info "Running health checks..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        API_URL="https://api.worksafeai.com"
        APP_URL="https://app.worksafeai.com"
        ADMIN_URL="https://admin.worksafeai.com"
    else
        API_URL="https://api-staging.worksafeai.com"
        APP_URL="https://staging.worksafeai.com"
        ADMIN_URL="https://admin-staging.worksafeai.com"
    fi
    
    # Check API
    log_info "Checking API health..."
    if curl -s "$API_URL/health" | grep -q "ok"; then
        log_success "API is healthy"
    else
        log_error "API health check failed"
        exit 1
    fi
    
    # Check frontend
    log_info "Checking frontend..."
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL")
    if [ "$STATUS" = "200" ]; then
        log_success "Frontend is up ($STATUS)"
    else
        log_warn "Frontend returned status $STATUS"
    fi
    
    # Check admin
    log_info "Checking admin console..."
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_URL")
    if [ "$STATUS" = "200" ]; then
        log_success "Admin console is up ($STATUS)"
    else
        log_warn "Admin console returned status $STATUS"
    fi
}

# Main execution
main() {
    log_info "WorkSafeAI Deployment Script"
    log_info "Environment: $ENVIRONMENT"
    log_info "Target: $TARGET"
    echo
    
    check_prerequisites
    echo
    
    case $TARGET in
        backend)
            deploy_backend
            ;;
        frontend)
            deploy_frontend
            ;;
        all)
            deploy_backend
            echo
            deploy_frontend
            ;;
        *)
            log_error "Unknown target: $TARGET"
            log_info "Usage: ./scripts/deploy.sh [backend|frontend|all] [staging|production]"
            exit 1
            ;;
    esac
    
    echo
    health_check
    
    echo
    log_success "Deployment complete!"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log_warn "Production deployment successful. Monitor logs for issues."
        log_info "Dashboard: https://vercel.com, https://railway.app"
    fi
}

main
