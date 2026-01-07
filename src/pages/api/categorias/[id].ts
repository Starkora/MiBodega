import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const prerender = false;

// GET - Obtener categoría por ID
export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productos: true },
        },
      },
    });

    if (!categoria) {
      return new Response(JSON.stringify({ error: 'Categoría no encontrada' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(categoria), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener categoría' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// PUT - Actualizar categoría
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id!);
    const data = await request.json();

    const categoria = await prisma.categoria.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
      },
    });

    return new Response(JSON.stringify(categoria), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar categoría' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// DELETE - Eliminar categoría
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);

    // Verificar si la categoría tiene productos asociados
    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productos: true },
        },
      },
    });

    if (!categoria) {
      return new Response(JSON.stringify({ error: 'Categoría no encontrada' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (categoria._count.productos > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No se puede eliminar una categoría con productos asociados',
          productosCount: categoria._count.productos 
        }), 
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    await prisma.categoria.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: 'Categoría eliminada' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar categoría' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
