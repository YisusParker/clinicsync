# Configuración de Supabase para ClinicSync en Vercel

## ⚠️ Problema Común: "Can't reach database server"

Si estás viendo este error en Vercel:
```
Can't reach database server at `aws-1-us-east-1.pooler.supabase.com:5432`
```

Sigue esta guía para solucionarlo.

## Solución: Configurar DATABASE_URL Correctamente

### 1. Obtén la URL Correcta de Supabase

Supabase proporciona diferentes tipos de URLs de conexión. Para Vercel/serverless, necesitas usar la **Connection Pooling URL**.

#### Pasos:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **Database**
3. Busca la sección **Connection string**
4. Selecciona **Connection pooling** → **Transaction mode**
5. Copia la URL que se muestra

La URL debería verse así:
```
postgresql://postgres.[project-ref]:[password]@aws-1-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**IMPORTANTE**: 
- ✅ Usa **Transaction mode** (puerto 5432) para Prisma
- ✅ Asegúrate de que la URL incluya `?pgbouncer=true`
- ✅ Agrega `&sslmode=require` si no está presente

### 2. Formato Correcto de DATABASE_URL para Supabase

La URL completa debería verse así:

```
postgresql://postgres.[project-ref]:[password]@aws-1-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require
```

**Parámetros importantes**:
- `pgbouncer=true` - Habilita connection pooling (necesario para serverless)
- `sslmode=require` - Requiere SSL (necesario para Supabase)

### 3. Configurar en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `clinicsync`
3. Ve a **Settings** → **Environment Variables**
4. Busca `DATABASE_URL` o haz clic en **Add New**
5. Pega la URL completa de Supabase (con `pgbouncer=true&sslmode=require`)
6. Selecciona **Production**, **Preview**, y **Development**
7. Haz clic en **Save**

### 4. Verificar Configuración

Después de configurar la variable:

1. **Redeploy** tu aplicación en Vercel:
   - Ve a **Deployments**
   - Haz clic en los tres puntos (⋯) del último deployment
   - Selecciona **Redeploy**

2. **Verifica los logs**:
   - Ve a **Deployments** → Selecciona el deployment
   - Revisa los logs para asegurarte de que no hay errores de conexión

## Alternativa: Usar Direct Connection (No Recomendado para Serverless)

Si por alguna razón necesitas usar la conexión directa (no recomendado para Vercel):

1. En Supabase Dashboard, selecciona **Direct connection** en lugar de Connection pooling
2. La URL será diferente (sin `pooler` en el hostname)
3. **Problema**: Las conexiones directas pueden agotarse rápidamente en entornos serverless

**Recomendación**: Siempre usa Connection Pooling para Vercel.

## Troubleshooting

### Error: "Can't reach database server"

**Causas posibles**:
1. ❌ URL incorrecta (falta `pgbouncer=true`)
2. ❌ URL incorrecta (falta `sslmode=require`)
3. ❌ Variable `DATABASE_URL` no configurada en Vercel
4. ❌ Variable configurada solo para Development, no para Production

**Solución**:
- Verifica que la URL incluya `?pgbouncer=true&sslmode=require`
- Verifica que `DATABASE_URL` esté configurada para **Production** en Vercel
- Haz un redeploy después de cambiar la variable

### Error: "Connection pool timeout"

**Causa**: Demasiadas conexiones simultáneas

**Solución**: 
- Esto es raro con connection pooling, pero si ocurre, verifica que estés usando `pgbouncer=true`
- Considera usar Prisma Data Proxy (avanzado)

### Verificar que la URL es Correcta

Puedes verificar la URL localmente antes de desplegar:

```bash
# En tu máquina local, crea un archivo .env.local con:
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-1-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require"

# Luego prueba la conexión:
npx prisma db pull
```

Si funciona localmente, la URL es correcta y el problema está en la configuración de Vercel.

## Resumen de Pasos

1. ✅ Obtén la URL de Connection Pooling (Transaction mode) de Supabase
2. ✅ Agrega `&sslmode=require` si no está presente
3. ✅ Configura `DATABASE_URL` en Vercel con la URL completa
4. ✅ Asegúrate de que esté configurada para **Production**
5. ✅ Haz un **Redeploy** en Vercel
6. ✅ Verifica los logs del deployment

## Referencias

- [Supabase Connection Pooling Docs](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel#using-supabase)

