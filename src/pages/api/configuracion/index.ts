import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const configuraciones = await prisma.configuracion.findMany({
      orderBy: {
        clave: 'asc'
      }
    });

    // Convertir a objeto clave-valor para fácil acceso
    const config: Record<string, any> = {};
    configuraciones.forEach((c: any) => {
      config[c.clave] = {
        valor: c.valor,
        descripcion: c.descripcion
      };
    });

    return new Response(JSON.stringify(config), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener configuraciones' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { configuraciones } = data;

    if (!configuraciones || typeof configuraciones !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Datos de configuración inválidos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Actualizar cada configuración
    const updates = Object.entries(configuraciones).map(([clave, valor]) =>
      prisma.configuracion.upsert({
        where: { clave },
        update: { valor: String(valor) },
        create: {
          clave,
          valor: String(valor),
          descripcion: null
        }
      })
    );

    await Promise.all(updates);

    return new Response(
      JSON.stringify({ message: 'Configuración actualizada exitosamente' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar configuración' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
