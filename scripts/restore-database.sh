#!/bin/bash

# Restore PostgreSQL database from backup
# Usage: ./scripts/restore-database.sh <backup_file> [container_name]

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <backup_file> [container_name]"
    echo "Example: $0 ./backups/meetify_backup_20240109_120000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1
CONTAINER_NAME=${2:-meetify-db-prod}

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Error: Container $CONTAINER_NAME is not running"
    exit 1
fi

echo "⚠️  WARNING: This will overwrite the current database!"
echo "Container: $CONTAINER_NAME"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Create temporary directory
TEMP_DIR=$(mktemp -d)
TEMP_FILE="$TEMP_DIR/restore.sql"

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup..."
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
else
    cp "$BACKUP_FILE" "$TEMP_FILE"
fi

# Stop dependent services
echo "Stopping dependent services..."
docker-compose -f docker-compose.prod.yml stop backend frontend

# Drop and recreate database
echo "Recreating database..."
docker exec -t "$CONTAINER_NAME" psql -U postgres -c "DROP DATABASE IF EXISTS meetify;"
docker exec -t "$CONTAINER_NAME" psql -U postgres -c "CREATE DATABASE meetify;"

# Restore backup
echo "Restoring backup..."
cat "$TEMP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U postgres -d meetify

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"

    # Restart services
    echo "Restarting services..."
    docker-compose -f docker-compose.prod.yml start backend frontend

    echo "✅ Restore complete!"
else
    echo "❌ Restore failed!"

    # Try to restart services anyway
    echo "Attempting to restart services..."
    docker-compose -f docker-compose.prod.yml start backend frontend

    exit 1
fi

# Cleanup
rm -rf "$TEMP_DIR"
