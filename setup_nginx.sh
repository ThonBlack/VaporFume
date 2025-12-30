#!/bin/bash
# Configure Nginx to serve from /var/www/vaporfume-uploads
cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80;
    server_name _;

    client_max_body_size 50M;

    # Serve uploads from the public accessible folder (Permissions: www-data:www-data 777)
    location /uploads/ {
        alias /var/www/vaporfume-uploads/;
        access_log off;
        expires max;
    }

    # Proxy everything else to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Ensure directory exists and has permissions
mkdir -p /var/www/vaporfume-uploads
chown -R www-data:www-data /var/www/vaporfume-uploads
chmod -R 777 /var/www/vaporfume-uploads

# Restart Nginx
systemctl restart nginx
echo "Nginx Re-Configured with /var/www/vaporfume-uploads!"
