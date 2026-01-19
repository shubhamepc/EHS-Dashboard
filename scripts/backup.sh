#!/bin/bash

# SQLite Database Backup Script
# Add to crontab: 0 2 * * * /path/to/backup.sh

# Configuration
BACKUP_DIR="/var/backups/ehs-system"
DB_PATH="/var/www/ehs-system/backend/ehs.sqlite"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ehs_backup_${DATE}.sqlite"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Starting backup at $(date)"
cp "$DB_PATH" "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"
echo "Backup created: $BACKUP_DIR/$BACKUP_FILE.gz"

# Remove old backups
find "$BACKUP_DIR" -name "ehs_backup_*.sqlite.gz" -mtime +$RETENTION_DAYS -delete
echo "Old backups removed (older than $RETENTION_DAYS days)"

# Verify backup integrity
if [ -f "$BACKUP_DIR/$BACKUP_FILE.gz" ]; then
    SIZE=$(stat -f%z "$BACKUP_DIR/$BACKUP_FILE.gz" 2>/dev/null || stat -c%s "$BACKUP_DIR/$BACKUP_FILE.gz")
    if [ "$SIZE" -gt 1000 ]; then
        echo "Backup successful: $SIZE bytes"
        
        # Optional: Upload to cloud storage (uncomment and configure)
        # aws s3 cp "$BACKUP_DIR/$BACKUP_FILE.gz" s3://your-bucket/ehs-backups/
        # rclone copy "$BACKUP_DIR/$BACKUP_FILE.gz" remote:ehs-backups/
        
        exit 0
    else
        echo "ERROR: Backup file too small, possible corruption"
        exit 1
    fi
else
    echo "ERROR: Backup file not created"
    exit 1
fi
