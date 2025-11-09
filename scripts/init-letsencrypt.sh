#!/bin/bash

# Initialize Let's Encrypt SSL certificates for Meetify
# Usage: ./scripts/init-letsencrypt.sh yourdomain.com your-email@example.com

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <domain> <email>"
    echo "Example: $0 meetify.com admin@meetify.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed"
    exit 1
fi

echo "Initializing Let's Encrypt for $DOMAIN..."

# Create directories
mkdir -p certbot/conf
mkdir -p certbot/www

# Download recommended TLS parameters
echo "Downloading recommended TLS parameters..."
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > certbot/conf/options-ssl-nginx.conf
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > certbot/conf/ssl-dhparams.pem

# Create dummy certificate
echo "Creating dummy certificate for $DOMAIN..."
mkdir -p certbot/conf/live/$DOMAIN
docker-compose -f docker-compose.prod.yml run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
    -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
    -subj '/CN=localhost'" certbot

# Start nginx with dummy certificate
echo "Starting nginx..."
docker-compose -f docker-compose.prod.yml up -d nginx

# Remove dummy certificate
echo "Removing dummy certificate..."
docker-compose -f docker-compose.prod.yml run --rm --entrypoint "\
  rm -rf /etc/letsencrypt/live/$DOMAIN && \
  rm -rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

# Request real certificate
echo "Requesting Let's Encrypt certificate for $DOMAIN..."
docker-compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN" certbot

# Reload nginx
echo "Reloading nginx..."
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "✅ SSL certificate successfully installed!"
echo "Your site is now available at https://$DOMAIN"
