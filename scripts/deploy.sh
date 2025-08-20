#!/bin/bash

# Symplora Leave Management System - Deployment Script
# This script automates deployment to different hosting platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking deployment requirements..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "All requirements are met!"
}

# Build the application
build_app() {
    print_status "Building the application..."
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install --production
    cd ..
    
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    npm run build
    cd ..
    
    print_success "Application built successfully!"
}

# Deploy to Render
deploy_render() {
    print_status "Deploying to Render..."
    
    if ! command -v render &> /dev/null; then
        print_warning "Render CLI not found. Please install it first:"
        echo "npm install -g @render/cli"
        return 1
    fi
    
    render deploy
    print_success "Deployed to Render successfully!"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying frontend to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Please install it first:"
        echo "npm install -g vercel"
        return 1
    fi
    
    cd frontend
    vercel --prod
    cd ..
    
    print_success "Frontend deployed to Vercel successfully!"
}

# Deploy to Railway
deploy_railway() {
    print_status "Deploying backend to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Please install it first:"
        echo "npm install -g @railway/cli"
        return 1
    fi
    
    cd backend
    railway up
    cd ..
    
    print_success "Backend deployed to Railway successfully!"
}

# Deploy to Heroku
deploy_heroku() {
    print_status "Deploying to Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        print_warning "Heroku CLI not found. Please install it first:"
        echo "curl https://cli-assets.heroku.com/install.sh | sh"
        return 1
    fi
    
    # Deploy backend
    print_status "Deploying backend to Heroku..."
    cd backend
    heroku create symplora-backend-$(date +%s)
    heroku addons:create heroku-postgresql:mini
    git add .
    git commit -m "Deploy to Heroku"
    git push heroku main
    cd ..
    
    # Deploy frontend
    print_status "Deploying frontend to Heroku..."
    cd frontend
    heroku create symplora-frontend-$(date +%s)
    heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static
    git add .
    git commit -m "Deploy to Heroku"
    git push heroku main
    cd ..
    
    print_success "Deployed to Heroku successfully!"
}

# Main deployment function
main() {
    local platform=$1
    
    print_status "Starting deployment process..."
    
    check_requirements
    build_app
    
    case $platform in
        "render")
            deploy_render
            ;;
        "vercel-railway")
            deploy_vercel
            deploy_railway
            ;;
        "heroku")
            deploy_heroku
            ;;
        "all")
            deploy_render
            deploy_vercel
            deploy_railway
            ;;
        *)
            print_error "Unknown platform: $platform"
            echo "Usage: $0 [render|vercel-railway|heroku|all]"
            exit 1
            ;;
    esac
    
    print_success "Deployment completed successfully!"
}

# Check if platform argument is provided
if [ $# -eq 0 ]; then
    print_error "No platform specified"
    echo "Usage: $0 [render|vercel-railway|heroku|all]"
    echo ""
    echo "Platforms:"
    echo "  render          - Deploy to Render (recommended)"
    echo "  vercel-railway  - Deploy frontend to Vercel, backend to Railway"
    echo "  heroku          - Deploy to Heroku"
    echo "  all             - Deploy to all platforms"
    exit 1
fi

# Run main function with platform argument
main "$1"
