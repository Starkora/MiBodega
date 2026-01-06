import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { producto, cantidad, telefono, numeroPedido, pedidoId } = data;

    if (!producto || !cantidad || !telefono) {
      return new Response(
        JSON.stringify({ error: 'Faltan datos requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // URL del sistema para gestionar pedidos
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:4321';
    const linkConfirmacion = `${baseUrl}/pedidos`;

    // Formatear mensaje para WhatsApp
    const mensaje = `🛒 *NUEVO PEDIDO ${numeroPedido || ''}*\n\n` +
      `📦 Producto: ${producto.nombre}\n` +
      `🔢 Cantidad: ${cantidad}\n` +
      `💰 Precio Unitario: S/ ${producto.precio}\n` +
      `💵 Total: S/ ${(producto.precio * cantidad).toFixed(2)}\n\n` +
      `Código: ${producto.codigo}\n\n` +
      `✅ Para confirmar el pedido:\n${linkConfirmacion}`;

    // Preparar el enlace de WhatsApp
    // El número debe estar en formato internacional sin + (ej: 51987654321 para Perú)
    const numeroWhatsApp = telefono.replace(/\D/g, '');
    const mensajeCodificado = encodeURIComponent(mensaje);
    const enlaceWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        enlaceWhatsApp,
        mensaje 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al procesar notificación:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar notificación' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
