#!/bin/bash

# Backup PostgreSQL database
# Usage: ./scripts/backup-database.sh [container_name]

CONTAINER_NAME=${1:-meetify-db-prod}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="meetify_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."
echo "Container: $CONTAINER_NAME"
echo "Backup file: $BACKUP_FILE"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Error: Container $CONTAINER_NAME is not running"
    exit 1
fi

# Create backup
docker exec -t "$CONTAINER_NAME" pg_dump -U postgres meetify > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    # Compress backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo "✅ Backup created successfully: $BACKUP_DIR/${BACKUP_FILE}.gz"

    # Show backup size
    SIZE=$(du -h "$BACKUP_DIR/${BACKUP_FILE}.gz" | cut -f1)
    echo "Backup size: $SIZE"

    # Keep only last 7 backups
    echo "Cleaning old backups (keeping last 7)..."
    ls -t "$BACKUP_DIR"/meetify_backup_*.sql.gz | tail -n +8 | xargs -r rm

    echo "✅ Backup complete!"
else
    echo "❌ Backup failed!"
    exit 1
fi
