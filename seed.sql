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
    ('telefono', '51987654321', 'Teléfono de WhatsApp (con código país sin +, ej: 51987654321 para Perú)'),
    ('email', 'contacto@mibodega.com', 'Email de contacto'),
    ('moneda', 'PEN', 'Código de moneda'),
    ('simbolo_moneda', 'S/', 'Símbolo de la moneda'),
    ('igv', '0.18', 'Porcentaje de IGV/IVA'),
    ('stock_critico', '5', 'Stock mínimo crítico por defecto');
