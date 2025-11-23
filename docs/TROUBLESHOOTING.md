# Guía de Troubleshooting - Problemas en Producción

## Problemas Comunes y Soluciones

### 1. Variables de Entorno

**Problema**: La aplicación funciona en local pero no en producción.

**Solución**: Verifica que todas las variables de entorno estén configuradas en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Asegúrate de tener configurado:
   - `DATABASE_URL` - URL de conexión a PostgreSQL
   - `NODE_ENV` - Debe ser `production` (Vercel lo configura automáticamente)

**Verificar en Vercel**:
```bash
# En el dashboard de Vercel, ve a:
# Settings → Environment Variables
```

### 2. Migraciones de Base de Datos

**Problema**: La base de datos no tiene las tablas necesarias.

**Solución**: Aplica las migraciones de Prisma en producción:

```bash
# Opción 1: Desde Vercel CLI (recomendado)
vercel env pull .env.production
npx prisma migrate deploy

# Opción 2: Desde el dashboard de Vercel
# Ve a: Settings → Build & Development Settings
# Agrega en "Build Command":
prisma migrate deploy && next build
```

**O configura un script de postinstall**:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma migrate deploy && next build"
  }
}
```

### 3. Problemas con Cookies/Sesión

**Problema**: No puedes iniciar sesión o la sesión se pierde.

**Solución**: 
- Las cookies ahora están configuradas para detectar Vercel automáticamente
- Verifica que estés usando HTTPS (Vercel lo proporciona automáticamente)
- Si usas un dominio personalizado, asegúrate de que tenga SSL configurado

### 4. Conexión a la Base de Datos

**Problema**: Errores de conexión a la base de datos.

**Solución**:
1. Verifica que `DATABASE_URL` esté correctamente configurada
2. Verifica que la base de datos permita conexiones desde Vercel (IPs permitidas)
3. Si usas un servicio como Railway, Neon, o Supabase, verifica la configuración de conexión

**Formato de DATABASE_URL**:
```
postgresql://usuario:contraseña@host:puerto/database?schema=public
```

#### Error Específico con Supabase: "Can't reach database server at pooler.supabase.com"

**Problema**: Si ves este error específico con Supabase:
```
Can't reach database server at `aws-1-us-east-1.pooler.supabase.com:5432`
```

**Solución**: Este es un problema común con Supabase. Ver la guía detallada en [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

**Resumen rápido**:
1. ✅ Usa la URL de **Connection Pooling** (Transaction mode) de Supabase
2. ✅ Asegúrate de que la URL incluya `?pgbouncer=true&sslmode=require`
3. ✅ Configura `DATABASE_URL` en Vercel con esta URL completa
4. ✅ Haz un **redeploy** después de configurar la variable

**URL correcta para Supabase en Vercel**:
```
postgresql://postgres.[project-ref]:[password]@aws-1-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require
```

### 5. Build Falla en Producción

**Problema**: El build falla en Vercel pero funciona en local.

**Soluciones**:
1. Verifica que todas las dependencias estén en `dependencies` y no solo en `devDependencies`
2. Verifica que `@prisma/client` esté en `dependencies` (no solo en `devDependencies`)
3. Revisa los logs de build en Vercel para ver el error específico

### 6. Prisma Client no Generado

**Problema**: Errores relacionados con Prisma Client.

**Solución**: Asegúrate de que `prisma generate` se ejecute durante el build:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

### 7. Verificar Logs en Producción

**Cómo ver logs en Vercel**:
1. Ve a tu proyecto en Vercel
2. Click en "Deployments"
3. Selecciona el deployment más reciente
4. Click en "Functions" para ver logs de serverless functions
5. O usa el CLI: `vercel logs`

### 8. Checklist de Deployment

Antes de hacer deploy, verifica:

- [ ] `DATABASE_URL` está configurada en Vercel
- [ ] Las migraciones de Prisma están aplicadas (`prisma migrate deploy`)
- [ ] `@prisma/client` está en `dependencies` (no solo `devDependencies`)
- [ ] El build funciona localmente: `npm run build`
- [ ] Las variables de entorno están configuradas en Vercel
- [ ] La base de datos permite conexiones desde Vercel

## Comandos Útiles

```bash
# Verificar variables de entorno localmente
vercel env pull .env.local

# Aplicar migraciones
npx prisma migrate deploy

# Generar Prisma Client
npx prisma generate

# Ver logs en producción
vercel logs

# Probar build localmente
npm run build
```

## Contacto y Soporte

Si el problema persiste:
1. Revisa los logs en Vercel
2. Verifica la consola del navegador para errores del cliente
3. Revisa los logs del servidor en Vercel Functions

