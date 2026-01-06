#  Guía de Base de Datos SQL

Esta guía te ayudará a crear la base de datos de MiBodega directamente en TiDB Cloud usando SQL.

##  Opción 1: Usando TiDB Cloud Console (Recomendado)

### Paso 1: Acceder al SQL Editor

1. Inicia sesión en [TiDB Cloud](https://tidbcloud.com/)
2. Selecciona tu cluster
3. Click en **"Chat2Query"** o **"SQL Editor"** en el menú lateral

### Paso 2: Ejecutar el Script

1. Abre el archivo [`database.sql`](database.sql)
2. Copia **TODO** el contenido
3. Pégalo en el SQL Editor de TiDB Cloud
4. Click en **"Run"** o presiona `Ctrl + Enter`

### Paso 3: Verificar

Deberías ver:
```
 7 tables created successfully
 Sample data inserted
```

##  Opción 2: Usando Prisma (Más Fácil)

Si ya configuraste tu archivo `.env`, simplemente ejecuta:

```bash
npx prisma db push
```

Esto creará automáticamente todas las tablas según el schema de Prisma.

##  Tablas Creadas

### 1. **categorias**
- Organiza productos por categorías
- Campos: id, nombre, descripcion, createdAt, updatedAt

### 2. **productos**
- Información completa de productos
- Campos: id, codigo, nombre, descripcion, precio, precioCompra, stock, stockMinimo, unidad, categoriaId, imagen, activo, createdAt, updatedAt

### 3. **ventas**
- Registro de ventas realizadas
- Campos: id, numeroVenta, fecha, total, descuento, subtotal, metodoPago, clienteNombre, clienteTelefono, notas, createdAt, updatedAt

### 4. **ventas_detalles**
- Detalles de productos en cada venta
- Campos: id, ventaId, productoId, cantidad, precioUnitario, subtotal, createdAt

### 5. **movimientos_inventario**
- Historial de cambios en el stock
- Campos: id, productoId, tipo, cantidad, stockAnterior, stockNuevo, motivo, notas, fecha, createdAt

### 6. **configuracion**
- Configuraciones del sistema
- Campos: id, clave, valor, descripcion, createdAt, updatedAt

##  Datos de Ejemplo

El script incluye datos de ejemplo:
-  6 categorías (Bebidas, Snacks, Lácteos, etc.)
-  10 productos de ejemplo
-  8 configuraciones iniciales

Si **NO** quieres los datos de ejemplo, comenta o elimina la sección "DATOS DE EJEMPLO" del archivo `database.sql`.

##  Consultas Útiles

### Ver productos con stock bajo
```sql
SELECT p.*, c.nombre as categoria 
FROM productos p 
LEFT JOIN categorias c ON p.categoriaId = c.id 
WHERE p.stock <= p.stockMinimo AND p.activo = TRUE 
ORDER BY p.stock ASC;
```

### Ver ventas del día
```sql
SELECT v.*, 
       COUNT(vd.id) as total_items,
       SUM(vd.cantidad) as total_productos
FROM ventas v
LEFT JOIN ventas_detalles vd ON v.id = vd.ventaId
WHERE DATE(v.fecha) = CURDATE()
GROUP BY v.id
ORDER BY v.fecha DESC;
```

### Productos más vendidos (últimos 30 días)
```sql
SELECT p.nombre, p.codigo,
       SUM(vd.cantidad) as total_vendido,
       SUM(vd.subtotal) as ingreso_total
FROM productos p
INNER JOIN ventas_detalles vd ON p.id = vd.productoId
INNER JOIN ventas v ON vd.ventaId = v.id
WHERE v.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY p.id
ORDER BY total_vendido DESC
LIMIT 10;
```

### Ver historial de un producto
```sql
SELECT mi.*, p.nombre as producto
FROM movimientos_inventario mi
INNER JOIN productos p ON mi.productoId = p.id
WHERE mi.productoId = 1  -- Cambia el ID
ORDER BY mi.fecha DESC
LIMIT 20;
```

##  Estructura de Relaciones

```
categorias
     productos (1:N)
             ventas_detalles (1:N)
                    ventas (N:1)
             movimientos_inventario (1:N)
```

##  Índices Creados

Para optimizar el rendimiento:
- **productos**: código, nombre, categoría, activo
- **ventas**: fecha, número de venta
- **ventas_detalles**: ventaId, productoId
- **movimientos_inventario**: productoId, fecha, tipo

##  Comandos de Limpieza (¡Cuidado!)

### Limpiar todos los datos (mantener estructura)
```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ventas_detalles;
TRUNCATE TABLE ventas;
TRUNCATE TABLE movimientos_inventario;
TRUNCATE TABLE productos;
TRUNCATE TABLE categorias;
TRUNCATE TABLE configuracion;
SET FOREIGN_KEY_CHECKS = 1;
```

### Eliminar todo (incluyendo tablas)
```sql
DROP DATABASE IF EXISTS mibodega;
```

##  Backup y Restauración

### Hacer Backup (desde TiDB Cloud Console)
1. Ve a tu cluster
2. Click en "Backup & Restore"
3. Click en "Backup Now"
4. Espera a que se complete

### Restaurar desde Backup
1. Ve a "Backup & Restore"
2. Selecciona el backup
3. Click en "Restore"

##  Solución de Problemas

### Error: "Database does not exist"
```sql
CREATE DATABASE mibodega;
USE mibodega;
-- Luego ejecuta el resto del script
```

### Error: "Table already exists"
```sql
DROP TABLE IF EXISTS configuracion;
DROP TABLE IF EXISTS movimientos_inventario;
DROP TABLE IF EXISTS ventas_detalles;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
-- Luego vuelve a ejecutar el script
```

### Verificar tablas creadas
```sql
SHOW TABLES;
```

### Ver estructura de una tabla
```sql
DESCRIBE productos;
```

### Contar registros
```sql
SELECT COUNT(*) as total FROM productos;
```

##  Tips

1. **Siempre haz backup** antes de modificar la estructura
2. **Usa transacciones** para operaciones críticas
3. **Monitorea el uso** de tu cluster en TiDB Cloud
4. **Índices**: Ya están optimizados para las consultas más comunes
5. **Limita tus consultas**: Usa `LIMIT` para evitar sobrecargas

##  Siguiente Paso

Una vez creada la base de datos:

1. Verifica que tu `.env` tenga el DATABASE_URL correcto
2. Ejecuta: `npx prisma generate`
3. Inicia la aplicación: `npm run dev`
4. ¡Empieza a usar MiBodega! 

---

**¿Necesitas ayuda?** Revisa [TIDB_SETUP.md](TIDB_SETUP.md) o [README.md](README.md)
