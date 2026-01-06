-- =====================================================
-- MiBodega - Script de Creación de Base de Datos
-- Base de Datos: MySQL/TiDB Cloud
-- =====================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS mibodega;
USE mibodega;

-- =====================================================
-- Tabla: categorias
-- Descripción: Categorías para organizar productos
-- =====================================================
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabla: productos
-- Descripción: Información de productos del inventario
-- =====================================================
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    precioCompra DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stockMinimo INT NOT NULL DEFAULT 5,
    unidad VARCHAR(50) NOT NULL DEFAULT 'unidad',
    categoriaId INT,
    imagen VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoriaId) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_codigo (codigo),
    INDEX idx_nombre (nombre),
    INDEX idx_categoria (categoriaId),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabla: ventas
-- Descripción: Registro de ventas realizadas
-- =====================================================
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numeroVenta VARCHAR(50) NOT NULL UNIQUE,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    metodoPago VARCHAR(50) NOT NULL,
    clienteNombre VARCHAR(200),
    clienteTelefono VARCHAR(20),
    notas TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fecha (fecha),
    INDEX idx_numeroVenta (numeroVenta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabla: ventas_detalles
-- Descripción: Detalles de productos vendidos en cada venta
-- =====================================================
CREATE TABLE ventas_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ventaId INT NOT NULL,
    productoId INT NOT NULL,
    cantidad INT NOT NULL,
    precioUnitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ventaId) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (productoId) REFERENCES productos(id) ON DELETE RESTRICT,
    INDEX idx_venta (ventaId),
    INDEX idx_producto (productoId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabla: movimientos_inventario
-- Descripción: Historial de movimientos de stock
-- =====================================================
CREATE TABLE movimientos_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productoId INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL,
    stockAnterior INT NOT NULL,
    stockNuevo INT NOT NULL,
    motivo VARCHAR(200) NOT NULL,
    notas TEXT,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productoId) REFERENCES productos(id) ON DELETE CASCADE,
    INDEX idx_producto (productoId),
    INDEX idx_fecha (fecha),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tabla: configuracion
-- Descripción: Configuraciones del sistema
-- =====================================================
CREATE TABLE configuracion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descripcion TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clave (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- Descomenta para insertar datos de prueba
-- =====================================================

-- Insertar categorías de ejemplo
INSERT INTO categorias (nombre, descripcion) VALUES
    ('Bebidas', 'Bebidas alcohólicas y no alcohólicas'),
    ('Snacks', 'Papas, galletas y golosinas'),
    ('Lácteos', 'Leche, yogurt, quesos'),
    ('Limpieza', 'Productos de limpieza y cuidado del hogar'),
    ('Panadería', 'Pan, pasteles y productos de panadería'),
    ('Abarrotes', 'Productos básicos y de despensa');

-- Insertar productos de ejemplo
INSERT INTO productos (codigo, nombre, descripcion, precio, precioCompra, stock, stockMinimo, unidad, categoriaId, activo) VALUES
    ('BEB001', 'Coca Cola 500ml', 'Gaseosa Coca Cola personal', 2.50, 1.50, 100, 20, 'unidad', 1, TRUE),
    ('BEB002', 'Agua San Luis 625ml', 'Agua mineral sin gas', 1.50, 0.80, 150, 30, 'unidad', 1, TRUE),
    ('BEB003', 'Inca Kola 1.5L', 'Gaseosa Inca Kola familiar', 4.50, 2.80, 50, 15, 'unidad', 1, TRUE),
    ('SNK001', 'Papas Lays Original 45g', 'Papas fritas sabor original', 2.00, 1.20, 80, 25, 'unidad', 2, TRUE),
    ('SNK002', 'Galletas Oreo 36g', 'Galletas de chocolate', 1.80, 1.00, 120, 30, 'unidad', 2, TRUE),
    ('LAC001', 'Leche Gloria Evaporada', 'Leche evaporada entera', 3.50, 2.30, 60, 15, 'unidad', 3, TRUE),
    ('LAC002', 'Yogurt Gloria Fresa 1L', 'Yogurt bebible sabor fresa', 5.00, 3.20, 40, 10, 'unidad', 3, TRUE),
    ('LMP001', 'Detergente Ariel 900g', 'Detergente en polvo', 12.00, 8.50, 30, 10, 'unidad', 4, TRUE),
    ('LMP002', 'Lejía Clorox 1L', 'Lejía desinfectante', 4.00, 2.50, 45, 15, 'unidad', 4, TRUE),
    ('PAN001', 'Pan Francés', 'Pan francés del día', 0.30, 0.15, 200, 50, 'unidad', 5, TRUE);

-- Insertar configuraciones iniciales
INSERT INTO configuracion (clave, valor, descripcion) VALUES
    ('nombre_negocio', 'Mi Bodega', 'Nombre del negocio'),
    ('direccion', 'Av. Principal 123', 'Dirección del negocio'),
    ('telefono', '987654321', 'Teléfono de contacto'),
    ('email', 'contacto@mibodega.com', 'Email de contacto'),
    ('moneda', 'PEN', 'Código de moneda'),
    ('simbolo_moneda', 'S/', 'Símbolo de la moneda'),
    ('igv', '0.18', 'Porcentaje de IGV/IVA'),
    ('stock_critico', '5', 'Stock mínimo crítico por defecto');

-- =====================================================
-- CONSULTAS ÚTILES
-- =====================================================

-- Ver todos los productos con stock bajo
-- SELECT p.*, c.nombre as categoria 
-- FROM productos p 
-- LEFT JOIN categorias c ON p.categoriaId = c.id 
-- WHERE p.stock <= p.stockMinimo AND p.activo = TRUE 
-- ORDER BY p.stock ASC;

-- Ver ventas del día
-- SELECT v.*, 
--        COUNT(vd.id) as total_items,
--        SUM(vd.cantidad) as total_productos
-- FROM ventas v
-- LEFT JOIN ventas_detalles vd ON v.id = vd.ventaId
-- WHERE DATE(v.fecha) = CURDATE()
-- GROUP BY v.id
-- ORDER BY v.fecha DESC;

-- Ver productos más vendidos (últimos 30 días)
-- SELECT p.nombre, p.codigo,
--        SUM(vd.cantidad) as total_vendido,
--        SUM(vd.subtotal) as ingreso_total
-- FROM productos p
-- INNER JOIN ventas_detalles vd ON p.id = vd.productoId
-- INNER JOIN ventas v ON vd.ventaId = v.id
-- WHERE v.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
-- GROUP BY p.id
-- ORDER BY total_vendido DESC
-- LIMIT 10;

-- Ver movimientos de inventario de un producto
-- SELECT mi.*, p.nombre as producto
-- FROM movimientos_inventario mi
-- INNER JOIN productos p ON mi.productoId = p.id
-- WHERE mi.productoId = 1
-- ORDER BY mi.fecha DESC
-- LIMIT 20;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que las tablas se crearon correctamente
SHOW TABLES;

-- Verificar estructura de tablas
-- DESCRIBE categorias;
-- DESCRIBE productos;
-- DESCRIBE ventas;
-- DESCRIBE ventas_detalles;
-- DESCRIBE movimientos_inventario;
-- DESCRIBE configuracion;

-- Contar registros de ejemplo
SELECT 
    (SELECT COUNT(*) FROM categorias) as total_categorias,
    (SELECT COUNT(*) FROM productos) as total_productos,
    (SELECT COUNT(*) FROM configuracion) as total_configuraciones;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
