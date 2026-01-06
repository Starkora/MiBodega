import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const prerender = false;

// GET - Obtener todos los productos
export const GET: APIRoute = async () => {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        categoria: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return new Response(JSON.stringify(productos), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener productos' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// POST - Crear nuevo producto
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    const producto = await prisma.producto.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: parseFloat(data.precio),
        precioCompra: parseFloat(data.precioCompra),
        stock: parseInt(data.stock) || 0,
        stockMinimo: parseInt(data.stockMinimo) || 5,
        unidad: data.unidad || 'unidad',
        categoriaId: data.categoriaId ? parseInt(data.categoriaId) : null,
        imagen: data.imagen,
        activo: data.activo !== undefined ? data.activo : true,
      },
      include: {
        categoria: true,
      },
    });

    // Registrar movimiento de inventario inicial
    if (producto.stock > 0) {
      await prisma.movimientoInventario.create({
        data: {
          productoId: producto.id,
          tipo: 'entrada',
          cantidad: producto.stock,
          stockAnterior: 0,
          stockNuevo: producto.stock,
          motivo: 'Stock inicial',
        },
      });
    }

    return new Response(JSON.stringify(producto), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return new Response(JSON.stringify({ error: 'Error al crear producto' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
