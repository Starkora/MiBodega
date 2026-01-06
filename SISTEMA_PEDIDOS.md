# Sistema de Pedidos Pendientes

## Descripción General
El sistema de pedidos pendientes permite gestionar los pedidos de clientes antes de confirmarlos como ventas definitivas, proporcionando flexibilidad para ajustar productos y cantidades durante la conversación por WhatsApp.

## Flujo de Trabajo

### 1. Creación del Pedido (Cliente)
- El cliente usa la **Pantalla de Cliente** (`/cliente`) para seleccionar productos
- Al enviar el pedido:
  - Se crea un registro en la tabla `pedidos` con estado "pendiente"
  - Se genera un número único de pedido (formato: `PED12345678`)
  - Se genera un token único para seguimiento
  - Se envía mensaje por WhatsApp con:
    * Detalles del pedido
    * Número de pedido
    * Link de confirmación al panel de administración

### 2. Gestión de Pedidos (Administrador)
- Acceder a **Pedidos** en el menú lateral
- Ver todos los pedidos pendientes con:
  - Número de pedido
  - Fecha y hora
  - Cliente (nombre y teléfono, si disponible)
  - Lista de productos y cantidades
  - Total del pedido

#### Acciones Disponibles:

**Editar Pedido**
- Modificar cantidades de productos
- Eliminar productos del pedido (mínimo 1)
- Actualizar información del cliente
- Guardar cambios sin confirmar la venta

**Confirmar Pedido**
- Convierte el pedido en una venta
- Actualiza automáticamente el inventario
- Crea movimientos de inventario
- Verifica stock disponible antes de confirmar
- Marca el pedido como "confirmado"

**Cancelar Pedido**
- Marca el pedido como "cancelado"
- No afecta el inventario
- Mantiene el registro para historial

### 3. Confirmación Automática
Cuando se confirma un pedido, el sistema realiza las siguientes acciones **en una transacción atómica**:

1. **Verifica stock disponible** para todos los productos
2. **Crea una venta** con los detalles del pedido
3. **Actualiza el stock** de cada producto (resta las cantidades)
4. **Registra movimientos de inventario** por cada producto
5. **Marca el pedido como confirmado**

Si hay algún error, toda la operación se revierte.

## Estructura de Datos

