#  Pantalla de Cliente con WhatsApp

##  Descripción

La **Pantalla de Cliente** es una interfaz táctil diseñada para que los clientes puedan navegar y seleccionar productos de forma intuitiva, enviando sus pedidos directamente a WhatsApp del propietario de la bodega.

##  Características

###  Interfaz Táctil
- **Diseño optimizado para pantallas táctiles** (tablets, kioscos, móviles)
- **Tarjetas de productos grandes** con imágenes y precios destacados
- **Botones amplios** para facilitar la selección
- **Animaciones suaves** al interactuar con elementos
- **Gradiente atractivo** con colores modernos (púrpura/azul)

###  Catálogo de Productos
- **Filtros por categoría** en la parte superior
- **Vista en grid responsive** que se adapta a cualquier tamaño de pantalla
- **Información completa**: nombre, descripción, precio, stock disponible
- **Solo productos activos** con stock disponible
- **Imágenes de productos** o iconos por defecto

###  Proceso de Pedido
1. Cliente selecciona un producto
2. Se abre un **modal detallado** con:
   - Imagen grande del producto
   - Precio unitario destacado
   - Stock disponible
   - Selector de cantidad con botones +/-
   - Total calculado automáticamente
3. Cliente confirma y se envía a **WhatsApp**

###  Integración WhatsApp
- **Enlace directo a WhatsApp** con mensaje pre-formateado
- Mensaje incluye:
  -  Título del pedido
  -  Nombre del producto
  -  Cantidad solicitada
  -  Precio unitario
  -  Total a pagar
  - Código del producto
- **Se abre automáticamente** la app de WhatsApp
- Funciona en **dispositivos móviles y escritorio**

##  Configuración Requerida

### 1. Número de WhatsApp

En el módulo de **Configuración**, debes ingresar el número de WhatsApp del negocio:

```
Campo: Teléfono
Formato: Código país + número (sin espacios ni símbolos)
Ejemplo para Perú: 51987654321
Ejemplo para México: 5219876543210
```

** Importante:**
- El número debe incluir el código de país
- NO incluir el símbolo `+`
- NO incluir espacios, guiones o paréntesis
- Ejemplo: `51` (Perú) + `987654321` = `51987654321`

### 2. Productos con Imagen (Opcional)

Para mejor experiencia visual, se recomienda agregar URLs de imágenes a los productos:

```sql
UPDATE productos 
SET imagen = 'https://ejemplo.com/imagen-producto.jpg' 
WHERE id = 1;
```

##  Acceso a la Pantalla

### URL Principal
```
http://localhost:4321/cliente
```

### Instalación como Kiosco

Para usar en una tablet o pantalla dedicada:

#### En Android/iPad:
1. Abrir la URL en el navegador
2. Tocar el menú (⋮)
3. Seleccionar "Agregar a pantalla de inicio"
4. Se crea un acceso directo como app

#### En Windows (Kiosk Mode):
```powershell
# Chrome en modo kiosco
chrome.exe --kiosk http://localhost:4321/cliente

# Edge en modo kiosco
msedge.exe --kiosk http://localhost:4321/cliente
```

##  Diseño Responsive

### Móviles (< 768px)
- Grid de 1 columna
- Tarjetas de 280px
- Modal ocupa 95% de la pantalla

### Tablets (768px - 1024px)
- Grid de 2 columnas
- Tarjetas de 320px

### Escritorio (> 1024px)
- Grid de 3-4 columnas
- Tarjetas de 320px
- Modal centrado con ancho máximo

##  Personalización de Estilos

Los estilos están embebidos en el componente `PantallaCliente.tsx` y pueden modificarse:

### Colores Principales
```css
/* Gradiente de fondo */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Color del precio */
color: #667eea;

/* WhatsApp */
background: #25D366;
```

### Tamaños de Botones y Texto
```css
.producto-nombre { font-size: 1.5rem; }
.producto-precio { font-size: 2rem; }
.btn-pedir-touch { font-size: 1.5rem; padding: 1.5rem; }
```

##  Flujo de Uso Completo

### Para el Cliente:
1. **Accede** a la pantalla de cliente
2. **Navega** por categorías o ve todos los productos
3. **Toca** el producto deseado
4. **Ajusta** la cantidad con los botones + y -
5. **Toca** "Pedir por WhatsApp"
6. **Se abre WhatsApp** con el mensaje listo
7. **Envía** el mensaje al negocio

### Para el Propietario:
1. **Recibe** notificación en WhatsApp
2. **Ve** el pedido completo con detalles
3. **Responde** al cliente para confirmar
4. **Procesa** el pedido normalmente

##  Ejemplo de Mensaje WhatsApp

```
 *NUEVO PEDIDO*

 Producto: Coca Cola 500ml
 Cantidad: 3
 Precio Unitario: S/ 2.50
 Total: S/ 7.50

Código: BEB001
```

##  Ventajas

### Para el Negocio:
-  **Sin necesidad** de sistema de pagos online
-  **Comunicación directa** con el cliente
-  **Flexible** - puedes confirmar disponibilidad
-  **Sin costos adicionales** de API de WhatsApp Business
-  **Historial** automático de conversaciones

### Para el Cliente:
-  **Interfaz simple** y fácil de usar
-  **Visual** con imágenes de productos
-  **Rápido** - solo tocar y seleccionar
-  **Familiar** - usa WhatsApp que ya conoce
-  **Confirmación inmediata** del pedido

##  Seguridad

-  Solo productos **activos y con stock** son visibles
-  Validación de **cantidad máxima** según stock
-  No se requiere **información personal** del cliente
-  No se almacena **ningún dato** del cliente

##  Mejoras Futuras Posibles

### Opcionales:
-  **Carrito de compras** para múltiples productos
-  **Geolocalización** para delivery
-  **Integración con pasarelas de pago**
-  **Notificaciones push** al propietario
-  **Analytics** de productos más vistos
-  **Sistema de favoritos**
-  **Horario de atención** visible
-  **Seguimiento de pedido**

##  Solución de Problemas

### WhatsApp no se abre
- **Verificar** que el número esté en formato correcto
- **Instalar** WhatsApp en el dispositivo
- **Probar** en navegador diferente

### Productos no aparecen
- **Verificar** que tengan stock > 0
- **Verificar** que estén marcados como activos
- **Revisar** la conexión a la base de datos

### Modal no responde en móvil
- **Usar** navegadores modernos (Chrome, Safari)
- **Actualizar** el navegador
- **Limpiar** caché del navegador

##  Códigos de País Comunes

```
Perú:      51
México:    52
Argentina: 54
Colombia:  57
Chile:     56
Ecuador:   593
España:    34
USA:       1
```

##  Ejemplo de Configuración Completa

```sql
-- En TiDB Cloud Console o MySQL CLI
UPDATE configuracion 
SET valor = '51987654321' 
WHERE clave = 'telefono';
```

O desde la interfaz web:
1. Ir a **Configuración** (http://localhost:4321/configuracion)
2. En la sección **Información del Negocio**
3. Campo **Teléfono**: ingresar `51987654321`
4. Clic en **Guardar Configuración**

---

##  Lista de Verificación

Antes de usar la pantalla de cliente:

- [ ] Configurar número de WhatsApp en formato correcto
- [ ] Tener productos activos con stock > 0
- [ ] Probar el enlace de WhatsApp desde un móvil
- [ ] Verificar que los precios sean correctos
- [ ] (Opcional) Agregar imágenes a los productos
- [ ] Abrir la URL /cliente y hacer prueba completa

---

**¡Listo! Tu pantalla de cliente con WhatsApp está configurada y lista para usar! **
