import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Sesión cerrada' 
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
