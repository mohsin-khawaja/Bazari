#!/bin/bash

# 🗄️ Backup and Recovery System for Bazari Marketplace
# This script handles database backups, file backups, and disaster recovery

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
LOG_FILE="${LOG_FILE:-$BACKUP_DIR/backup.log}"

# Environment variables
SUPABASE_PROJECT_ID="${SUPABASE_PROJECT_ID:-}"
SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}"
AWS_S3_BUCKET="${AWS_S3_BUCKET:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() {
    log "INFO" "${BLUE}$*${NC}"
}

log_warn() {
    log "WARN" "${YELLOW}$*${NC}"
}

log_error() {
    log "ERROR" "${RED}$*${NC}"
}

log_success() {
    log "SUCCESS" "${GREEN}$*${NC}"
}

# Create backup directory if it doesn't exist
create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$BACKUP_DIR/database"
    mkdir -p "$BACKUP_DIR/files"
    mkdir -p "$BACKUP_DIR/config"
}

# Database backup functions
backup_supabase_database() {
    log_info "Starting Supabase database backup..."
    
    if [[ -z "$SUPABASE_PROJECT_ID" || -z "$SUPABASE_ACCESS_TOKEN" ]]; then
        log_error "SUPABASE_PROJECT_ID and SUPABASE_ACCESS_TOKEN must be set"
        return 1
    fi
    
    local backup_file="$BACKUP_DIR/database/supabase_$(date +%Y%m%d_%H%M%S).sql"
    
    # Use Supabase CLI to create backup
    if command -v supabase &> /dev/null; then
        supabase db dump \
            --project-id "$SUPABASE_PROJECT_ID" \
            --file "$backup_file" \
            --verbose
        
        if [[ -f "$backup_file" ]]; then
            log_success "Database backup created: $backup_file"
            
            # Compress the backup
            gzip "$backup_file"
            log_success "Database backup compressed: ${backup_file}.gz"
            
            return 0
        else
            log_error "Database backup failed"
            return 1
        fi
    else
        log_error "Supabase CLI not found. Please install it first."
        return 1
    fi
}

# File backup functions
backup_user_uploads() {
    log_info "Starting user uploads backup..."
    
    local backup_file="$BACKUP_DIR/files/uploads_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Backup from Supabase Storage (if using local development)
    if [[ -d "$PROJECT_ROOT/storage" ]]; then
        tar -czf "$backup_file" -C "$PROJECT_ROOT" storage/
        log_success "User uploads backup created: $backup_file"
    else
        log_warn "No local storage directory found. Assuming cloud storage is used."
    fi
}

backup_application_files() {
    log_info "Starting application files backup..."
    
    local backup_file="$BACKUP_DIR/config/app_config_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Backup important configuration files
    tar -czf "$backup_file" \
        --exclude="node_modules" \
        --exclude=".next" \
        --exclude=".git" \
        --exclude="backups" \
        -C "$PROJECT_ROOT" \
        . 2>/dev/null || true
    
    log_success "Application files backup created: $backup_file"
}

# Cloud backup functions
upload_to_s3() {
    local file_path=$1
    local s3_key=$2
    
    if [[ -z "$AWS_S3_BUCKET" ]]; then
        log_warn "AWS_S3_BUCKET not set. Skipping S3 upload."
        return 0
    fi
    
    log_info "Uploading $file_path to S3..."
    
    if command -v aws &> /dev/null; then
        aws s3 cp "$file_path" "s3://$AWS_S3_BUCKET/$s3_key" \
            --region "$AWS_REGION" \
            --storage-class STANDARD_IA
        
        log_success "File uploaded to S3: s3://$AWS_S3_BUCKET/$s3_key"
    else
        log_error "AWS CLI not found. Cannot upload to S3."
        return 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    
    # Keep last 7 days of backups locally
    find "$BACKUP_DIR" -type f -name "*.gz" -mtime +7 -delete
    find "$BACKUP_DIR" -type f -name "*.sql" -mtime +7 -delete
    find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +7 -delete
    
    log_success "Old backups cleaned up"
}

