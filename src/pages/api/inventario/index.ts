import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const productoId = searchParams.get('productoId');
    const tipo = searchParams.get('tipo');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};
    
    if (productoId) {
      where.productoId = parseInt(productoId);
    }
    
    if (tipo) {
      where.tipo = tipo;
    }

    const movimientos = await prisma.movimientoInventario.findMany({
      where,
      include: {
        producto: {
          include: {
            categoria: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      },
      take: limit
    });

    return new Response(JSON.stringify(movimientos), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener movimientos' }), {
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
    const { productoId, tipo, cantidad, motivo, notas } = data;

    // Validaciones
    if (!productoId || !tipo || !cantidad || !motivo) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener producto actual
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(productoId) }
    });

    if (!producto) {
      return new Response(
        JSON.stringify({ error: 'Producto no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stockAnterior = producto.stock;
    let stockNuevo = stockAnterior;

    // Calcular nuevo stock según el tipo de movimiento
    switch (tipo) {
      case 'entrada':
        stockNuevo = stockAnterior + parseInt(cantidad);
        break;
      case 'salida':
        stockNuevo = stockAnterior - parseInt(cantidad);
        if (stockNuevo < 0) {
          return new Response(
            JSON.stringify({ error: 'Stock insuficiente' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        break;
      case 'ajuste':
        stockNuevo = parseInt(cantidad);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Tipo de movimiento inválido' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Crear movimiento y actualizar stock en una transacción
    const movimiento = await prisma.$transaction(async (tx: any) => {
      // Actualizar stock del producto
      await tx.producto.update({
        where: { id: parseInt(productoId) },
        data: { stock: stockNuevo }
      });

      // Crear registro de movimiento
      return await tx.movimientoInventario.create({
        data: {
          productoId: parseInt(productoId),
          tipo,
          cantidad: parseInt(cantidad),
          stockAnterior,
          stockNuevo,
          motivo,
          notas: notas || null
        },
        include: {
          producto: true
        }
      });
    });

    return new Response(JSON.stringify(movimiento), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    return new Response(JSON.stringify({ error: 'Error al crear movimiento' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
