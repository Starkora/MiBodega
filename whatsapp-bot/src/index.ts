import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  delay
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

let sock: any = null;
let isConnected = false;
let currentQR: string | null = null; // Guardar el QR actual

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
      currentQR = qr;
      
      // Generar QR como imagen PNG
      const qrDir = path.join(process.cwd(), 'qr-codes');
      if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir, { recursive: true });
      }
      
      const qrPath = path.join(qrDir, 'whatsapp-qr.png');
      await QRCode.toFile(qrPath, qr, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      console.log('\n📱 CÓDIGO QR GENERADO');
      console.log('================================');
      console.log(`🖼️  QR guardado en: ${qrPath}`);
      console.log(`🌐 Accede al QR en: http://localhost:${process.env.BOT_PORT || 3001}/qr`);
      console.log('================================');
      console.log('👆 Abre la URL en tu navegador y escanea con WhatsApp');
      console.log('📱 WhatsApp > Dispositivos vinculados > Vincular dispositivo\n');
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
      currentQR = null; // Limpiar el QR al conectar
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

// Endpoint para ver el QR en el navegador
app.get('/qr', async (req, res) => {
  const qrPath = path.join(process.cwd(), 'qr-codes', 'whatsapp-qr.png');
  
  if (!fs.existsSync(qrPath)) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR WhatsApp - MiBodega</title>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
            h1 { color: #25D366; }
            .status { padding: 20px; background: #fffbdd; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🤖 Bot WhatsApp - MiBodega</h1>
            <div class="status">
              ${isConnected ? 
                '<h2>✅ Bot Conectado</h2><p>El bot ya está vinculado a WhatsApp</p>' :
                '<h2>⏳ Esperando QR...</h2><p>El código QR aún no se ha generado. Espera unos segundos y recarga la página.</p>'
              }
            </div>
            <button onclick="location.reload()">🔄 Recargar</button>
          </div>
        </body>
      </html>
    `);
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>QR WhatsApp - MiBodega</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial; text-align: center; padding: 20px; background: #f5f5f5; }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
          h1 { color: #25D366; margin-bottom: 20px; }
          .qr-image { max-width: 100%; height: auto; border: 2px solid #25D366; border-radius: 10px; padding: 20px; background: white; }
          .instructions { text-align: left; padding: 20px; background: #e3f2fd; border-radius: 5px; margin: 20px 0; }
          .instructions ol { margin: 10px 0; padding-left: 20px; }
          .instructions li { margin: 8px 0; }
          button { padding: 12px 24px; background: #25D366; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px; }
          button:hover { background: #128C7E; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📱 Escanea el QR con WhatsApp</h1>
          
          <img class="qr-image" src="/qr-image" alt="QR Code WhatsApp">
          
          <div class="instructions">
            <h3>📋 Instrucciones:</h3>
            <ol>
              <li>Abre <strong>WhatsApp</strong> en tu teléfono</li>
              <li>Ve a <strong>Configuración</strong> (⚙️)</li>
              <li>Toca <strong>Dispositivos vinculados</strong></li>
              <li>Toca <strong>Vincular un dispositivo</strong></li>
              <li>Escanea este código QR con la cámara</li>
            </ol>
          </div>
          
          <div class="warning">
            ⏰ Este QR expira en unos minutos. Si no funciona, recarga la página para generar uno nuevo.
          </div>
          
          <button onclick="location.reload()">🔄 Actualizar QR</button>
          <button onclick="window.location.href='/api/whatsapp/status'">📊 Ver Estado</button>
        </div>
        
        <script>
          // Auto-reload cada 60 segundos si no está conectado
          setTimeout(() => {
            fetch('/api/whatsapp/status')
              .then(r => r.json())
              .then(data => {
                if (data.connected) {
                  alert('✅ Bot conectado correctamente!');
                  location.reload();
                } else {
                  location.reload();
                }
              });
          }, 60000);
        </script>
      </body>
    </html>
  `);
});

// Endpoint para servir la imagen del QR
app.get('/qr-image', (req, res) => {
  const qrPath = path.join(process.cwd(), 'qr-codes', 'whatsapp-qr.png');
  
  if (!fs.existsSync(qrPath)) {
    return res.status(404).send('QR no disponible');
  }
  
  res.sendFile(qrPath);
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

// 🔔 API para enviar notificaciones desde Kairos
app.post('/api/notifications', async (req, res) => {
  try {
    if (!isConnected) {
      return res.status(503).json({ 
        error: 'Bot no conectado', 
        mensaje: 'El bot de WhatsApp no está conectado actualmente' 
      });
    }

    const { numero, mensaje, apiKey } = req.body;

    // Validar API Key para seguridad
    const expectedApiKey = process.env.API_KEY || 'kairos-mibodega-2024';
    if (apiKey !== expectedApiKey) {
      return res.status(401).json({ error: 'API Key inválida' });
    }

    if (!numero || !mensaje) {
      return res.status(400).json({ error: 'Número y mensaje son requeridos' });
    }

    // Formatear número (eliminar caracteres no numéricos)
    const numeroLimpio = numero.replace(/\D/g, '');
    
    // Si el número no tiene código de país, asumir Perú (+51)
    let numeroFormateado = numeroLimpio;
    if (!numeroLimpio.startsWith('51') && numeroLimpio.length <= 9) {
      numeroFormateado = '51' + numeroLimpio;
    }

    const jid = `${numeroFormateado}@s.whatsapp.net`;
    
    console.log(`🔔 Enviando notificación de Kairos a ${jid}`);
    console.log(`📝 Mensaje: ${mensaje}`);
    
    await sock.sendMessage(jid, { text: mensaje });
    
    console.log('✅ Notificación enviada exitosamente');
    
    res.json({ 
      success: true, 
      mensaje: 'Notificación enviada correctamente',
      destinatario: numeroFormateado
    });
  } catch (error: any) {
    console.error('❌ Error al enviar notificación:', error);
    res.status(500).json({ 
      error: 'Error al enviar notificación', 
      details: error.message 
    });
  }
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
