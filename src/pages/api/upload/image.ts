import type { APIRoute } from 'astro';
import { uploadToCloudinary } from '../../../lib/cloudinary';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No se proporcionó ningún archivo' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'El archivo debe ser una imagen' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'La imagen no debe superar los 5MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convertir archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a Cloudinary
    const result = await uploadToCloudinary(buffer, 'productos');

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error || 'Error al subir la imagen' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ url: result.url }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error en upload:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar la imagen' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
