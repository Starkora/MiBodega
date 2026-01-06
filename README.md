# MiBodega - Sistema de Inventario

Sistema moderno de gestión de inventario para bodegas y pequeños negocios, construido con **Astro**, **React**, **Bootstrap** y **TiDB Cloud**.

## Características

- **Gestión de Productos**: Crear, editar y eliminar productos con control de stock
- **Categorías**: Organizar productos por categorías
- **Punto de Venta**: Sistema de ventas con carrito de compras
- **Dashboard**: Estadísticas en tiempo real y alertas de stock bajo
- **Múltiples métodos de pago**: Efectivo, tarjeta, transferencia, Yape, Plin
- **Pantalla de Cliente**: Interfaz táctil para que clientes hagan pedidos por WhatsApp
- **Gestión de Inventario**: Seguimiento de movimientos (entradas/salidas/ajustes)
- **Reportes Avanzados**: Ventas, productos, inventario y resumen
- **Configuración**: Personalizar información del negocio y parámetros del sistema
- **Diseño Responsive**: Optimizado para desktop, tablets y móviles
- **Alto Rendimiento**: Powered by Astro y TiDB Cloud

## Tecnologías

- **Frontend**: Astro 5.x + React 19
- **Estilos**: Bootstrap 5.3
- **Base de Datos**: TiDB Cloud (MySQL-compatible)
- **ORM**: Prisma 5
- **Lenguaje**: TypeScript
- **Icons**: Bootstrap Icons

##  Requisitos Previos

