# 📱 Bot de WhatsApp - Guía Rápida

##  Inicio Rápido

### Opción 1: Usando el script (Recomendado)

```bash
# Doble clic en:
iniciar-bot.bat
```

### Opción 2: Manual

```bash
cd whatsapp-bot
npm install
npm run dev
```

## 📱 Vincular WhatsApp

1. El bot mostrará un **código QR** en la terminal
2. Abre **WhatsApp** en tu celular
3. Ve a **Configuración > Dispositivos vinculados**
4. Toca **Vincular dispositivo**
5. Escanea el código QR

✅ **¡Conectado!** El bot enviará mensajes automáticamente.

## 🔧 Configuración Inicial

Edita el archivo `.env` en la raíz del proyecto:

```env
# Tu número de WhatsApp (formato internacional sin +)
WHATSAPP_NUMERO="51987654321"

# URL del bot (dejar por defecto)
WHATSAPP_BOT_URL="http://localhost:3001"
```

## 📋 ¿Qué hace el bot?

### 1️⃣ Nuevo Pedido
Cuando un cliente ordena desde `/cliente`, recibes:
```
🛒 NUEVO PEDIDO
📋 Pedido: #PED12345678
📦 Productos: Agua San Luis x1
💰 Total: S/ 2.50
```

### 2️⃣ Pedido Cancelado
Si el cliente cancela:
```
❌ PEDIDO CANCELADO
📋 Pedido: #PED12345678
💰 Total: S/ 2.50
```

### 3️⃣ Pedido Confirmado
Cuando confirmas desde `/pedidos`:
```
✅ PEDIDO CONFIRMADO
📋 Pedido: #PED12345678
🎉 Registrado como venta
```

## ⚠️ Importante

- ❌ **NO cierres** la terminal del bot
- ❌ **NO desconectes** WhatsApp Web desde tu celular
- ✅ Mantén tu celular con internet
- ✅ Mantén la terminal del bot abierta

## 🔍 Verificar Estado

Abre en tu navegador:
```
http://localhost:3001/api/whatsapp/status
```

Deberías ver:
```json
{
  "connected": true,
  "numero": "51987654321"
}
```

## 🆘 Problemas Comunes

### El bot no se conecta

```bash
# Elimina la sesión
cd whatsapp-bot
rmdir /s auth_info_baileys

# Reinicia
npm run dev

# Escanea el nuevo QR
```

### Error "Puerto 3001 en uso"

```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3001

# Matar el proceso (reemplaza PID)
taskkill /PID [número] /F
```

### Los mensajes no llegan

1. Verifica que el bot esté corriendo
2. Revisa el número en `.env` (sin espacios, sin +)
3. Asegúrate de que WhatsApp esté conectado

## 📊 Múltiples Terminales

Para usar MiBodega necesitas **2 terminales**:

**Terminal 1 - Servidor MiBodega:**
```bash
npm run dev
```

**Terminal 2 - Bot WhatsApp:**
```bash
cd whatsapp-bot
npm run dev
```

O simplemente ejecuta `iniciar-bot.bat` en una segunda terminal.

##  Producción

Para mantener el bot corriendo 24/7:

```bash
npm install -g pm2
cd whatsapp-bot
npm run build
pm2 start dist/index.js --name whatsapp-bot
pm2 save
pm2 startup
```

## 📞 URLs Importantes

- Bot Status: `http://localhost:3001/api/whatsapp/status`
- Health Check: `http://localhost:3001/health`
- MiBodega: `http://localhost:4321`

---

✅ **¿Todo listo?** Inicia el bot y comienza a recibir pedidos automáticamente por WhatsApp.
