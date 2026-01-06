import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  delay
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import express from 'express';
import pino from 'pino';

const app = express();
app.use(express.json());

let sock: any = null;
let isConnected = false;

const logger = pino({ level: 'silent' }); // Silenciar logs de Baileys

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  
  sock = makeWASocket({
    auth: state,
    logger,
    browser: ['MiBodega Bot', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', async (update: any) => {
    const { connection, lastDisconnect, qr } = update;
    
    console.log('📡 Connection update:', { connection, hasQR: !!qr });
    
    if (qr) {
      console.log('\n📱 Escanea este código QR con WhatsApp:\n');
      qrcode.generate(qr, { small: true });
      console.log('\n👆 Abre WhatsApp > Dispositivos vinculados > Vincular dispositivo\n');
    }
    
    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const errorMessage = lastDisconnect?.error?.message || 'Desconocido';
      console.log('❌ Conexión cerrada:', errorMessage);
      console.log('📊 Status Code:', statusCode);
      
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      isConnected = false;
      
      if (shouldReconnect) {
        console.log('⏳ Esperando 5 segundos antes de reconectar...');
        await delay(5000);
        connectToWhatsApp();
      } else {
        console.log('🔐 Sesión cerrada. Elimina la carpeta "auth_info_baileys" y reinicia el bot.');
      }
    } else if (connection === 'open') {
      console.log('✅ Bot WhatsApp conectado correctamente');
      console.log('📞 Número:', sock?.user?.id);
      isConnected = true;
    }
  });

  // Manejar mensajes entrantes (opcional - para respuestas automáticas)
  sock.ev.on('messages.upsert', async (m: any) => {
    const message = m.messages[0];
    if (!message.key.fromMe && m.type === 'notify') {
      console.log('📨 Mensaje recibido:', message.key.remoteJid);
      // Aquí puedes agregar respuestas automáticas
    }
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connected: isConnected,
    timestamp: new Date().toISOString()
  });
});

// API para enviar mensajes de texto
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { numero, mensaje } = req.body;
    
    if (!numero || !mensaje) {
      return res.status(400).json({ error: 'Faltan parámetros: numero y mensaje son requeridos' });
    }

    if (!sock || !isConnected) {
      return res.status(503).json({ 
        error: 'Bot no conectado. Espera a que se conecte o escanea el código QR.' 
      });
    }

    // Formatear número: debe ser con código de país sin +
    // Ejemplo: 51987654321 (Perú)
    let numeroFormateado = numero.toString().replace(/\D/g, '');
    
    // Si no tiene código de país, asume Perú (51)
    if (numeroFormateado.length === 9) {
      numeroFormateado = '51' + numeroFormateado;
    }
    
    const jid = `${numeroFormateado}@s.whatsapp.net`;
    
    console.log(`📤 Enviando mensaje a ${jid}`);
    
    await sock.sendMessage(jid, { text: mensaje });
    
    console.log('✅ Mensaje enviado exitosamente');
    
    res.json({ 
      success: true, 
      mensaje: 'Mensaje enviado correctamente',
      destinatario: jid
    });
  } catch (error: any) {
    console.error('❌ Error al enviar mensaje:', error);
    res.status(500).json({ 
      error: 'Error al enviar mensaje',
      details: error.message 
    });
  }
});

// API para enviar mensajes con imagen
app.post('/api/whatsapp/send-image', async (req, res) => {
  try {
    const { numero, imagen, caption } = req.body;
    
    if (!numero || !imagen) {
      return res.status(400).json({ error: 'Faltan parámetros: numero e imagen son requeridos' });
    }

    if (!sock || !isConnected) {
      return res.status(503).json({ error: 'Bot no conectado' });
    }

    let numeroFormateado = numero.toString().replace(/\D/g, '');
    if (numeroFormateado.length === 9) {
      numeroFormateado = '51' + numeroFormateado;
    }
    
    const jid = `${numeroFormateado}@s.whatsapp.net`;
    
    console.log(`📤 Enviando imagen a ${jid}`);
    
    await sock.sendMessage(jid, { 
      image: { url: imagen },
      caption: caption || ''
    });
    
    console.log('✅ Imagen enviada exitosamente');
    
    res.json({ success: true, mensaje: 'Imagen enviada correctamente' });
  } catch (error: any) {
    console.error('❌ Error al enviar imagen:', error);
    res.status(500).json({ error: 'Error al enviar imagen', details: error.message });
  }
});

// API para obtener estado de conexión
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    connected: isConnected,
    numero: sock?.user?.id || null,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.BOT_PORT || 3001;

app.listen(PORT, () => {
  console.log('\n🤖 Bot de WhatsApp para MiBodega');
  console.log('================================');
  console.log(`🚀 API escuchando en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Estado: http://localhost:${PORT}/api/whatsapp/status`);
  console.log('================================\n');
  console.log('🔄 Iniciando conexión con WhatsApp...\n');
  
  connectToWhatsApp();
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('❌ Error no capturado:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Promise rechazada no manejada:', err);
});