- Node.js 18+ 
- Cuenta en [TiDB Cloud](https://tidbcloud.com/) (Free Tier disponible)
- npm

##  Instalación Rápida

### Paso 1: Instalar dependencias
```bash
npm install
```

### Paso 2: Configurar Base de Datos

1. Copia el archivo `.env.example` a `.env`:
```bash
copy .env.example .env
```

2. **IMPORTANTE**: Configura TiDB Cloud siguiendo la [Guía de Configuración de TiDB](TIDB_SETUP.md)

3. Actualiza el archivo `.env` con tu DATABASE_URL de TiDB Cloud:
```env
DATABASE_URL="mysql://usuario:password@host:4000/mibodega?sslaccept=strict"
```

### Paso 3: Crear Base de Datos y Tablas
```bash
npx prisma generate
npx prisma db push
```

### Paso 4: Iniciar la Aplicación
```bash
npm run dev
```

O en Windows, usa el script:
```bash
.\start.ps1
```

### Paso 5: Abrir en el navegador
Visita: `http://localhost:4321`

##  Estructura del Proyecto

```
MiBodega/
 prisma/
    schema.prisma          # Esquema de base de datos
 src/
    components/            # Componentes React
       Dashboard.tsx
       ProductosList.tsx
       VentasList.tsx
       CategoriasList.tsx
    layouts/
       Layout.astro       # Layout principal
    lib/
       prisma.ts          # Cliente Prisma
    pages/
       index.astro        # Dashboard
       productos.astro    # Gestión de productos
       ventas.astro       # Punto de venta
       categorias.astro   # Categorías
       inventario.astro   # Movimientos de inventario
       reportes.astro     # Reportes y análisis
       configuracion.astro # Configuración del sistema
       cliente.astro      # Pantalla táctil para clientes
       api/               # API Routes
    styles/
        global.css         # Estilos globales
 .env.example               # Ejemplo de variables
 TIDB_SETUP.md             # Guía de TiDB Cloud
 PANTALLA_CLIENTE.md       # Guía de pantalla de cliente
 start.ps1                 # Script de inicio (Windows)
 README.md
```

##  Uso del Sistema

### Dashboard
- Visualiza estadísticas en tiempo real
- Alertas de productos con stock bajo
- Productos más vendidos del mes
- Resumen de ventas del día y mes

### Gestión de Productos
1. Click en "Productos" en el menú lateral
2. Click en "Nuevo Producto" 
3. Completa:
   - Código único del producto
   - Nombre y descripción
   - Precios de compra y venta
   - Stock inicial y mínimo
   - Categoría y unidad de medida

### Punto de Venta
1. Click en "Ventas"
2. Selecciona productos del dropdown
3. Indica cantidad y agrega al carrito
4. Datos del cliente (opcional)
5. Aplica descuentos si necesario
6. Selecciona método de pago
7. Click en "Finalizar Venta"

### Categorías
- Click en "Categorías"
- "Nueva Categoría"
- Asigna productos a categorías desde productos

### Pantalla de Cliente (WhatsApp)
1. Configura tu número de WhatsApp en **Configuración** (formato: 51987654321)
2. Abre la URL `/cliente` en una tablet o móvil
3. Los clientes pueden navegar productos y hacer pedidos
4. Al seleccionar un producto y cantidad, se envía automáticamente a tu WhatsApp
5. **Ver guía completa**: [PANTALLA_CLIENTE.md](PANTALLA_CLIENTE.md)

### Gestión de Inventario
- Registra entradas (compras), salidas (ventas), o ajustes de stock
- Filtra movimientos por producto, tipo o fecha
- Historial completo de todos los movimientos

### Reportes
- **Ventas**: Por método de pago, por día, productos más vendidos
- **Productos**: Por categoría, rotación, sin movimiento
- **Inventario**: Stock crítico, excedente, movimientos por tipo
- **Resumen**: KPIs generales del negocio
- Exporta a CSV o imprime directamente

### Configuración
- Información del negocio (nombre, RUC, dirección, teléfono)
- Configuración del sistema (moneda, IGV/IVA, stock crítico)
- Número de WhatsApp para recibir pedidos de clientes

##  Modelo de Base de Datos

- **categorias**: Categorías de productos
- **productos**: Info de productos y stock actual
- **ventas**: Registro de ventas
- **ventas_detalles**: Items de cada venta
- **movimientos_inventario**: Historial completo
- **configuracion**: Settings del sistema

##  Scripts Disponibles

```bash
npm run dev        # Servidor desarrollo
npm run build      # Build producción
npm run preview    # Preview del build
npx prisma studio  # Explorador de BD visual
npx prisma generate # Generar cliente Prisma
npx prisma db push  # Aplicar schema a BD
```

##  Solución de Problemas

### "Cannot fetch data from service"
- **Causa**: No has configurado TiDB Cloud
- **Solución**: Sigue [TIDB_SETUP.md](TIDB_SETUP.md) para configurar tu base de datos

### "Module not found: @prisma/client"
```bash
npx prisma generate
```

### Cambios en schema no se reflejan
```bash
npx prisma db push
npx prisma generate
```

Ver más en [Guía de TiDB](TIDB_SETUP.md#-solución-de-problemas)

##  Seguridad

-  Conexiones SSL/TLS a TiDB Cloud
-  Variables sensibles en `.env` (excluido de git)
-  Validación server-side
-  **NUNCA** compartas tu `.env` o credenciales

##  Despliegue en Producción

### Vercel (Recomendado)
1. Conecta tu repo con Vercel
2. Configura `DATABASE_URL` en variables de entorno
3. Deploy automático

### Netlify / Cloudflare Pages
Compatible con adaptadores de Astro

##  Documentación Adicional

- [Astro Docs](https://docs.astro.build)
- [React Docs](https://react.dev)
- [Bootstrap Docs](https://getbootstrap.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [TiDB Cloud Docs](https://docs.pingcap.com/tidbcloud/)

##  Próximas Características (Roadmap)

- [ ] Reportes avanzados y gráficos
- [ ] Gestión de proveedores
- [ ] Sistema de usuarios y permisos
- [ ] Notificaciones automáticas de stock bajo
- [ ] Exportación a Excel/PDF
- [ ] App móvil (React Native)

##  Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/NuevaFuncion`)
3. Commit tus cambios (`git commit -m 'Agregar NuevaFuncion'`)
4. Push (`git push origin feature/NuevaFuncion`)
5. Abre un Pull Request

##  Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles

## ‍ Soporte

¿Problemas o preguntas? 
-  Lee la [Guía de TiDB](TIDB_SETUP.md)
-  Abre un [Issue](../../issues)
-  Revisa la documentación oficial

---

**Desarrollado con  para pequeños negocios y emprendedores **

¡Gracias por usar MiBodega! Si te fue útil, dale una  al proyecto.
