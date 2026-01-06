# 🤖 Bot de WhatsApp para MiBodega

Bot automático de WhatsApp usando Baileys para enviar notificaciones de pedidos en tiempo real.

## 📋 Características

- ✅ Envío automático de mensajes sin abrir navegador
- 📱 Notificaciones de nuevos pedidos
- ❌ Notificaciones de pedidos cancelados
- ✅ Confirmaciones de pedidos
- 🔄 Reconexión automática
- 📊 API REST para integración

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd whatsapp-bot
npm install
```

### 2. Configurar variables de entorno

Edita el archivo `.env` en la raíz del proyecto MiBodega:

```env
# Número del vendedor (formato internacional sin +)
# Ejemplo: 51987654321 para Perú
WHATSAPP_NUMERO="51987654321"

# URL del bot (por defecto localhost:3001)
WHATSAPP_BOT_URL="http://localhost:3001"
```

### 3. Iniciar el bot

```bash
npm run dev
```

### 4. Escanear código QR

1. Abre WhatsApp en tu celular
2. Ve a **Dispositivos vinculados**
3. Toca **Vincular dispositivo**
4. Escanea el código QR que aparece en la terminal

✅ **¡Listo!** El bot está conectado y enviará mensajes automáticamente.

## 📡 Endpoints API

### POST `/api/whatsapp/send`

Envía un mensaje de texto.

**Body:**
```json
{
  "numero": "51987654321",
  "mensaje": "Hola, este es un mensaje de prueba"
}
```

**Response:**
```json
{
  "success": true,
  "mensaje": "Mensaje enviado correctamente",
  "destinatario": "51987654321@s.whatsapp.net"
}
```

### POST `/api/whatsapp/send-image`

Envía una imagen con caption.

**Body:**
```json
{
  "numero": "51987654321",
  "imagen": "https://ejemplo.com/imagen.jpg",
  "caption": "Descripción de la imagen"
}
```

### GET `/api/whatsapp/status`

Obtiene el estado de conexión del bot.

**Response:**
```json
{
  "connected": true,
  "numero": "51987654321",
  "timestamp": "2026-01-06T16:30:00.000Z"
}
```

### GET `/health`

Health check del bot.

**Response:**
```json
{
  "status": "ok",
  "connected": true,
  "timestamp": "2026-01-06T16:30:00.000Z"
}
```

## 🔄 Flujo de Notificaciones

### 1. Nuevo Pedido
Cuando un cliente crea un pedido desde `/cliente`:

```
🛒 NUEVO PEDIDO

📋 Pedido: #PED12345678
📦 Productos:
- Agua San Luis 625ml x1

💰 Total: S/ 2.50
📅 Fecha: 06/01/2026, 16:30

✅ Ingresa a tu panel para confirmar el pedido
```

### 2. Pedido Cancelado
Cuando un cliente cancela un pedido:

```
❌ PEDIDO CANCELADO

📋 Pedido: #PED12345678
📦 Productos:
- Agua San Luis 625ml x1

💰 Total: S/ 2.50
📅 Fecha: 06/01/2026, 16:30

ℹ️ El cliente ha cancelado este pedido
```

### 3. Pedido Confirmado
Cuando confirmas un pedido desde `/pedidos`:

```
✅ PEDIDO CONFIRMADO

📋 Pedido: #PED12345678
🎉 El pedido ha sido confirmado y registrado como venta
💰 Total: S/ 2.50
```

## 🛠️ Comandos Disponibles

```bash
# Modo desarrollo (con hot reload)
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar versión compilada
npm start
```

## 📁 Estructura de Archivos

```
whatsapp-bot/
├── src/
│   └── index.ts          # Bot principal
├── auth_info_baileys/    # Sesión de WhatsApp (auto-generado)
├── package.json
├── tsconfig.json
└── .gitignore
```

## 🔧 Solución de Problemas

### El bot no se conecta

1. **Elimina la sesión antigua:**
   ```bash
   rm -rf auth_info_baileys/
   ```

2. **Reinicia el bot:**
   ```bash
   npm run dev
   ```

3. **Escanea el nuevo QR**

### Error "Bot no conectado"

- Asegúrate de que el bot esté ejecutándose: `npm run dev`
- Verifica que haya escaneado el código QR
- Revisa el estado en: `http://localhost:3001/api/whatsapp/status`

### Los mensajes no llegan

1. **Verifica el número de teléfono:**
   - Debe estar en formato internacional sin `+`
   - Ejemplo correcto: `51987654321` (Perú)
   - Ejemplo incorrecto: `+51 987 654 321`

2. **Verifica la conexión del bot:**
   ```bash
   curl http://localhost:3001/health
   ```

3. **Revisa los logs del bot** en la terminal

## 🚀 Producción

Para ejecutar en producción:

1. **Compilar el bot:**
   ```bash
   npm run build
   ```

2. **Ejecutar con PM2:**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name mibodega-bot
   pm2 save
   pm2 startup
   ```

3. **Revisar logs:**
   ```bash
   pm2 logs mibodega-bot
   ```

## 📝 Notas Importantes

- ⚠️ **No cierres la terminal** donde corre el bot
- ⚠️ **No desconectes el dispositivo** de WhatsApp Web
- 🔒 **No compartas** la carpeta `auth_info_baileys/` (contiene tu sesión)
- 📱 Mantén WhatsApp abierto en tu celular (no es necesario estar conectado a internet)
- 🔄 El bot se reconecta automáticamente si pierde conexión

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs del bot en la terminal
2. Verifica que el puerto 3001 esté libre
3. Asegúrate de tener Node.js v18 o superior
4. Consulta la documentación de Baileys: https://github.com/WhiskeySockets/Baileys

## 📄 Licencia

ISC
