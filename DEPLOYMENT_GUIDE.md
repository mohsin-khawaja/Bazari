# 🚀 Bazari Marketplace - Production Deployment Guide

Complete guide for deploying the ethnic clothing marketplace to production with enterprise-level features.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Application Deployment](#application-deployment)
- [Monitoring & Logging](#monitoring--logging)
- [Security Configuration](#security-configuration)
- [Performance Optimization](#performance-optimization)
- [Backup & Recovery](#backup--recovery)
- [CI/CD Pipeline](#cicd-pipeline)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **pnpm**: 8.x or higher
- **Docker**: 20.x or higher
- **Docker Compose**: 2.x or higher

### Required Services
- **Supabase**: Database & Authentication
- **Redis**: Caching (optional but recommended)
- **AWS S3/Cloudinary**: File storage
- **Sentry**: Error tracking
- **Domain**: SSL-enabled domain name

### Third-party Integrations
- **Stripe**: Payment processing
- **OpenAI**: Cultural analysis
- **AWS Rekognition**: Image analysis
- **SendGrid/Resend**: Email service
- **Twilio**: SMS service (optional)

## 🌍 Environment Setup

### 1. Environment Files

Create environment-specific files:

```bash
# Production
cp .env.example .env.production

# Staging  
cp .env.example .env.staging

# Local development
cp .env.example .env.local
```

### 2. Required Environment Variables

#### Application
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://bazari.com
NEXT_PUBLIC_APP_NAME="Bazari"
```

#### Database (Supabase)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

#### Payment (Stripe)
```bash
STRIPE_PUBLIC_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

#### Storage & CDN
```bash
# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=bazari-production

# Or Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### AI Services
```bash
OPENAI_API_KEY=sk-your_openai_key
AWS_REKOGNITION_ACCESS_KEY=your_access_key
AWS_REKOGNITION_SECRET_KEY=your_secret_key
```

#### Monitoring
```bash
SENTRY_DSN=https://your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_token
```

#### Caching (Redis)
```bash
REDIS_URL=redis://your_redis_host:6379
REDIS_PASSWORD=your_redis_password
```

## 🗄️ Database Setup

### 1. Supabase Project Setup

1. Create a new Supabase project
2. Configure authentication providers
3. Set up Row Level Security (RLS)
4. Run database migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your_project_id

# Run migrations
supabase db push
```

### 2. Database Migrations

Execute all SQL scripts in order:

```bash
# Core tables
psql -f scripts/01-create-tables.sql
psql -f scripts/02-create-policies.sql
# ... continue with all scripts up to
psql -f scripts/18-secure-uploads-table.sql
```

### 3. Initial Data Setup

```sql
-- Create admin user
INSERT INTO profiles (id, email, role, full_name) 
VALUES ('admin-uuid', 'admin@bazari.com', 'admin', 'Admin User');

-- Set up cultural categories
INSERT INTO cultural_categories (name, description) VALUES
('Indian', 'Traditional Indian clothing and accessories'),
('Pakistani', 'Authentic Pakistani ethnic wear'),
('African', 'African traditional clothing and textiles'),
-- Add more categories as needed
```

## 🐳 Application Deployment

### Option 1: Docker Deployment

#### 1. Build Docker Image
```bash
# Build production image
docker build -t bazari/marketplace:latest .

# Or use docker-compose
docker-compose up -d
```

#### 2. Deploy with Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    image: bazari/marketplace:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
```

### Option 2: Vercel Deployment

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy to Vercel
```bash
# Deploy to production
vercel --prod

# Set environment variables
vercel env add NODE_ENV production
vercel env add NEXT_PUBLIC_SUPABASE_URL your_url
# Add all other environment variables
```

### Option 3: AWS/GCP/Azure Deployment

#### Using AWS ECS/Fargate
1. Push Docker image to ECR
2. Create ECS task definition
3. Deploy to ECS cluster
4. Configure load balancer
5. Set up auto-scaling

#### Using Kubernetes
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bazari-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bazari
  template:
    metadata:
      labels:
        app: bazari
    spec:
      containers:
      - name: app
        image: bazari/marketplace:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        # Add other environment variables
```

## 📊 Monitoring & Logging

### 1. Sentry Setup

```typescript
// sentry.client.config.ts
import { initSentry } from '@/lib/monitoring/sentry'

initSentry()
```

### 2. Prometheus Metrics

Deploy monitoring stack:
```bash
# Start monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana
open http://localhost:3001
```

### 3. Log Aggregation

Configure log shipping to your preferred service:
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Grafana Loki**: For Kubernetes environments
- **AWS CloudWatch**: For AWS deployments
- **Google Cloud Logging**: For GCP deployments

## 🔒 Security Configuration

### 1. SSL/TLS Setup

#### Using Cloudflare
1. Add domain to Cloudflare
2. Enable "Full (strict)" SSL mode
3. Create page rules for caching
4. Enable security features

#### Using Let's Encrypt with Caddy
```caddyfile
# Caddyfile
bazari.com {
    reverse_proxy app:3000
    
    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
    
    # Rate limiting
    rate_limit {
        zone static_ip 100r/m
        zone dynamic_burst 50r/s
    }
}
```

### 2. Firewall Configuration

```bash
# UFW firewall rules
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw deny incoming
ufw allow outgoing
ufw enable
```

### 3. Security Headers

Already configured in `next.config.js`:
- HSTS
- XSS Protection
- Content Type Options
- Frame Options
- Referrer Policy

## 🚀 Performance Optimization

### 1. CDN Setup

#### Cloudflare Configuration
```javascript
// Cloudflare Page Rules
const pageRules = [
  {
    pattern: "bazari.com/images/*",
    settings: {
      cacheLevel: "cache_everything",
      cacheTtl: 2592000, // 30 days
    }
  },
  {
    pattern: "bazari.com/api/*",
    settings: {
      cacheLevel: "bypass"
    }
  }
]
```

#### AWS CloudFront
```yaml
# CloudFormation template
Resources:
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - DomainName: bazari.com
            Id: BazariOrigin
            CustomOriginConfig:
              HTTPPort: 443
              OriginProtocolPolicy: https-only
        DefaultCacheBehavior:
          TargetOriginId: BazariOrigin
          ViewerProtocolPolicy: redirect-to-https
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad # Managed-CachingOptimized
```

### 2. Database Optimization

```sql
-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_items_cultural_tags ON items USING GIN(cultural_tags);
CREATE INDEX CONCURRENTLY idx_items_status_created ON items(status, created_at DESC);
CREATE INDEX CONCURRENTLY idx_search_vector ON items USING GIN(search_vector);

-- Analyze tables
ANALYZE items;
ANALYZE profiles;
ANALYZE orders;
```

### 3. Redis Configuration

```redis
# redis.conf production settings
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## 💾 Backup & Recovery

### 1. Automated Backups

```bash
# Set up cron job for automated backups
crontab -e

# Add backup jobs
0 2 * * * /path/to/backup-recovery.sh backup
0 3 * * 0 /path/to/backup-recovery.sh cleanup
```

### 2. Database Backups

```bash
# Manual backup
./scripts/backup-recovery.sh backup

# Restore from backup
./scripts/backup-recovery.sh restore 20240115
```

### 3. File Backups

Configure AWS S3 Cross-Region Replication or similar for file backups.

## 🔄 CI/CD Pipeline

### 1. GitHub Actions Setup

The CI/CD pipeline is already configured in `.github/workflows/ci-cd.yml`.

#### Required Secrets:
```bash
# GitHub repository secrets
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN  
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
SLACK_WEBHOOK
```

### 2. Deployment Environments

- **Development**: Auto-deploy from `develop` branch
- **Staging**: Auto-deploy from `staging` branch
- **Production**: Auto-deploy from `main` branch with approval

### 3. Release Process

```bash
# Create release branch
git checkout -b release/v1.1.0

# Update version
npm version minor

# Merge to main
git checkout main
git merge release/v1.1.0

# Tag release
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main --tags
```

## 🩺 Health Checks & Monitoring

### 1. Health Check Endpoints

- **Basic**: `GET /api/health`
- **Detailed**: `GET /api/health?detailed=true`
- **Metrics**: `GET /api/monitoring/metrics`

### 2. Monitoring Dashboards

Access monitoring dashboards:
- **Grafana**: http://your-domain:3001
- **Prometheus**: http://your-domain:9090
- **Sentry**: https://sentry.io/your-org/bazari

### 3. Alerting Rules

Configure alerts for:
- High error rates (>5%)
- Slow response times (>2s)
- High memory usage (>80%)
- Database connection issues
- High fraud alert rates

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check Supabase connection
curl -I https://your-project.supabase.co/rest/v1/

# Check database logs
supabase logs --type database
```

#### 2. Memory Issues
```bash
# Monitor memory usage
docker stats bazari-app

# Check Node.js memory
node --max-old-space-size=4096 server.js
```

#### 3. SSL Certificate Issues
```bash
# Check certificate status
openssl s_client -connect bazari.com:443 -servername bazari.com

# Renew Let's Encrypt certificate
certbot renew
```

#### 4. Performance Issues
```bash
# Enable Node.js profiling
node --prof server.js

# Analyze profile
node --prof-process isolate-*.log > processed.txt
```

### Logs Location

- **Application logs**: `/var/log/bazari/`
- **Nginx logs**: `/var/log/nginx/`
- **Docker logs**: `docker logs bazari-app`

### Performance Tuning

#### Node.js Optimization
```bash
# Production environment variables
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=4096"
UV_THREADPOOL_SIZE=16
```

#### Database Optimization
```sql
-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks

1. **Daily**: Monitor error rates and performance
2. **Weekly**: Review security alerts and backups
3. **Monthly**: Update dependencies and review costs
4. **Quarterly**: Security audit and performance review

### Emergency Procedures

1. **Database Issues**: Use read replicas, restore from backup
2. **High Traffic**: Enable auto-scaling, activate CDN
3. **Security Incident**: Follow incident response plan
4. **Data Loss**: Restore from most recent backup

### Contact Information

- **Technical Lead**: tech@bazari.com
- **DevOps**: devops@bazari.com
- **Security**: security@bazari.com
- **On-call**: +1-XXX-XXX-XXXX

---

## 🎉 Deployment Checklist

Before going live, ensure:

- [ ] All environment variables are set
- [ ] Database migrations are applied
- [ ] SSL certificates are configured
- [ ] Monitoring is active
- [ ] Backups are configured
- [ ] Security headers are enabled
- [ ] CDN is configured
- [ ] Error tracking is working
- [ ] Performance monitoring is active
- [ ] Health checks are passing
- [ ] Load testing is completed
- [ ] Documentation is updated

**🚀 Your Bazari Marketplace is ready for production!**