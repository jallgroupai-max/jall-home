# Notificaciones de pagos con n8n

Este frontend reporta pagos al backend mediante `POST /payments` desde [RechargeDialog.tsx](C:/dev/jall/home/src/components/dashboard/RechargeDialog.tsx).

El webhook a `n8n` no debe dispararse desde el cliente. Debe ejecutarse en el backend inmediatamente despues de persistir el pago.

## Flujo esperado

1. El frontend envia el reporte de pago al backend.
2. El backend guarda el pago en base de datos.
3. Si el guardado fue exitoso, el backend envia un `POST` a `n8n`.
4. `n8n` envia una notificacion por correo.
5. `n8n` envia una notificacion por WhatsApp.

## Variables de entorno del backend

Estas variables pertenecen al servicio backend, no a este frontend:

```env
N8N_PAYMENT_WEBHOOK_URL=https://tu-n8n.tld/webhook/payment-reported
N8N_PAYMENT_WEBHOOK_SECRET=tu-secreto
```

## Payload recomendado hacia n8n

El backend debe construir un payload enriquecido con la informacion del pago y del usuario autenticado.

```json
{
  "event": "payment.reported",
  "reportedAt": "2026-03-13T15:20:10.000Z",
  "payment": {
    "id": "pay_123",
    "status": "pending",
    "amountUsd": 10,
    "amountBs": 5900,
    "currency": "usd",
    "reference": "123456789",
    "proofKey": "receipts/abc.png",
    "proofUrl": "https://backend.tld/storage/public/receipts/abc.png",
    "typePayment": "Transfer-movil",
    "paymentMethod": {
      "id": "pm_123",
      "name": "Pago Movil",
      "typeMethod": "pago_movil"
    },
    "exchangeRate": {
      "rate": 590,
      "money": "usd",
      "dateRate": "2026-03-13T15:20:10.000Z"
    },
    "createdAt": "2026-03-13T15:20:10.000Z"
  },
  "user": {
    "id": "user_123",
    "name": "Nombre Cliente",
    "email": "cliente@dominio.com",
    "phone": "+58412XXXXXXX"
  }
}
```

## Headers recomendados

```http
Content-Type: application/json
X-Webhook-Secret: tu-secreto
```

## Reglas de backend

- El `POST` a `n8n` debe ocurrir solo despues de guardar el pago correctamente.
- La creacion del pago no debe perderse si `n8n` falla.
- Si el webhook falla, el backend debe registrar el error y reintentar.
- El backend debe enviar un `proofUrl` absoluto cuando exista comprobante.
- El backend debe incluir `email` y telefono del usuario si estan disponibles para que `n8n` no tenga que consultar otra API.

## Ejemplo de implementacion backend

Pseudocodigo:

```ts
const payment = await paymentsRepository.create(paymentInput);

try {
  await httpClient.post(process.env.N8N_PAYMENT_WEBHOOK_URL, {
    event: "payment.reported",
    reportedAt: new Date().toISOString(),
    payment: {
      id: payment.id,
      status: payment.status,
      amountUsd: payment.amount,
      amountBs: payment.amountBs,
      currency: payment.moneyPayment,
      reference: payment.responsePayment?.reference ?? null,
      proofKey: payment.responsePayment?.proofKey ?? null,
      proofUrl: payment.responsePayment?.proofKey
        ? `${API_BASE_URL}/storage/public/${payment.responsePayment.proofKey}`
        : null,
      typePayment: payment.typePayment,
      paymentMethod: {
        id: payment.paymentMethod.id,
        name: payment.paymentMethod.name,
        typeMethod: payment.paymentMethod.typeMethod
      },
      exchangeRate: payment.exchangeRate,
      createdAt: payment.created_at
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null
    }
  }, {
    headers: {
      "X-Webhook-Secret": process.env.N8N_PAYMENT_WEBHOOK_SECRET
    },
    timeout: 5000
  });
} catch (error) {
  logger.error("payment webhook failed", {
    paymentId: payment.id,
    error
  });
}

return payment;
```

## Flujo n8n sugerido

1. `Webhook`
2. `IF` para validar `event === "payment.reported"`
3. `Set` para preparar asunto y mensajes
4. `Send Email`
5. `WhatsApp`
6. `Respond to Webhook`

## Contenido sugerido del correo

Asunto:

```txt
Nuevo pago reportado: {{ $json.payment.id }}
```

Cuerpo:

```txt
Se reporto un nuevo pago.

Cliente: {{ $json.user.name }}
Correo: {{ $json.user.email }}
Telefono: {{ $json.user.phone }}
Metodo: {{ $json.payment.paymentMethod.name }}
Monto USD: {{ $json.payment.amountUsd }}
Monto Bs: {{ $json.payment.amountBs }}
Referencia: {{ $json.payment.reference }}
Comprobante: {{ $json.payment.proofUrl }}
Estado: {{ $json.payment.status }}
```

## Contenido sugerido de WhatsApp

```txt
Nuevo pago reportado
Cliente: {{ $json.user.name }}
Correo: {{ $json.user.email }}
Metodo: {{ $json.payment.paymentMethod.name }}
Monto: ${{ $json.payment.amountUsd }}
Referencia: {{ $json.payment.reference }}
Comprobante: {{ $json.payment.proofUrl }}
```
