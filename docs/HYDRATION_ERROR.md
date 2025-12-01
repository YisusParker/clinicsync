# Solución: Error de Hidratación en Next.js

## Problema

Error de hidratación que aparece en la consola:
```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
cz-shortcut-listen="true"
```

## Causa

Este error puede ser causado por:

1. **Extensiones del navegador** (más común): Extensiones como ColorZilla u otras agregan atributos al HTML (`cz-shortcut-listen="true"`) después de que React renderiza, causando diferencias entre servidor y cliente.

2. **Uso de valores dinámicos**: Uso de `Date.now()`, `Math.random()`, o formatos de fecha que varían entre servidor y cliente.

## Solución Implementada

### 1. SuppressHydrationWarning en el Layout

Se agregó `suppressHydrationWarning` en el layout para suprimir warnings causados por extensiones del navegador:

```tsx
// app/layout.tsx
<html lang="es" suppressHydrationWarning>
  <body className="..." suppressHydrationWarning>
    {children}
  </body>
</html>
```

### 2. Uso Correcto de Fechas en Componentes Cliente

Para evitar discrepancias de fechas, se usa `useState` con función inicializadora:

```tsx
// ✅ Correcto
const [defaultDate] = useState(() => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
});

// ❌ Evitar
defaultValue={new Date().toISOString().slice(0, 16)}
```

## ¿Es un problema real?

**No**, si es causado por extensiones del navegador. El warning aparece porque React detecta diferencias, pero no afecta la funcionalidad de la aplicación. Las extensiones modifican el DOM después de la hidratación inicial.

## Pruebas

1. El error debería desaparecer o reducirse significativamente
2. La aplicación debería funcionar normalmente
3. Si persiste, puede ser necesario deshabilitar extensiones del navegador para desarrollo

## Notas Adicionales

- `suppressHydrationWarning` solo suprime warnings, no arregla problemas reales de hidratación
- Solo se usa en casos específicos donde sabemos que las diferencias son causadas externamente
- Para formatos de fecha, siempre usar funciones inicializadoras en `useState` o `useMemo`

