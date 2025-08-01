#!/bin/bash

# 🚀 Bazari Marketplace - Environment Setup Script
# This script helps you set up the environment variables for local development

echo "🌟 Welcome to Bazari Marketplace Setup!"
echo ""
echo "This script will help you create your .env.local file for development."
echo ""

# Create .env.local file
cat > .env.local << 'EOF'
# =============================================================================
# BAZARI MARKETPLACE - LOCAL DEVELOPMENT ENVIRONMENT
# =============================================================================
# 
# This file contains placeholder values for local development.
# Replace these with your actual Supabase credentials when you're ready to deploy.
#
# To get your Supabase credentials:
# 1. Go to https://supabase.com
# 2. Create a new project (or use existing)
# 3. Go to Settings > API
# 4. Copy your Project URL and anon/public key
# =============================================================================

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Bazari"

# =============================================================================
# SUPABASE CONFIGURATION (OPTIONAL FOR BASIC DEMO)
# =============================================================================
# For full functionality, replace these with your actual Supabase project credentials
# Leave empty to run in demo mode
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

# =============================================================================
# PAYMENT PROCESSING (OPTIONAL FOR DEVELOPMENT)
# =============================================================================
# Stripe Test Keys (replace with your test keys)
STRIPE_PUBLIC_KEY=pk_test_51xxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxxx

# =============================================================================
# AI SERVICES (OPTIONAL FOR DEVELOPMENT)
# =============================================================================
# OpenAI for Cultural Analysis
OPENAI_API_KEY=

# AWS Rekognition for Image Analysis
AWS_REKOGNITION_ACCESS_KEY=
AWS_REKOGNITION_SECRET_KEY=

# =============================================================================
# EMAIL SERVICE (OPTIONAL)
# =============================================================================
# Resend API Key
RESEND_API_KEY=

# =============================================================================
# MONITORING (OPTIONAL FOR DEVELOPMENT)
# =============================================================================
# Sentry (leave empty to disable)
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=

# =============================================================================
# CACHING (OPTIONAL)
# =============================================================================
# Redis (leave empty to disable caching)
REDIS_URL=

# =============================================================================
# FEATURE FLAGS
# =============================================================================
ENABLE_FRAUD_DETECTION=false
ENABLE_CULTURAL_ANALYSIS=false
ENABLE_CONTENT_MODERATION=false
ENABLE_REAL_TIME_CHAT=false

# =============================================================================
# DEVELOPMENT SETTINGS
# =============================================================================
DEBUG_MODE=true
LOG_LEVEL=info
EOF

echo "✅ Created .env.local file with default development settings!"
echo ""
echo "📝 Next steps:"
echo "1. The app will now run in demo mode with mock data"
echo "2. To enable full functionality, edit .env.local and add your Supabase credentials"
echo "3. Run 'pnpm dev' to start the development server"
echo ""
echo "🔧 To get Supabase credentials:"
echo "1. Go to https://supabase.com"
echo "2. Create a new project"
echo "3. Go to Settings > API"
echo "4. Copy your Project URL and anon/public key to .env.local"
echo ""
echo "🚀 Happy coding!"