#  Inicio Rápido - MiBodega

¡Bienvenido a MiBodega! Esta guía te ayudará a poner en marcha tu sistema de inventario en menos de 10 minutos.

##  Checklist de Instalación

- [ ] Node.js 18+ instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Cuenta en TiDB Cloud creada
- [ ] Base de datos configurada
- [ ] Aplicación funcionando

##  Pasos

### 1. Verificar Node.js (30 segundos)

```bash
node --version  # Debe ser v18 o superior
```

Si no tienes Node.js, descárgalo desde [nodejs.org](https://nodejs.org/)

### 2. Instalar Dependencias (2-3 minutos)

```bash
npm install
```

### 3. Configurar TiDB Cloud (5 minutos)

#### a. Crear cuenta gratuita
1. Ve a [tidbcloud.com](https://tidbcloud.com/)
2. Regístrate (gratis, no requiere tarjeta)
3. Confirma tu email

#### b. Crear cluster
1. Click en "Create Cluster"
2. Selecciona "Developer Tier" (Gratis)
3. Elige una región cercana
4. Click en "Create"
5. Espera 3-5 minutos

#### c. Obtener credenciales
1. Click en "Connect" en tu cluster
2. Copia la cadena de conexión (se ve así):
   ```
   mysql://user:pass@host:4000/test?sslaccept=strict
   ```

### 4. Configurar Variables de Entorno (1 minuto)

```bash
# Windows
copy .env.example .env

# O manualmente crea un archivo .env
```

Edita el archivo `.env` y pega tu DATABASE_URL:

```env
DATABASE_URL="mysql://tu_usuario:tu_password@gateway.tidbcloud.com:4000/mibodega?sslaccept=strict"
```

 **Importante**: Cambia el nombre de la base de datos de `test` a `mibodega`

### 5. Crear Base de Datos (2 minutos)

```bash
# Generar cliente Prisma
npx prisma generate

# Crear tablas en TiDB
npx prisma db push
```

Deberías ver:
```
 Generated Prisma Client
 Applied changes to database
```

### 6. Iniciar la Aplicación (30 segundos)

```bash
npm run dev
```

O en Windows:
```bash
.\start.ps1
```

### 7. Abrir en el Navegador

Visita: **http://localhost:4321**

¡Listo! 

##  Primeros Pasos en la Aplicación

### 1. Crear Categorías
- Click en "Categorías" en el menú
- Click en "Nueva Categoría"
- Ejemplos: Bebidas, Snacks, Lácteos, Limpieza

### 2. Agregar Productos
- Click en "Productos"
- Click en "Nuevo Producto"
- Llena los datos:
  - **Código**: COD001
  - **Nombre**: Coca Cola 500ml
  - **Precio Compra**: 1.50
  - **Precio Venta**: 2.50
  - **Stock**: 50
  - **Categoría**: Bebidas

### 3. Registrar tu Primera Venta
- Click en "Ventas"
- Selecciona un producto
- Indica cantidad
- Click en "Finalizar Venta"

### 4. Ver el Dashboard
- Click en "Dashboard"
- Verás tus estadísticas y alertas

##  ¿Problemas?

### No se conecta a la base de datos
```
Error: Cannot fetch data from service
```

**Solución**:
1. Verifica que el `DATABASE_URL` en `.env` sea correcto
2. Asegúrate que incluya `?sslaccept=strict` al final
3. Verifica que tu IP esté permitida en TiDB Cloud

### Prisma Client no encontrado
```
Error: Cannot find module '@prisma/client'
```

**Solución**:
```bash
npx prisma generate
```

### Puerto 4321 ocupado
```
Error: Port 4321 is already in use
```

**Solución**:
```bash
# Windows
netstat -ano | findstr :4321
taskkill /PID <número_pid> /F

# Luego reinicia
npm run dev
```

##  Siguientes Pasos

1.  **Lee el [README.md](README.md)** completo
2.  **Configura alertas de stock** en cada producto
3.  **Explora Prisma Studio**: `npx prisma studio`
4.  **Personaliza los colores** en `src/styles/global.css`
5.  **Haz un backup** de tu base de datos regularmente

##  Tips Pro

### Datos de Prueba
Para probar rápido, crea:
- 3-5 categorías
- 10-15 productos
- 5 ventas de ejemplo

### Explorar la Base de Datos
```bash
npx prisma studio
```
Abre un explorador visual de tu base de datos en http://localhost:5555

### Modo Producción
```bash
npm run build
npm run preview
```

##  Enlaces Útiles

- [README Principal](README.md)
- [Guía Completa de TiDB](TIDB_SETUP.md)
- [Reportar un Bug](../../issues)

---

**¿Todo funcionando? ¡Genial! Ahora ve y vende mucho **
