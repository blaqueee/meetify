# Meetify Scripts

Utility scripts for managing Meetify deployment.

## Prerequisites

- Docker and Docker Compose installed
- Bash shell (Linux/macOS) or Git Bash (Windows)
- For SSL scripts: publicly accessible domain

## Scripts Overview

### 🔐 init-letsencrypt.sh

Initialize SSL certificates using Let's Encrypt.

**Usage:**
```bash
chmod +x scripts/init-letsencrypt.sh
./scripts/init-letsencrypt.sh yourdomain.com your-email@example.com
```

**What it does:**
1. Creates certbot directories
2. Downloads TLS parameters
3. Generates dummy certificate
4. Starts nginx
5. Requests real Let's Encrypt certificate
6. Reloads nginx with real certificate

**Requirements:**
- Domain must point to your server's IP
- Ports 80 and 443 must be accessible

### 💾 backup-database.sh

Create a backup of the PostgreSQL database.

**Usage:**
```bash
chmod +x scripts/backup-database.sh

# Backup production database
./scripts/backup-database.sh

# Backup specific container
./scripts/backup-database.sh meetify-db-dev
```

**Features:**
- Creates timestamped backups
- Compresses backups with gzip
- Keeps last 7 backups automatically
- Saves to `./backups/` directory

**Backup naming:**
```
meetify_backup_YYYYMMDD_HHMMSS.sql.gz
```

### 📥 restore-database.sh

Restore database from a backup file.

**Usage:**
```bash
chmod +x scripts/restore-database.sh

# Restore from backup
./scripts/restore-database.sh ./backups/meetify_backup_20240109_120000.sql.gz

# Restore to specific container
./scripts/restore-database.sh ./backups/meetify_backup_20240109_120000.sql.gz meetify-db-dev
```

**⚠️ Warning:**
- This will OVERWRITE the current database
- Requires confirmation before proceeding
- Temporarily stops backend and frontend services

**Process:**
1. Stops dependent services
2. Drops existing database
3. Creates new database
4. Restores from backup
5. Restarts services

## Example Workflows

### Initial Production Setup

```bash
# 1. Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# 2. Update nginx.conf with your domain
nano nginx.conf

# 3. Start services (without SSL first)
docker-compose -f docker-compose.prod.yml up -d db backend frontend

# 4. Initialize SSL
./scripts/init-letsencrypt.sh yourdomain.com admin@yourdomain.com

# 5. Start nginx with SSL
docker-compose -f docker-compose.prod.yml up -d nginx
```

### Regular Backup Schedule

Add to crontab for automated backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/meetify && ./scripts/backup-database.sh >> /var/log/meetify-backup.log 2>&1
```

### Disaster Recovery

```bash
# 1. Stop services
docker-compose -f docker-compose.prod.yml down

# 2. Start only database
docker-compose -f docker-compose.prod.yml up -d db

# 3. Restore from backup
./scripts/restore-database.sh ./backups/meetify_backup_YYYYMMDD_HHMMSS.sql.gz

# 4. Start all services
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### init-letsencrypt.sh fails

**Problem:** "Error: Container not found"
**Solution:** Ensure docker-compose.prod.yml is in the project root

**Problem:** "Challenge failed"
**Solution:**
- Verify domain DNS points to your server
- Check firewall allows ports 80 and 443
- Ensure nginx is running: `docker ps | grep nginx`

### backup-database.sh fails

**Problem:** "Container is not running"
**Solution:** Start the database container:
```bash
docker-compose -f docker-compose.prod.yml up -d db
```

**Problem:** Permission denied
**Solution:** Make script executable:
```bash
chmod +x scripts/backup-database.sh
```

### restore-database.sh fails

**Problem:** "Backup file not found"
**Solution:** Check the file path and ensure it exists:
```bash
ls -lh ./backups/
```

**Problem:** "Database connection failed"
**Solution:** Verify database is running:
```bash
docker exec -it meetify-db-prod psql -U postgres -c "SELECT 1"
```

## Windows Users

These scripts are designed for bash. On Windows, use:

1. **Git Bash** (recommended)
2. **WSL (Windows Subsystem for Linux)**
3. **Docker Desktop's integrated terminal**

Example in Git Bash:
```bash
# Navigate to project
cd /c/Coding/pet/meetify

# Run script
./scripts/backup-database.sh
```

## Security Notes

1. **Never commit .env files** - contains sensitive passwords
2. **Restrict script permissions:**
   ```bash
   chmod 700 scripts/*.sh
   ```
3. **Secure backup directory:**
   ```bash
   chmod 700 backups
   ```
4. **Keep backups encrypted** for production:
   ```bash
   gpg -c backups/meetify_backup_YYYYMMDD_HHMMSS.sql.gz
   ```

## Additional Resources

- [DOCKER.md](../DOCKER.md) - Complete Docker documentation
- [DOCKER_QUICKSTART.md](../DOCKER_QUICKSTART.md) - Quick start guide
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
