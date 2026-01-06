import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';
import crypto from 'crypto';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const estado = searchParams.get('estado') || 'pendiente';

    const pedidos = await prisma.pedido.findMany({
      where: {
        estado
      },
      include: {
        detalles: {
          include: {
            producto: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return new Response(JSON.stringify(pedidos), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener pedidos' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { detalles, clienteNombre, clienteTelefono, notas } = data;

    if (!detalles || detalles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'El pedido debe tener al menos un producto' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generar número de pedido y token
    const numeroPedido = `PED${Date.now().toString().slice(-8)}`;
    const token = crypto.randomBytes(16).toString('hex');

    // Calcular total
    const total = detalles.reduce((sum: number, d: any) => sum + (d.precioUnitario * d.cantidad), 0);

    // Crear pedido
    const pedido = await prisma.pedido.create({
      data: {
        numeroPedido,
        token,
        total,
        clienteNombre: clienteNombre || null,
        clienteTelefono: clienteTelefono || null,
        notas: notas || null,
        detalles: {
          create: detalles.map((d: any) => ({
            productoId: d.productoId,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            subtotal: d.precioUnitario * d.cantidad
          }))
        }
      },
      include: {
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });

    return new Response(JSON.stringify(pedido), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return new Response(JSON.stringify({ error: 'Error al crear pedido' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
