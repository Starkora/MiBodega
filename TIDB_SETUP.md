# Guía de Configuración de TiDB Cloud

Esta guía te ayudará a configurar TiDB Cloud para tu sistema de inventario MiBodega.

##  Paso 1: Crear Cuenta en TiDB Cloud

1. Visita [TiDB Cloud](https://tidbcloud.com/)
2. Click en "Sign Up" o "Start Free"
3. Regístrate con tu email o cuenta de GitHub/Google
4. Verifica tu email

##  Paso 2: Crear un Cluster

### Opción Free Tier (Recomendado para empezar)

1. Después de iniciar sesión, click en **"Create Cluster"**
2. Selecciona **"Developer Tier"** (Gratis)
3. Configura tu cluster:
   - **Cluster Name**: `mibodega` (o el nombre que prefieras)
   - **Cloud Provider**: AWS, GCP o Azure
   - **Region**: Selecciona la región más cercana a ti
4. Click en **"Create"**
5. Espera 5-10 minutos mientras se crea el cluster

##  Paso 3: Obtener las Credenciales

1. Una vez creado el cluster, ve a la página del cluster
2. Click en **"Connect"**
3. Selecciona **"Standard Connection"**
4. Copia la cadena de conexión que se ve así:

```
mysql://username:password@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/test
```

### Importante:
- El usuario y contraseña se muestran solo una vez
- Guarda estas credenciales en un lugar seguro
- Si las pierdes, puedes resetear la contraseña

##  Paso 4: Configurar el Archivo .env

1. En tu proyecto MiBodega, copia el archivo `.env.example` a `.env`:
   ```bash
   copy .env.example .env
   ```

2. Abre el archivo `.env` y actualiza la variable `DATABASE_URL`:

```env
# Formato básico
DATABASE_URL="mysql://username:password@host:4000/mibodega?sslaccept=strict"

# Ejemplo real (reemplaza con tus datos)
DATABASE_URL="mysql://2aaBbCc123.root:TuPassword123@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/mibodega?sslaccept=strict"
```

### Partes de la URL:
- `username`: Tu usuario de TiDB (ej: `2aaBbCc123.root`)
- `password`: Tu contraseña (ej: `TuPassword123`)
- `host`: El host del cluster (ej: `gateway01.us-east-1.prod.aws.tidbcloud.com`)
- `port`: Siempre es `4000`
- `database`: El nombre de tu base de datos (ej: `mibodega`)
- `?sslaccept=strict`: Parámetro requerido para SSL

##  Paso 5: Crear la Base de Datos

### Opción A: Desde TiDB Cloud Console

1. Ve a tu cluster en TiDB Cloud
2. Click en **"Chat2Query"** o **"SQL Editor"**
3. Ejecuta:
```sql
CREATE DATABASE mibodega;
USE mibodega;
```

### Opción B: Usar Prisma (Recomendado)

Simplemente ejecuta desde tu proyecto:

```bash
npx prisma db push
```

Esto creará automáticamente la base de datos y todas las tablas.

##  Paso 6: Verificar la Conexión

1. En tu proyecto, ejecuta:
```bash
npx prisma studio
```

2. Si se abre Prisma Studio en tu navegador, ¡la conexión es exitosa! 

##  Solución de Problemas

### Error: "SSL connection required"
- Asegúrate de incluir `?sslaccept=strict` al final de tu DATABASE_URL

### Error: "Access denied"
- Verifica que tu usuario y contraseña sean correctos
- En TiDB Cloud, ve a "Security Settings" y verifica que tu IP esté permitida

### Error: "Unknown database"
- Crea la base de datos manualmente:
```sql
CREATE DATABASE mibodega;
```

### Error: "Connection timeout"
- Verifica tu conexión a internet
- En TiDB Cloud, ve a "Security Settings" > "Traffic Filter"
- Agrega tu IP actual o permite todas las IPs ( solo para desarrollo)

##  Permitir Conexiones desde tu IP

1. Ve a tu cluster en TiDB Cloud
2. Click en **"Security Settings"**
3. En **"Traffic Filter"**, click en **"Edit"**
4. Opciones:
   - **Desarrollo**: Click en "Allow Access from Anywhere" (0.0.0.0/0)
   - **Producción**: Agrega solo las IPs específicas

##  Monitoreo y Límites del Free Tier

### Límites del Developer Tier:
-  1 cluster gratis
-  Storage: 500 MiB
-  Conexiones: Hasta 50 conexiones simultáneas
-  Válido por 12 meses

### Monitoreo:
1. Ve a tu cluster dashboard
2. Verás métricas de:
   - CPU Usage
   - Memory Usage
   - Storage Used
   - QPS (Queries Per Second)

##  Migraciones y Actualizaciones

Cada vez que cambies el schema de Prisma:

```bash
# 1. Actualiza el schema.prisma
# 2. Genera el cliente
npx prisma generate

# 3. Aplica los cambios a la base de datos
npx prisma db push

# 4. (Opcional) Ver los datos
npx prisma studio
```

##  Mejores Prácticas de Seguridad

1. **Nunca compartas** tu archivo `.env`
2. **Usa contraseñas fuertes** para tu cluster
3. **Limita las IPs** que pueden acceder a tu cluster
4. **Rota las credenciales** periódicamente
5. **Habilita backups** automáticos en TiDB Cloud

##  Tips Adicionales

### Backups
1. Ve a tu cluster
2. Click en "Backup & Restore"
3. Configura backups automáticos

### Escalamiento
Si necesitas más recursos:
1. Puedes actualizar a un tier de pago
2. TiDB Cloud escala automáticamente según la carga

### Múltiples Ambientes
Crea diferentes clusters para:
- **Desarrollo**: Developer Tier
- **Staging**: Dedicated Tier
- **Producción**: Dedicated Tier con alta disponibilidad

##  Soporte

- [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud/)
- [Community Forum](https://asktug.com/)
- [Discord](https://discord.gg/tidb)
- [GitHub Issues](https://github.com/pingcap/tidb/issues)

---

¡Ahora estás listo para usar TiDB Cloud con MiBodega! 
