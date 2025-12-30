#!/bin/bash

# 1. Update System
echo "🔄 Atualizando sistema..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw

# 2. Install Node.js 20
echo "🟢 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 (Process Manager)
echo "🚀 Instalando PM2..."
sudo npm install -g pm2

# 4. Allow Ports (Firewall)
echo "🛡️ Configurando Firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Ambiente pronto! Agora vamos clonar o site."
