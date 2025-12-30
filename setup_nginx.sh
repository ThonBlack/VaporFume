#!/bin/bash
# Install Nginx
apt-get update
apt-get install -y nginx

# Configure Nginx
cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80;
    server_name _;

    client_max_body_size 50M;

    # Serve uploads directly from disk
    location /uploads/ {
        alias /root/VaporFume/public/uploads/;
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

# Restart Nginx
systemctl restart nginx
echo "Nginx Installed and Configured!"
