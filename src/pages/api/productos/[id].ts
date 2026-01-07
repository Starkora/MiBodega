import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const prerender = false;

// GET - Obtener un producto por ID
export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: true,
        movimientos: {
          orderBy: { fecha: 'desc' },
          take: 10,
        },
      },
    });

    if (!producto) {
      return new Response(JSON.stringify({ error: 'Producto no encontrado' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(producto), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener producto' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// PUT - Actualizar producto
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id!);
    const data = await request.json();

    const productoActual = await prisma.producto.findUnique({
      where: { id },
    });

    if (!productoActual) {
      return new Response(JSON.stringify({ error: 'Producto no encontrado' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio ? parseFloat(data.precio) : undefined,
        precioCompra: data.precioCompra ? parseFloat(data.precioCompra) : undefined,
        stockMinimo: data.stockMinimo ? parseInt(data.stockMinimo) : undefined,
        unidad: data.unidad,
        categoriaId: data.categoriaId ? parseInt(data.categoriaId) : null,
        imagen: data.imagen,
        activo: data.activo,
      },
      include: {
        categoria: true,
      },
    });

    return new Response(JSON.stringify(producto), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar producto' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// DELETE - Eliminar producto (desactivar si tiene relaciones)
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);

    // Verificar si el producto tiene relaciones
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        ventasDetalles: { take: 1 },
        pedidosDetalles: { take: 1 },
        movimientos: { take: 1 }
      }
    });

    if (!producto) {
      return new Response(JSON.stringify({ error: 'Producto no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const tieneRelaciones = 
      producto.ventasDetalles.length > 0 || 
      producto.pedidosDetalles.length > 0 ||
      producto.movimientos.length > 0;

    if (tieneRelaciones) {
      // Si tiene relaciones, solo desactivar
      await prisma.producto.update({
        where: { id },
        data: { activo: false }
      });

      return new Response(JSON.stringify({ 
        message: 'Producto desactivado (tiene historial de ventas/pedidos)',
        desactivado: true 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Si no tiene relaciones, eliminar permanentemente
      await prisma.producto.delete({
        where: { id }
      });

      return new Response(JSON.stringify({ 
        message: 'Producto eliminado permanentemente',
        eliminado: true 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar producto' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