# Restore functions
restore_database() {
    local backup_file=$1
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    log_info "Restoring database from: $backup_file"
    
    # Decompress if needed
    if [[ "$backup_file" == *.gz ]]; then
        local temp_file="${backup_file%.gz}"
        gunzip -c "$backup_file" > "$temp_file"
        backup_file="$temp_file"
    fi
    
    # Restore using Supabase CLI
    if command -v supabase &> /dev/null; then
        supabase db reset --project-id "$SUPABASE_PROJECT_ID"
        psql -h "db.${SUPABASE_PROJECT_ID}.supabase.co" \
             -p 5432 \
             -U postgres \
             -d postgres \
             -f "$backup_file"
        
        log_success "Database restored successfully"
    else
        log_error "Supabase CLI not found"
        return 1
    fi
}

# Health check function
health_check() {
    log_info "Performing health check..."
    
    # Check if database is accessible
    if command -v curl &> /dev/null; then
        if curl -f -s "${NEXT_PUBLIC_APP_URL:-http://localhost:3000}/api/health" > /dev/null; then
            log_success "Application health check passed"
        else
            log_error "Application health check failed"
            return 1
        fi
    fi
    
    # Check backup directory
    if [[ -d "$BACKUP_DIR" ]]; then
        local backup_count=$(find "$BACKUP_DIR" -type f -name "*.gz" | wc -l)
        log_info "Found $backup_count backup files"
    fi
}

# Main backup function
perform_full_backup() {
    log_info "Starting full backup process..."
    
    create_backup_dir
    
    # Perform backups
    backup_supabase_database
    backup_user_uploads
    backup_application_files
    
    # Upload to cloud storage
    for file in "$BACKUP_DIR"/**/*.gz; do
        if [[ -f "$file" ]]; then
            local s3_key="bazari-backups/$(date +%Y/%m/%d)/$(basename "$file")"
            upload_to_s3 "$file" "$s3_key"
        fi
    done
    
    # Cleanup old backups
    cleanup_old_backups
    
    log_success "Full backup completed successfully"
}

# Disaster recovery function
disaster_recovery() {
    local backup_date=$1
    
    if [[ -z "$backup_date" ]]; then
        log_error "Please specify backup date (YYYYMMDD)"
        return 1
    fi
    
    log_info "Starting disaster recovery for date: $backup_date"
    
    # Find backup files
    local db_backup=$(find "$BACKUP_DIR/database" -name "*${backup_date}*.sql.gz" | head -1)
    
    if [[ -z "$db_backup" ]]; then
        log_error "No database backup found for date: $backup_date"
        return 1
    fi
    
    # Restore database
    restore_database "$db_backup"
    
    # Perform health check
    health_check
    
    log_success "Disaster recovery completed"
}

# Monitoring and alerting
send_alert() {
    local message=$1
    local severity=${2:-"info"}
    
    # Send alert via webhook (Slack, Discord, etc.)
    if [[ -n "${WEBHOOK_URL:-}" ]]; then
        curl -X POST "$WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{\"text\": \"🚨 Bazari Backup Alert [$severity]: $message\"}" \
            2>/dev/null || true
    fi
    
    # Log the alert
    case $severity in
        "error")
            log_error "ALERT: $message"
            ;;
        "warning")
            log_warn "ALERT: $message"
            ;;
        *)
            log_info "ALERT: $message"
            ;;
    esac
}

# Command line interface
case "${1:-}" in
    "backup")
        perform_full_backup
        ;;
    "restore")
        disaster_recovery "${2:-}"
        ;;
    "health")
        health_check
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    *)
        echo "Usage: $0 {backup|restore <date>|health|cleanup}"
        echo ""
        echo "Commands:"
        echo "  backup       - Perform full backup"
        echo "  restore      - Restore from backup (requires date: YYYYMMDD)"
        echo "  health       - Perform health check"
        echo "  cleanup      - Clean up old backups"
        echo ""
        echo "Environment variables:"
        echo "  SUPABASE_PROJECT_ID     - Supabase project ID"
        echo "  SUPABASE_ACCESS_TOKEN   - Supabase access token"
        echo "  AWS_S3_BUCKET          - S3 bucket for backup storage"
        echo "  WEBHOOK_URL            - Webhook URL for alerts"
        exit 1
        ;;
esac