### Tabla: `pedidos`
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- numeroPedido (VARCHAR(50), UNIQUE) - Ej: "PED12345678"
- token (VARCHAR(100), UNIQUE) - Para seguimiento
- estado (VARCHAR(50)) - "pendiente", "confirmado", "cancelado"
- total (DECIMAL(10, 2))
- clienteNombre (VARCHAR(200), OPCIONAL)
- clienteTelefono (VARCHAR(20), OPCIONAL)
- notas (TEXT, OPCIONAL)
- createdAt (DATETIME, AUTO)
- updatedAt (DATETIME, AUTO)
```

### Tabla: `pedidos_detalles`
```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- pedidoId (INT, FK -> pedidos.id)
- productoId (INT, FK -> productos.id)
- cantidad (INT)
- precioUnitario (DECIMAL(10, 2))
- subtotal (DECIMAL(10, 2))
```

## Endpoints API

### GET `/api/pedidos?estado=pendiente`
Obtiene lista de pedidos filtrados por estado.

**Query Params:**
- `estado` (opcional): "pendiente", "confirmado", "cancelado"

**Response:**
```json
[
  {
    "id": 1,
    "numeroPedido": "PED12345678",
    "token": "abc123...",
    "estado": "pendiente",
    "total": 25.50,
    "clienteNombre": "Juan Pérez",
    "clienteTelefono": "987654321",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "detalles": [
      {
        "id": 1,
        "cantidad": 2,
        "precioUnitario": 10.00,
        "subtotal": 20.00,
        "producto": {
          "id": 5,
          "codigo": "P001",
          "nombre": "Arroz Costeño 1kg",
          "precio": 10.00,
          "stock": 50
        }
      }
    ]
  }
]
```

### POST `/api/pedidos`
Crea un nuevo pedido.

**Body:**
```json
{
  "clienteNombre": "Juan Pérez",
  "clienteTelefono": "987654321",
  "notas": "Entregar después de las 3pm",
  "detalles": [
    {
      "productoId": 5,
      "cantidad": 2,
      "precioUnitario": 10.00
    }
  ]
}
```

### GET `/api/pedidos/[id]`
Obtiene un pedido específico.

### PUT `/api/pedidos/[id]`
Actualiza un pedido o lo confirma.

**Body (Edición):**
```json
{
  "clienteNombre": "Juan Pérez Actualizado",
  "clienteTelefono": "987654321",
  "notas": "Nueva nota",
  "detalles": [
    {
      "productoId": 5,
      "cantidad": 3,
      "precioUnitario": 10.00
    }
  ]
}
```

**Body (Confirmación):**
```json
{
  "estado": "confirmado"
}
```

Cuando `estado = "confirmado"`:
- Verifica stock
- Crea venta
- Actualiza inventario
- Registra movimientos
- Marca pedido como confirmado

**Body (Cancelación):**
```json
{
  "estado": "cancelado"
}
```

### DELETE `/api/pedidos/[id]`
Elimina un pedido completamente.

## Componentes

### `PedidosList.tsx`
Componente React que muestra y gestiona los pedidos pendientes.

**Funcionalidades:**
- Listado de pedidos con datos completos
- Modo edición inline
- Modificación de cantidades
- Eliminación de productos
- Confirmación con modal
- Cancelación con modal
- Toast notifications
- Auto-refresh

### `PantallaCliente.tsx`
Actualizado para crear pedidos en base de datos antes de enviar por WhatsApp.

**Flujo:**
1. Cliente selecciona productos
2. Hace clic en "Enviar Pedido"
3. Se crea registro en DB
4. Se genera mensaje de WhatsApp
5. Se muestra toast con número de pedido

## Página de Pedidos

**Ruta:** `/pedidos`

**Acceso:** Menú lateral -> "Pedidos" (entre Ventas e Inventario)

**Permisos:** Solo administradores

## Ventajas del Sistema

1. **Flexibilidad**: Permite ajustar pedidos durante la conversación por WhatsApp
2. **Trazabilidad**: Cada pedido tiene número único y token
3. **Seguridad**: Transacciones atómicas evitan inconsistencias
4. **Validación**: Verifica stock antes de confirmar
5. **Historial**: Mantiene registro de todos los pedidos
6. **Automatización**: Confirmación actualiza inventario automáticamente

## Casos de Uso

### Caso 1: Pedido Normal
1. Cliente ordena 2 unidades de Arroz
2. Dueño recibe mensaje en WhatsApp
3. Dueño confirma sin cambios
4. Sistema crea venta y actualiza stock

### Caso 2: Modificación de Pedido
1. Cliente ordena 5 unidades de Azúcar
2. Durante conversación, cliente cambia a 3 unidades
3. Dueño edita pedido en panel (cambia cantidad a 3)
4. Dueño confirma
5. Sistema crea venta con 3 unidades

### Caso 3: Stock Insuficiente
1. Cliente ordena 100 unidades de Aceite
2. Dueño intenta confirmar
3. Sistema detecta que solo hay 50 en stock
4. Muestra error y NO confirma
5. Dueño puede editar cantidad a 50 o cancelar

### Caso 4: Cancelación
1. Cliente ordena productos
2. Cliente cancela por WhatsApp
3. Dueño cancela pedido en panel
4. Pedido queda marcado como "cancelado"
5. No afecta inventario

## Mensaje de WhatsApp

Formato del mensaje enviado:
```
 *NUEVO PEDIDO PED12345678*

 Producto: Arroz Costeño 1kg
 Cantidad: 2
 Precio Unitario: S/ 10.00
 Total: S/ 20.00

Código: P001

 Para confirmar el pedido:
https://mibodega.com/pedidos/1
```

## Mejoras Futuras (Opcional)

- [ ] Notificaciones push al dueño cuando llega nuevo pedido
- [ ] Página de confirmación pública con token (sin login)
- [ ] Exportar pedidos a Excel
- [ ] Estadísticas de pedidos (aceptados, cancelados, etc.)
- [ ] Integración con API de WhatsApp Business
- [ ] Permitir agregar productos en modo edición
- [ ] Historial de cambios en pedidos
- [ ] Tiempo estimado de preparación
