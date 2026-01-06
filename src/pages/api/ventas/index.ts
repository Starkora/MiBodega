import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const prerender = false;

// GET - Obtener todas las ventas
export const GET: APIRoute = async ({ url }) => {
  try {
    const desde = url.searchParams.get('desde');
    const hasta = url.searchParams.get('hasta');

    const whereClause: any = {};

    if (desde || hasta) {
      whereClause.fecha = {};
      if (desde) whereClause.fecha.gte = new Date(desde);
      if (hasta) whereClause.fecha.lte = new Date(hasta);
    }

    const ventas = await prisma.venta.findMany({
      where: whereClause,
      include: {
        detalles: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    return new Response(JSON.stringify(ventas), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener ventas' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// POST - Crear nueva venta
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Generar número de venta único
    const ultimaVenta = await prisma.venta.findFirst({
      orderBy: { id: 'desc' },
    });
    const numeroVenta = `V-${String((ultimaVenta?.id || 0) + 1).padStart(6, '0')}`;

    // Crear venta con sus detalles
    const venta = await prisma.venta.create({
      data: {
        numeroVenta,
        subtotal: parseFloat(data.subtotal),
        descuento: parseFloat(data.descuento) || 0,
        total: parseFloat(data.total),
        metodoPago: data.metodoPago,
        clienteNombre: data.clienteNombre,
        clienteTelefono: data.clienteTelefono,
        notas: data.notas,
        detalles: {
          create: data.detalles.map((detalle: any) => ({
            productoId: detalle.productoId,
            cantidad: detalle.cantidad,
            precioUnitario: parseFloat(detalle.precioUnitario),
            subtotal: parseFloat(detalle.subtotal),
          })),
        },
      },
      include: {
        detalles: {
          include: {
            producto: true,
          },
        },
      },
    });

    // Actualizar stock de productos y registrar movimientos
    for (const detalle of data.detalles) {
      const producto = await prisma.producto.findUnique({
        where: { id: detalle.productoId },
      });

      if (producto) {
        const nuevoStock = producto.stock - detalle.cantidad;

        await prisma.producto.update({
          where: { id: detalle.productoId },
          data: { stock: nuevoStock },
        });

        await prisma.movimientoInventario.create({
          data: {
            productoId: detalle.productoId,
            tipo: 'salida',
            cantidad: detalle.cantidad,
            stockAnterior: producto.stock,
            stockNuevo: nuevoStock,
            motivo: `Venta ${numeroVenta}`,
          },
        });
      }
    }

    return new Response(JSON.stringify(venta), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al crear venta:', error);
    return new Response(JSON.stringify({ error: 'Error al crear venta' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
