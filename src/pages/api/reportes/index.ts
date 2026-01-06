import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const tipo = searchParams.get('tipo') || 'ventas';
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    const where: any = {};
    
    if (fechaInicio && fechaFin) {
      where.fecha = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin + 'T23:59:59')
      };
    }

    let reporte: any = {};

    switch (tipo) {
      case 'ventas':
        reporte = await generarReporteVentas(where);
        break;
      case 'productos':
        reporte = await generarReporteProductos(where);
        break;
      case 'inventario':
        reporte = await generarReporteInventario();
        break;
      case 'resumen':
        reporte = await generarReporteResumen(where);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Tipo de reporte inválido' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return new Response(JSON.stringify(reporte), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    return new Response(JSON.stringify({ error: 'Error al generar reporte' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// Reporte de ventas
async function generarReporteVentas(where: any) {
  const ventas = await prisma.venta.findMany({
    where,
    include: {
      detalles: {
        include: {
          producto: true
        }
      }
    },
    orderBy: {
      fecha: 'desc'
    }
  });

  const totalVentas = ventas.length;
  const totalIngresos = ventas.reduce((sum: number, v: any) => sum + Number(v.total), 0);
  const totalDescuentos = ventas.reduce((sum: number, v: any) => sum + Number(v.descuento), 0);
  const subtotalGeneral = ventas.reduce((sum: number, v: any) => sum + Number(v.subtotal), 0);

  // Ventas por método de pago
  const ventasPorMetodo = ventas.reduce((acc: any, v: any) => {
    const metodo = v.metodoPago;
    if (!acc[metodo]) {
      acc[metodo] = { cantidad: 0, total: 0 };
    }
    acc[metodo].cantidad++;
    acc[metodo].total += Number(v.total);
    return acc;
  }, {});

  // Ventas por día
  const ventasPorDia = ventas.reduce((acc: any, v: any) => {
    const fecha = new Date(v.fecha).toLocaleDateString('es-PE');
    if (!acc[fecha]) {
      acc[fecha] = { cantidad: 0, total: 0 };
    }
    acc[fecha].cantidad++;
    acc[fecha].total += Number(v.total);
    return acc;
  }, {});

  // Productos más vendidos
  const productosVendidos: any = {};
  ventas.forEach((venta: any) => {
    venta.detalles.forEach((detalle: any) => {
      const productoId = detalle.productoId;
      if (!productosVendidos[productoId]) {
        productosVendidos[productoId] = {
          producto: detalle.producto.nombre,
          codigo: detalle.producto.codigo,
          cantidad: 0,
          ingresos: 0
        };
      }
      productosVendidos[productoId].cantidad += Number(detalle.cantidad);
      productosVendidos[productoId].ingresos += Number(detalle.subtotal);
    });
  });

  const topProductos = Object.values(productosVendidos)
    .sort((a: any, b: any) => b.cantidad - a.cantidad)
    .slice(0, 10);

  return {
    resumen: {
      totalVentas,
      totalIngresos,
      totalDescuentos,
      subtotalGeneral,
      ticketPromedio: totalVentas > 0 ? totalIngresos / totalVentas : 0
    },
    ventasPorMetodo,
    ventasPorDia,
    topProductos,
    ventas: ventas.slice(0, 50) // Últimas 50 ventas
  };
}

// Reporte de productos
async function generarReporteProductos(where: any) {
  const productos = await prisma.producto.findMany({
    include: {
      categoria: true
    }
  });

  const ventasDetalles = await prisma.ventaDetalle.findMany({
    where: {
      venta: where.fecha ? { fecha: where.fecha } : {}
    },
    include: {
      producto: {
        include: {
          categoria: true
        }
      }
    }
  });

  // Análisis por categoría
  const productosPorCategoria = productos.reduce((acc: any, p: any) => {
    const categoria = p.categoria?.nombre || 'Sin categoría';
    if (!acc[categoria]) {
      acc[categoria] = {
        cantidad: 0,
        valorInventario: 0,
        productosActivos: 0,
        productosBajoStock: 0
      };
    }
    acc[categoria].cantidad++;
    acc[categoria].valorInventario += Number(p.precioCompra) * Number(p.stock);
    if (p.activo) acc[categoria].productosActivos++;
    if (Number(p.stock) <= Number(p.stockMinimo)) acc[categoria].productosBajoStock++;
    return acc;
  }, {});

  // Productos con más rotación
  const rotacionProductos: any = {};
  ventasDetalles.forEach((detalle: any) => {
    const productoId = detalle.productoId;
    if (!rotacionProductos[productoId]) {
      rotacionProductos[productoId] = {
        producto: detalle.producto.nombre,
        categoria: detalle.producto.categoria?.nombre || 'Sin categoría',
        cantidadVendida: 0,
        ingresos: 0
      };
    }
    rotacionProductos[productoId].cantidadVendida += Number(detalle.cantidad);
    rotacionProductos[productoId].ingresos += Number(detalle.subtotal);
  });

  const mejorRotacion = Object.values(rotacionProductos)
    .sort((a: any, b: any) => b.cantidadVendida - a.cantidadVendida)
    .slice(0, 20);

  // Productos sin movimiento
  const productosVendidosIds = new Set(ventasDetalles.map((d: any) => d.productoId));
  const productosSinMovimiento = productos
    .filter((p: any) => !productosVendidosIds.has(p.id) && p.activo)
    .slice(0, 20);

  const totalProductos = productos.length;
  const productosActivos = productos.filter((p: any) => p.activo).length;
  const productosBajoStock = productos.filter((p: any) => Number(p.stock) <= Number(p.stockMinimo)).length;
  const valorTotalInventario = productos.reduce((sum: number, p: any) => sum + (Number(p.precioCompra) * Number(p.stock)), 0);

  return {
    resumen: {
      totalProductos,
      productosActivos,
      productosBajoStock,
      valorTotalInventario
    },
    productosPorCategoria,
    mejorRotacion,
    productosSinMovimiento
  };
}

// Reporte de inventario
async function generarReporteInventario() {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    include: {
      categoria: true
    }
  });

  const movimientos = await prisma.movimientoInventario.findMany({
    take: 100,
    orderBy: {
      fecha: 'desc'
    },
    include: {
      producto: true
    }
  });

  // Productos con stock crítico
  const stockCritico = productos
    .filter((p: any) => Number(p.stock) <= Number(p.stockMinimo))
    .sort((a: any, b: any) => Number(a.stock) - Number(b.stock));

  // Productos con exceso de stock (más del triple del mínimo)
  const excesoStock = productos
    .filter((p: any) => Number(p.stock) > Number(p.stockMinimo) * 3)
    .sort((a: any, b: any) => Number(b.stock) - Number(a.stock))
    .slice(0, 20);

  // Valor del inventario
  const valorTotal = productos.reduce((sum: number, p: any) => sum + (Number(p.precioCompra) * Number(p.stock)), 0);
  const valorPotencial = productos.reduce((sum: number, p: any) => sum + (Number(p.precio) * Number(p.stock)), 0);

  // Movimientos recientes por tipo
  const movimientosPorTipo = movimientos.reduce((acc: any, m: any) => {
    if (!acc[m.tipo]) {
      acc[m.tipo] = { cantidad: 0, unidades: 0 };
    }
    acc[m.tipo].cantidad++;
    acc[m.tipo].unidades += Number(m.cantidad);
    return acc;
  }, {});

  return {
    resumen: {
      totalProductos: productos.length,
      stockCritico: stockCritico.length,
      excesoStock: excesoStock.length,
      valorInventario: valorTotal,
      valorPotencialVenta: valorPotencial,
      margenPotencial: valorPotencial - valorTotal
    },
    stockCritico,
    excesoStock,
    movimientosPorTipo,
    ultimosMovimientos: movimientos.slice(0, 20)
  };
}

// Reporte resumen general
async function generarReporteResumen(where: any) {
  const [ventas, productos, movimientos] = await Promise.all([
    generarReporteVentas(where),
    generarReporteProductos(where),
    generarReporteInventario()
  ]);

  return {
    ventas: ventas.resumen,
    productos: productos.resumen,
    inventario: movimientos.resumen,
    fecha: new Date().toISOString()
  };
}
