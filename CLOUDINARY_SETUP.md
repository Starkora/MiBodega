# Configuración de Cloudinary para MiBodega

## Pasos para configurar Cloudinary

### 1. Crear cuenta en Cloudinary
- Ve a [cloudinary.com](https://cloudinary.com) y crea una cuenta gratuita
- Una vez dentro, ve a tu Dashboard

### 2. Obtener credenciales
En tu Dashboard de Cloudinary encontrarás:
- **Cloud Name**: Tu nombre de nube (ej: `dxxxxx`)
- **API Key**: Tu clave API (ej: `123456789012345`)
- **API Secret**: Tu secreto API (ej: `abcdefghijklmnopqrstuvwxyz`)

### 3. Configurar variables de entorno
Crea o actualiza el archivo `.env` en la raíz del proyecto:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

### 4. Instalar dependencias
```bash
npm install cloudinary
```

### 5. Uso en la aplicación

#### Subir imagen desde el formulario de productos:
1. En ProductosList, selecciona una imagen desde el botón "Seleccionar imagen"
2. La imagen se subirá automáticamente a Cloudinary
3. La URL de la imagen se guardará en la base de datos

#### Estructura de carpetas en Cloudinary:
```
mibodega/
   productos/
       producto1.jpg
       producto2.jpg
       ...
```

## Características implementadas

###  Upload API (`/api/upload/image`)
- Acepta archivos de imagen (JPG, PNG, GIF, WebP)
- Límite de tamaño: 5MB
- Optimización automática de calidad
- Conversión a WebP cuando es posible
- Redimensionamiento a máximo 800x800px

###  Eliminación de imágenes
- Cuando eliminas un producto, su imagen se elimina de Cloudinary
- Cuando actualizas la imagen de un producto, la anterior se elimina automáticamente

###  Seguridad
- Las credenciales API están en variables de entorno
- Solo el backend puede subir/eliminar imágenes
- Validación de tipo y tamaño de archivo

## Características de Cloudinary

### Transformaciones automáticas
- **quality: auto** - Optimiza la calidad según el contenido
- **fetch_format: auto** - Convierte a WebP en navegadores compatibles
- **width/height: 800** - Redimensiona imágenes grandes

### Plan gratuito incluye:
- 25 GB de almacenamiento
- 25 GB de ancho de banda mensual
- Transformaciones ilimitadas
- CDN global

## Solución de problemas

### Error: "Invalid credentials"
- Verifica que las variables de entorno estén correctamente configuradas
- Reinicia el servidor después de actualizar `.env`

### Error: "File too large"
- La imagen debe ser menor a 5MB
- Comprime la imagen antes de subirla

### Error: "Upload failed"
- Verifica tu conexión a internet
- Revisa que no hayas excedido el límite del plan gratuito
- Revisa los logs del servidor para más detalles

## URLs de referencia

- Dashboard: https://console.cloudinary.com/
- Documentación: https://cloudinary.com/documentation
- Node.js SDK: https://cloudinary.com/documentation/node_integration
