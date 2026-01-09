#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}>>> Iniciando Setup do VaporFume na VPS...${NC}"

# 1. Instalar Docker e Docker Compose (se não estiver instalado)
if ! command -v docker &> /dev/null
then
    echo "Docker não encontrado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo "Docker instalado com sucesso."
else
    echo -e "${GREEN}✓ Docker já instalado.${NC}"
fi

# 2. Criar diretórios necessários
echo "Configurando diretórios..."
mkdir -p public/uploads

# 3. Ajustar permissões (importante para o Docker escrever no volume)
# O usuário 'node' dentro do container Alpine geralmente te ID 1001 ou 1000.
# Ajustando para permissão genérica para evitar erros de permissão no volume bindado.
chmod -R 777 public/uploads
echo -e "${GREEN}✓ Diretórios configurados.${NC}"

# 4. Build e Start
echo "Subindo containers..."
docker compose up -d --build

echo -e "${GREEN}>>> Setup concluído! A aplicação deve estar rodando na porta 3000.${NC}"
echo "Verifique os logs com: docker compose logs -f"
