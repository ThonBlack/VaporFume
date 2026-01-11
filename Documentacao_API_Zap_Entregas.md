# Documentação da API de Integração - Zap Entregas

## Visão Geral

Esta API permite que sistemas PDV (Ponto de Venda) criem entregas automaticamente no Zap Entregas. Quando uma entrega é criada via API, ela aparece instantaneamente para os motoboys disponíveis.

---

## Ambiente

| Ambiente | Base URL |
|----------|----------|
| **Produção** | `https://zapentregas.duckdns.org/api/integration` |

---

## Autenticação

Todas as requisições devem incluir o header `X-API-KEY` com sua chave de API.

```
X-API-KEY: apikey_{id_lojista}_{telefone}
```

**Exemplo:**
```
X-API-KEY: apikey_1_11999999999
```

> ⚠️ Entre em contato com o administrador para obter sua API Key.

---

## Endpoints

### 1. Criar Entrega

**`POST /api/integration/delivery`**

Cria uma nova entrega pendente no sistema.

#### Headers

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `X-API-KEY` | string | ✅ | Sua chave de API |
| `Content-Type` | string | ✅ | `application/json` |

#### Body (JSON)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `address` | string | ✅ | Endereço completo da entrega |
| `customerName` | string | ❌ | Nome do cliente |
| `customerPhone` | string | ❌ | Telefone do cliente (para enviar link de rastreio) |
| `value` | number | ❌ | Valor do pedido (R$) |
| `fee` | number | ❌ | Taxa de entrega (R$) |
| `observation` | string | ❌ | Observações para o motoboy |

#### Exemplo de Requisição

```json
POST /api/integration/delivery
X-API-KEY: apikey_1_11999999999
Content-Type: application/json

{
  "customerName": "João Silva",
  "customerPhone": "11987654321",
  "address": "Rua das Flores, 123 - Centro - São Paulo/SP",
  "value": 89.90,
  "fee": 8.00,
  "observation": "Apartamento 42, interfone não funciona - ligar no celular"
}
```

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "deliveryId": 123,
  "trackingUrl": "https://zapentregas.duckdns.org/tracking/123",
  "message": "Entrega criada com sucesso! Os motoboys serão notificados."
}
```

#### Erros Possíveis

| Código | Erro | Descrição |
|--------|------|-----------|
| 400 | `Endereço é obrigatório` | O campo `address` não foi enviado |
| 401 | `API Key não fornecida` | Header X-API-KEY ausente |
| 401 | `API Key inválida` | Formato da chave incorreto |
| 401 | `Lojista não encontrado` | Chave não corresponde a um lojista válido |
| 500 | `Erro interno do servidor` | Erro inesperado |

---

### 2. Consultar Status da Entrega

**`GET /api/integration/delivery?id={deliveryId}`**

Consulta o status atual de uma entrega.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | number | ✅ | ID da entrega retornado na criação |

#### Exemplo de Requisição

```
GET /api/integration/delivery?id=123
X-API-KEY: apikey_1_11999999999
```

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "delivery": {
    "id": 123,
    "status": "delivered",
    "customerName": "João Silva",
    "address": "Rua das Flores, 123 - Centro - São Paulo/SP",
    "motoboy": {
      "name": "Carlos Motoboy",
      "phone": "11998887777"
    },
    "createdAt": "2024-01-10T14:30:00.000Z",
    "updatedAt": "2024-01-10T15:00:00.000Z"
  }
}
```

#### Status Possíveis

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando motoboy aceitar |
| `assigned` | Motoboy a caminho para retirar |
| `picked_up` | Pedido retirado, em rota de entrega |
| `delivered` | Entregue ao cliente |
| `canceled` | Entrega cancelada |

---

## Exemplos de Implementação

### PHP

```php
<?php
function criarEntrega($dados) {
    $apiKey = "apikey_1_11999999999";
    $url = "https://zapentregas.duckdns.org/api/integration/delivery";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "X-API-KEY: $apiKey"
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Uso:
$entrega = criarEntrega([
    "customerName" => "João Silva",
    "customerPhone" => "11987654321",
    "address" => "Rua das Flores, 123",
    "value" => 89.90,
    "fee" => 8.00
]);

echo "Entrega criada: #" . $entrega["deliveryId"];
echo "Rastreio: " . $entrega["trackingUrl"];
?>
```

### JavaScript / Node.js

```javascript
async function criarEntrega(dados) {
    const response = await fetch("https://zapentregas.duckdns.org/api/integration/delivery", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": "apikey_1_11999999999"
        },
        body: JSON.stringify(dados)
    });
    
    return await response.json();
}

// Uso:
const entrega = await criarEntrega({
    customerName: "João Silva",
    customerPhone: "11987654321",
    address: "Rua das Flores, 123",
    value: 89.90,
    fee: 8.00
});

console.log("Entrega:", entrega.deliveryId);
console.log("Rastreio:", entrega.trackingUrl);
```

### Python

```python
import requests

def criar_entrega(dados):
    url = "https://zapentregas.duckdns.org/api/integration/delivery"
    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": "apikey_1_11999999999"
    }
    
    response = requests.post(url, json=dados, headers=headers)
    return response.json()

# Uso:
entrega = criar_entrega({
    "customerName": "João Silva",
    "customerPhone": "11987654321",
    "address": "Rua das Flores, 123",
    "value": 89.90,
    "fee": 8.00
})

print(f"Entrega: #{entrega['deliveryId']}")
print(f"Rastreio: {entrega['trackingUrl']}")
```

### C# / .NET

```csharp
using System.Net.Http;
using System.Text;
using System.Text.Json;

public async Task<dynamic> CriarEntrega(object dados)
{
    var client = new HttpClient();
    client.DefaultRequestHeaders.Add("X-API-KEY", "apikey_1_11999999999");
    
    var json = JsonSerializer.Serialize(dados);
    var content = new StringContent(json, Encoding.UTF8, "application/json");
    
    var response = await client.PostAsync(
        "https://zapentregas.duckdns.org/api/integration/delivery", 
        content
    );
    
    var responseString = await response.Content.ReadAsStringAsync();
    return JsonSerializer.Deserialize<dynamic>(responseString);
}
```

---

## Fluxo de Integração Recomendado

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      PDV        │     │   Zap Entregas  │     │    Motoboys     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  POST /delivery       │                       │
         │ ───────────────────>  │                       │
         │                       │                       │
         │  { deliveryId: 123 }  │                       │
         │ <───────────────────  │                       │
         │                       │  🔔 Notificação Push  │
         │                       │ ───────────────────>  │
         │                       │                       │
         │                       │   Aceitar / Recusar   │
         │                       │ <───────────────────  │
         │                       │                       │
         │  GET /delivery?id=123 │                       │
         │ ───────────────────>  │                       │
         │                       │                       │
         │  { status: "assigned"}│                       │
         │ <───────────────────  │                       │
         │                       │                       │
```

---

## Suporte

Em caso de dúvidas ou problemas com a integração, entre em contato pelo WhatsApp disponível no painel do Zap Entregas.
