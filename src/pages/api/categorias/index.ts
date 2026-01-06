import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const prerender = false;

// GET - Obtener todas las categorías
export const GET: APIRoute = async () => {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: { productos: true },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return new Response(JSON.stringify(categorias), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener categorías' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// POST - Crear nueva categoría
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    const categoria = await prisma.categoria.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
      },
    });

    return new Response(JSON.stringify(categoria), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return new Response(JSON.stringify({ error: 'Error al crear categoría' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
