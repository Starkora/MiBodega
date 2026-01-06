import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Sube una imagen a Cloudinary
 * @param file - El archivo a subir (como Buffer o base64 string)
 * @param folder - La carpeta en Cloudinary donde guardar la imagen
 * @returns Un objeto con el resultado de la subida
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = 'productos'
): Promise<UploadResult> {
  try {
    // Convertir Buffer a base64 si es necesario
    const fileStr = Buffer.isBuffer(file)
      ? `data:image/jpeg;base64,${file.toString('base64')}`
      : file;

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(fileStr, {
      folder: `mibodega/${folder}`,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Limitar tamaño máximo
        { quality: 'auto' }, // Optimización automática
        { fetch_format: 'auto' }, // Formato automático (WebP cuando sea posible)
      ],
    });

    return {
      success: true,
      url: result.secure_url,
    };
  } catch (error) {
    console.error('Error subiendo a Cloudinary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Elimina una imagen de Cloudinary
 * @param imageUrl - La URL de la imagen a eliminar
 * @returns Un objeto indicando si la eliminación fue exitosa
 */
export async function deleteFromCloudinary(imageUrl: string): Promise<UploadResult> {
  try {
    // Extraer el public_id de la URL
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    const publicId = `mibodega/productos/${filename.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error eliminando de Cloudinary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export default cloudinary;
