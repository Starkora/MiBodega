import type { APIRoute } from 'astro';

// Contraseña por defecto (puedes cambiarla en las variables de entorno)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { password } = await request.json();

    if (!password) {
      return new Response(JSON.stringify({ error: 'Contraseña requerida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (password === ADMIN_PASSWORD) {
      // Generar un token simple (en producción usa JWT)
      const token = Buffer.from(`${Date.now()}-${password}`).toString('base64');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          token,
          message: 'Login exitoso' 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Contraseña incorrecta' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error en login:', error);
    return new Response(
      JSON.stringify({ error: 'Error en el servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
