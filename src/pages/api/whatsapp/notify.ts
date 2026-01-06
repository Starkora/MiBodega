import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { tipo, pedido, productos } = data;
    
    // Leer variables de entorno
    const WHATSAPP_NUMERO = import.meta.env.WHATSAPP_NUMERO || process.env.WHATSAPP_NUMERO;
    const WHATSAPP_BOT_URL = import.meta.env.WHATSAPP_BOT_URL || process.env.WHATSAPP_BOT_URL || 'http://localhost:3001';
    
    console.log('Config WhatsApp:', { WHATSAPP_NUMERO, WHATSAPP_BOT_URL });
    
    let mensaje = '';
    
    switch (tipo) {
      case 'nuevo':
        mensaje = `🛒 *NUEVO PEDIDO*\n\n` +
          `📋 Pedido: #${pedido.numeroPedido}\n` +
          `📦 Productos:\n${productos || ''}\n` +
          `💰 Total: S/ ${Number(pedido.total).toFixed(2)}\n` +
          `📅 Fecha: ${new Date().toLocaleString('es-PE')}\n\n` +
          `✅ Ingresa a tu panel para confirmar el pedido`;
        break;
        
      case 'cancelacion':
        mensaje = `❌ *PEDIDO CANCELADO*\n\n` +
          `📋 Pedido: #${pedido.numeroPedido}\n` +
          `${productos ? `📦 Productos:\n${productos}\n` : ''}` +
          `💰 Total: S/ ${Number(pedido.total).toFixed(2)}\n` +
          `📅 Fecha: ${new Date().toLocaleString('es-PE')}\n\n` +
          `ℹ️ El cliente ha cancelado este pedido`;
        break;
        
      case 'confirmacion':
        mensaje = `✅ *PEDIDO CONFIRMADO*\n\n` +
          `📋 Pedido: #${pedido.numeroPedido}\n` +
          `🎉 El pedido ha sido confirmado y registrado como venta\n` +
          `💰 Total: S/ ${Number(pedido.total).toFixed(2)}`;
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Tipo de notificación no válido' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Enviar al bot de WhatsApp
    const response = await fetch(`${WHATSAPP_BOT_URL}/api/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numero: WHATSAPP_NUMERO,
        mensaje
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error del bot:', errorData);
      
      // Si el bot no está disponible, retornar éxito de todas formas
      // para no bloquear la operación principal
      return new Response(
        JSON.stringify({ 
          success: true, 
          warning: 'Pedido procesado pero notificación no enviada. Bot no disponible.' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error al notificar:', error);
    
    // No fallar la operación principal si falla la notificación
    return new Response(
      JSON.stringify({ 
        success: true, 
        warning: 'Pedido procesado pero notificación falló',
        error: error.message 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
