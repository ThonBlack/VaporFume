# 📋 VaporFume - Relatório de Handoff

> [!CAUTION]
> ## ⚠️ AVISO IMPORTANTE PARA O AGENTE
> **Este arquivo contém credenciais sensíveis (VPS, banco de dados, etc.)**
> 
> 1. **LEIA** todo o conteúdo deste arquivo
> 2. **GUARDE** as credenciais e informações importantes
> 3. **EXCLUA** este arquivo após salvar os dados (por segurança)
> 4. **NÃO COMMIT** este arquivo no Git com as credenciais expostas

**Data:** 13/01/2026  
**Projeto:** VaporFume - Loja de Vapes  
**Repositório:** https://github.com/ThonBlack/VaporFume  
**Produção:** https://vaporfume.shop

---

## 🔐 Credenciais

### VPS (Produção)
| Campo | Valor |
|-------|-------|
| IP | `72.61.135.4` |
| Usuário | `root` |
| Senha | `AAaa11@@00Senhagit` |
| Caminho | `/root/VaporFume` |
| DB | `/root/VaporFume/sqlite.db` |
| Uploads | `/var/www/vaporfume-uploads` |

### GitHub
| Campo | Valor |
|-------|-------|
| Repo | `ThonBlack/VaporFume` |
| Branch | `main` |

### PM2 Processos
| Nome | Comando | Status |
|------|---------|--------|
| vapor-fume | `npm start` | online |
| whatsapp-worker | `node src/workers/whatsapp.js` | online |

---

## ✅ Funcionalidades Implementadas

### Fase 1: Fundação SaaS
- [x] **Multi-tenancy** - Tabela `tenants`, `tenantId` em products/orders/categories
- [x] **Customização Visual** - Logo, cores (primary/secondary/background)
- [x] **Templates WhatsApp** - Mensagens editáveis (recovery, winback, restock)

### Fase 2: Expansão SaaS
- [x] **Sistema de Cupons** - CRUD completo, validação, tipos (% e fixo)
- [x] **Dashboard Melhorado** - Ticket médio, Top 5 produtos, Top 5 clientes
- [x] **Gráfico de Vendas** - Últimos 7 dias

### Fase 3: API e Administração
- [x] **API Pública** - `GET /api/v1/products`, `GET /api/v1/orders`
- [x] **Autenticação API** - Header `X-API-KEY`
- [x] **Gestão de API Keys** - `/admin/api-keys`
- [x] **Painel Super-Admin** - `/super-admin` com métricas globais

### PDV (Ponto de Venda)
- [x] **Criar Cliente** - Modal para adicionar novo cliente
- [x] **Campo de Endereço** - Integrado com busca de cliente
- [x] **Checkbox Delivery** - "Enviar para Zap Entregas"
- [x] **Status Automático** - `paid` para pagos, `pending` para fiado

### Integrações
- [x] **Zap Entregas** - Botão "Enviar e Imprimir" na página do pedido
- [x] **WhatsApp Worker** - Recuperação de carrinho, winback automático
- [x] **Cron Jobs** - Scheduler inteligente (não roda domingo)

---

## ⚠️ Pendências

### Urgente (Deploy Pendente)
- [ ] **Atualizar VPS** - O código local está mais recente que a produção
  ```bash
  ssh root@72.61.135.4
  cd ~/VaporFume && git pull && npm run build && pm2 restart vapor-fume
  ```

### Backlog
- [ ] **Cupons no Checkout** - Validação no front já existe, precisa testar fluxo completo
- [ ] **Webhooks** - Tabela criada mas não implementado ainda
- [ ] **Subdomínios por Tenant** - Atual usa slug na rota, não subdomínio

---

## 🗂️ Estrutura do Projeto

```
VaporFume/
├── src/
│   ├── app/
│   │   ├── actions/          # Server Actions
│   │   ├── admin/            # Páginas do Admin
│   │   ├── api/              # API Routes
│   │   └── super-admin/      # Painel Super Admin
│   ├── components/           # Componentes React
│   ├── db/schema.js          # Schema Drizzle ORM
│   ├── lib/                  # Utilitários (db, whatsapp, mercadopago)
│   └── workers/              # WhatsApp Worker
├── scripts/                  # Migrações
└── sqlite.db                 # Banco de dados
```

---

## 🛠️ Comandos Úteis

### Desenvolvimento Local
```bash
npm run dev           # Inicia dev server
npm run build         # Build produção
```

### Produção (VPS)
```bash
pm2 list              # Ver processos
pm2 logs vapor-fume   # Ver logs
pm2 restart all       # Reiniciar tudo
```

### Migrações
```bash
node scripts/migrate_tenants.js    # Multi-tenancy
node scripts/migrate_coupons.js    # Cupons
node scripts/migrate_api.js        # API Keys + Webhooks
```

---

## 📊 Tabelas do Banco

| Tabela | Descrição |
|--------|-----------|
| `tenants` | Lojas/tenants do SaaS |
| `products` | Produtos com tenantId |
| `variants` | Variantes (sabores) |
| `orders` | Pedidos |
| `order_items` | Itens do pedido |
| `customers` | Clientes |
| `coupons` | Cupons de desconto |
| `api_keys` | Chaves de API |
| `message_queue` | Fila WhatsApp |

---

## 🔗 URLs Importantes

| Página | URL |
|--------|-----|
| Loja | https://vaporfume.shop |
| Admin | https://vaporfume.shop/admin |
| PDV | https://vaporfume.shop/admin/pos |
| Cupons | https://vaporfume.shop/admin/coupons |
| API Keys | https://vaporfume.shop/admin/api-keys |
| Super Admin | https://vaporfume.shop/super-admin |

---

## 📝 Notas Importantes

1. **Backup antes de deploy** - Sempre fazer backup do `sqlite.db`
2. **WhatsApp Credentials** - Pasta `wa_auth_credentials/` contém sessão ativa
3. **Não rodar git clean** - Remove arquivos importantes como WAL do SQLite
4. **Migrações são idempotentes** - Podem ser rodadas múltiplas vezes

---

## 🆘 Troubleshooting

### Erro "no such column: tenant_id"
```bash
node scripts/migrate_tenants.js
```

### PM2 não inicia
```bash
pm2 logs vapor-fume --lines 50
```
