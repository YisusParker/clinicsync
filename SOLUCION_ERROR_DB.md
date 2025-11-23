# 🔧 Solución Rápida: Errores de Base de Datos

## Problema 1: Error de Conexión General

Estás viendo "Error interno del servidor" al intentar:
- ✅ Registrar un nuevo doctor
- ✅ Iniciar sesión con una cuenta existente

**Causa**: La variable `DATABASE_URL` no está configurada correctamente en Vercel.

---

## Problema 2: Error "prepared statement 's0' already exists"

**Error específico**:
```
Error [PrismaClientUnknownRequestError]: 
ConnectorError(ConnectorError { 
  kind: QueryError(PostgresError { 
    code: "42P05", 
    message: "prepared statement \"s0\" already exists"
  })
})
```

**Causa**: 
- Múltiples instancias de PrismaClient se están creando
- Connection pooling (PgBouncer) sin configuración correcta

**Solución Rápida**:
1. ✅ Verifica que `DATABASE_URL` incluya `?pgbouncer=true&sslmode=require`
2. ✅ Regenera Prisma Client: `npx prisma generate`
3. ✅ Haz redeploy en Vercel

**Nota**: Este error ya está resuelto en el código. Si persiste, verifica la configuración de `DATABASE_URL`.

---

## Solución para Problema 1: Error de Conexión General

## Solución Paso a Paso

### 1. Obtén la URL de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Database**
4. En **Connection string**, selecciona:
   - **Connection pooling** → **Transaction mode**
5. Copia la URL completa

### 2. Formato Correcto

La URL debe incluir estos parámetros al final:
```
?pgbouncer=true&sslmode=require
```

**Ejemplo completo**:
```
postgresql://postgres.xxxxx:password@aws-1-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require
```

### 3. Configura en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `clinicsync`
3. Ve a **Settings** → **Environment Variables**
4. Busca `DATABASE_URL` o haz clic en **Add New**
5. **Name**: `DATABASE_URL`
6. **Value**: Pega la URL **COMPLETA** incluyendo `?pgbouncer=true&sslmode=require` al final
   
   **⚠️ IMPORTANTE**: La URL debe verse así (con los parámetros incluidos):
   ```
   postgresql://postgres.xxxxx:password@aws-1-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require
   ```
   
   **NO** pegues solo la parte sin los parámetros. Los parámetros `?pgbouncer=true&sslmode=require` son **obligatorios** y deben estar en la URL.
   
7. **Environment**: Selecciona **Production**, **Preview**, y **Development**
8. Haz clic en **Save**

### 4. Redeploy

**IMPORTANTE**: Después de cambiar variables de entorno, debes hacer un redeploy:

1. En Vercel, ve a **Deployments**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **Redeploy**
4. Espera a que termine el deployment

### 5. Verifica

1. Intenta registrar un nuevo doctor
2. O intenta iniciar sesión
3. Si aún hay error, revisa los logs en Vercel

## Verificación Rápida

Para verificar que la URL es correcta antes de desplegar:

```bash
# En tu máquina local, crea .env.local con la URL
echo 'DATABASE_URL="postgresql://..."' > .env.local

# Prueba la conexión
npx prisma db pull
```

Si funciona localmente, la URL es correcta y solo necesitas configurarla en Vercel.

## ¿Por qué pasa esto?

Vercel necesita la variable `DATABASE_URL` para conectarse a tu base de datos. Sin esta variable, Prisma no puede establecer la conexión y todos los intentos de consulta fallan.

## Solución Detallada para Problema 2: Prepared Statement Error

Si el error de "prepared statement" persiste después de verificar `DATABASE_URL`:

1. **Verifica el archivo `lib/db.ts`**:
   - Debe usar el patrón singleton
   - Debe asignar al global tanto en desarrollo como en producción
   - Ver sección 6.1 en [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) para más detalles

2. **Configura `DIRECT_URL` (opcional)**:
   - Útil para migraciones cuando usas connection pooling
   - Agrega `DIRECT_URL` en Vercel con la URL directa (sin `pgbouncer=true`)
   - El schema de Prisma ya está configurado para usarlo

3. **Regenera y redeploy**:
   ```bash
   npx prisma generate
   # Luego haz redeploy en Vercel
   ```

## Documentación Completa

Para más detalles, consulta:
- [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) - Guía completa de Supabase
- [VERCEL_SETUP.md](VERCEL_SETUP.md) - Configuración general de Vercel
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Más soluciones (incluye sección 6.1 sobre prepared statements)

