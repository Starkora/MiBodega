import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const prerender = false;

// GET - Obtener estadísticas del dashboard
export const GET: APIRoute = async () => {
  try {
    // Contar productos totales y activos
    const totalProductos = await prisma.producto.count();
    const productosActivos = await prisma.producto.count({
      where: { activo: true },
    });

    // Productos con stock bajo
    const productosStockBajo = await prisma.producto.count({
      where: {
        stock: {
          lte: prisma.producto.fields.stockMinimo,
        },
        activo: true,
      },
    });

    // Ventas del día
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const ventasHoy = await prisma.venta.findMany({
      where: {
        fecha: {
          gte: hoy,
          lt: manana,
        },
      },
    });

    const totalVentasHoy = ventasHoy.reduce((sum: number, venta: any) => sum + Number(venta.total), 0);

    // Ventas del mes
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ventasMes = await prisma.venta.findMany({
      where: {
        fecha: {
          gte: inicioMes,
        },
      },
    });

    const totalVentasMes = ventasMes.reduce((sum: number, venta: any) => sum + Number(venta.total), 0);

    // Productos más vendidos (últimos 30 días)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const productosVendidos = await prisma.ventaDetalle.groupBy({
      by: ['productoId'],
      where: {
        venta: {
          fecha: {
            gte: hace30Dias,
          },
        },
      },
      _sum: {
        cantidad: true,
      },
      orderBy: {
        _sum: {
          cantidad: 'desc',
        },
      },
      take: 5,
    });

    const productosTop = await Promise.all(
      productosVendidos.map(async (item: any) => {
        const producto = await prisma.producto.findUnique({
          where: { id: item.productoId },
        });
        return {
          producto,
          cantidadVendida: item._sum.cantidad,
        };
      })
    );

    // Productos con stock bajo para alertas
    const productosAlerta = await prisma.producto.findMany({
      where: {
        stock: {
          lte: prisma.producto.fields.stockMinimo,
        },
        activo: true,
      },
      include: {
        categoria: true,
      },
      orderBy: {
        stock: 'asc',
      },
      take: 10,
    });

    return new Response(
      JSON.stringify({
        resumen: {
          totalProductos,
          productosActivos,
          productosStockBajo,
          ventasHoy: ventasHoy.length,
          totalVentasHoy,
          ventasMes: ventasMes.length,
          totalVentasMes,
        },
        productosTop,
        productosAlerta,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener estadísticas' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
