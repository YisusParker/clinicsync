# Configuración de Vercel para ClinicSync

## ⚠️ IMPORTANTE: Variable de Entorno Requerida

Para que la aplicación funcione en producción, **DEBES** configurar la variable de entorno `DATABASE_URL` en Vercel.

## Pasos para Configurar DATABASE_URL en Vercel

### 1. Obtén tu URL de Base de Datos

Si usas un servicio de base de datos (Railway, Neon, Supabase, etc.), copia la URL de conexión. Debe tener este formato:

```
postgresql://usuario:contraseña@host:puerto/database?schema=public
```

### 2. Configura en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `clinicsync`
3. Ve a **Settings** → **Environment Variables**
4. Haz clic en **Add New**
5. Agrega:
   - **Name**: `DATABASE_URL`
   - **Value**: Tu URL de conexión PostgreSQL
   - **Environment**: Selecciona **Production**, **Preview**, y **Development** (o al menos Production)
6. Haz clic en **Save**

### 3. Configurar Build Command (Opcional pero Recomendado)

Para aplicar automáticamente las migraciones durante el build:

1. Ve a **Settings** → **Build & Development Settings**
2. En **Build Command**, cambia a:
   ```
   npm run build:with-migrate
   ```
   O deja el default si prefieres aplicar migraciones manualmente.

### 4. Aplicar Migraciones Manualmente (Alternativa)

Si prefieres aplicar migraciones manualmente en lugar de durante el build:

```bash
# Opción 1: Desde tu máquina local (con DATABASE_URL configurada)
vercel env pull .env.local
npx prisma migrate deploy

# Opción 2: Desde Vercel CLI
vercel --prod
# Luego ejecuta migraciones desde tu máquina con DATABASE_URL de producción
```

## Verificar que Funciona

Después de configurar `DATABASE_URL`:

1. Haz un nuevo deploy (push a main o redeploy desde Vercel)
2. El build debería completarse exitosamente
3. Intenta iniciar sesión en producción

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"

**Solución**: Asegúrate de que `DATABASE_URL` esté configurada en Vercel y que esté disponible para el entorno correcto (Production/Preview/Development).

### Error: "Connection refused" o "Can't reach database server"

**Solución**: 
- Verifica que la URL de la base de datos sea correcta
- Asegúrate de que tu base de datos permita conexiones desde Vercel (verifica firewall/IP allowlist)
- Si usas un servicio como Railway o Neon, verifica que la base de datos esté activa

### Error Específico con Supabase: "Can't reach database server at pooler.supabase.com"

**Solución**: Si usas Supabase, este es un problema común. Ver la guía detallada en [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)

**Resumen rápido**:
1. Usa la URL de **Connection Pooling** (Transaction mode) de Supabase
2. Asegúrate de que la URL incluya `?pgbouncer=true&sslmode=require`
3. Configura `DATABASE_URL` en Vercel con esta URL completa
4. Haz un redeploy después de configurar la variable

### Las migraciones no se aplican

**Solución**: 
- Usa `npm run build:with-migrate` como build command, O
- Aplica migraciones manualmente: `npx prisma migrate deploy` (con DATABASE_URL configurada)

## Servicios de Base de Datos Recomendados

- **Neon**: https://neon.tech (gratis, fácil setup)
- **Railway**: https://railway.app (gratis, fácil setup)
- **Supabase**: https://supabase.com (gratis, incluye más features)
- **Vercel Postgres**: Integrado con Vercel (pago)

## Formato de DATABASE_URL

```
postgresql://usuario:contraseña@host:puerto/database?schema=public&sslmode=require
```

Ejemplo:
```
postgresql://postgres:password123@db.abc123.us-east-1.rds.amazonaws.com:5432/clinicsync?schema=public
```

