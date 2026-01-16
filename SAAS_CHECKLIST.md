# 🚀 VaporFume SaaS - Checklist de Implementação

## Fase 1: Autenticação (Prioridade Alta)
- [ ] **NextAuth.js** - Sistema de login real
- [ ] Tabela `users` com hash de senha
- [ ] Relacionamento `user` → `tenant`
- [ ] Roles: admin, vendedor, viewer
- [ ] Recuperação de senha por email

## Fase 2: Isolamento de Tenant (Crítico)
- [ ] Middleware que detecta tenant por subdomínio
- [ ] Todas as queries filtradas por `tenantId`
- [ ] Garantir que tenant A nunca veja dados do tenant B

## Fase 3: Onboarding
- [ ] Página de cadastro para novos clientes
- [ ] Setup wizard (nome, logo, primeira categoria)
- [ ] Subdomínio automático (`[slug].vaporfume.shop`)

## Fase 4: Billing e Monetização
- [ ] Integração Stripe ou Asaas
- [ ] Planos: Free, Básico (R$49), Pro (R$99)
- [ ] Limites por plano (produtos, pedidos/mês)
- [ ] Página de assinatura e upgrade

## Fase 5: Super Admin
- [ ] Dashboard com métricas globais
- [ ] Lista de todos os tenants
- [ ] Gerenciar assinaturas
- [ ] Suspender/ativar lojas

## Fase 6: Melhorias
- [ ] Domínio customizado por tenant
- [ ] Temas personalizáveis
- [ ] API pública para integrações

---

## 📊 Estimativa

| Fase | Tempo Estimado |
|------|---------------|
| Autenticação | 1 semana |
| Isolamento Tenant | 1 semana |
| Onboarding | 3-5 dias |
| Billing | 1-2 semanas |
| Super Admin | 1 semana |

**Total: ~5-6 semanas** para MVP SaaS

---

## 🛠️ Stack Sugerida

- **Auth:** NextAuth.js
- **DB:** Drizzle ORM + SQLite (atual) → PostgreSQL (futuro)
- **Payments:** Stripe ou Asaas
- **Hosting:** VPS atual para prod, Vercel para staging
