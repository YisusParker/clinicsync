# ClinicSync Quick Reference

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run linter

# Database
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Create and apply migration
npx prisma studio        # Open database GUI
npx prisma migrate reset # Reset database (⚠️ deletes data)
```

## File Locations

| What | Where |
|------|-------|
| Server Actions | `lib/*.ts` |
| Pages | `app/**/page.tsx` |
| Layouts | `app/**/layout.tsx` |
| Database Schema | `prisma/schema.prisma` |
| Styles | `app/styles/globals.css` |
| Config | `tailwind.config.js` |

## Server Action Patterns

### Authentication Check
```typescript
const doctor = await getCurrentDoctor();
if (!doctor) {
  redirect("/");
  return { error: "No autorizado." };
}
```

### Data Isolation
```typescript
const items = await prisma.item.findMany({
  where: { doctorId: doctor.id }  // Always filter!
});
```

### Error Handling
```typescript
try {
  // Operation
  redirect("/success");
} catch (err: any) {
  if (err?.digest?.startsWith("NEXT_REDIRECT")) {
    throw err;  // Re-throw redirects
  }
  return { error: "Error message" };
}
```

## Color Palette

```typescript
// Tailwind classes
text-[#0A6CBD]      // Medical blue (primary)
bg-[#0A6CBD]        // Medical blue background
hover:bg-[#095a9d]  // Darker blue on hover

text-[#29B86F]      // Medical green (success)
bg-[#29B86F]        // Medical green background
hover:bg-[#238f5a]  // Darker green on hover
```

## Common Components

### Card
```tsx
<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
  {/* Content */}
</div>
```

### Button Primary
```tsx
<button className="px-4 py-2 bg-[#0A6CBD] hover:bg-[#095a9d] text-white rounded-xl font-medium transition">
  Button
</button>
```

### Button Secondary
```tsx
<button className="px-4 py-2 bg-[#29B86F] hover:bg-[#238f5a] text-white rounded-xl font-medium transition">
  Button
</button>
```

### Input Field
```tsx
<input 
  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A6CBD] focus:border-transparent"
  name="field"
/>
```

## Database Queries

### Get All (Filtered)
```typescript
const items = await prisma.model.findMany({
  where: { doctorId: doctor.id },
  orderBy: { createdAt: "desc" }
});
```

### Get One (Filtered)
```typescript
const item = await prisma.model.findFirst({
  where: { id, doctorId: doctor.id }
});
```

### Create
```typescript
const item = await prisma.model.create({
  data: {
    doctorId: doctor.id,
    // ... fields
  }
});
```

### Update
```typescript
await prisma.model.update({
  where: { id },
  data: { /* fields */ }
});
```

### Delete
```typescript
await prisma.model.delete({
  where: { id }
});
```

### Count
```typescript
const count = await prisma.model.count({
  where: { doctorId: doctor.id }
});
```

## Form Patterns

### Simple Form (Server Action)
```tsx
<form action={serverAction}>
  <input name="field" required />
  <button type="submit">Submit</button>
</form>
```

### Form with Error Display
```tsx
"use client";

const [error, setError] = useState("");

<form action={async (formData) => {
  const result = await serverAction(formData);
  if (result?.error) {
    setError(result.error);
  }
}}>
  {error && <div className="text-red-600">{error}</div>}
  {/* Fields */}
</form>
```

## Route Protection

### Layout Protection
```typescript
// app/(platform)/layout.tsx
const doctor = await getCurrentDoctor();
if (!doctor) redirect("/");
```

### Page Protection
```typescript
// app/(platform)/page.tsx
const doctor = await getCurrentDoctor();
if (!doctor) redirect("/");
```

## Date Formatting

```typescript
// Spanish locale
new Date(date).toLocaleDateString("es-ES", {
  year: "numeric",
  month: "long",
  day: "numeric"
});

// Short format
new Date(date).toLocaleDateString("es-ES", {
  year: "numeric",
  month: "short",
  day: "numeric"
});
```

## Empty States

```tsx
<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
  <Icon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
  <h3 className="text-lg font-semibold text-slate-700 mb-2">
    No items found
  </h3>
  <p className="text-slate-500 mb-6">
    Get started by creating your first item
  </p>
  <Link href="/new" className="btn-primary">
    Create Item
  </Link>
</div>
```

## Loading States

```tsx
// Server Component
export default async function Page() {
  const data = await getData();
  
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }
  
  return <div>{/* Content */}</div>;
}
```

## Navigation Links

```tsx
// Active link (add active class based on pathname)
import { usePathname } from "next/navigation";

const pathname = usePathname();
const isActive = pathname === "/dashboard";

<a 
  href="/dashboard"
  className={`px-3 py-2 rounded-lg transition ${
    isActive ? "bg-slate-100 font-medium" : "hover:bg-slate-100"
  }`}
>
  Dashboard
</a>
```

## Icons (Lucide React)

```tsx
import { Users, Calendar, Stethoscope } from "lucide-react";

<Users size={20} className="text-[#0A6CBD]" />
<Calendar size={18} />
<Stethoscope className="w-7 h-7" />
```

## TypeScript Types

### Server Action Return
```typescript
Promise<{ error?: string } | void>
// void = success (redirects)
// { error: string } = failure
```

### FormData Helper
```typescript
function getStr(formData: FormData, key: string): string {
  const val = formData.get(key);
  return typeof val === "string" ? val.trim() : "";
}
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/clinicsync"
NODE_ENV="development"
```

## Common Errors & Solutions

### "Unable to acquire lock"
```bash
rm -rf .next/dev/lock
pkill -f "next dev"
npm run dev
```

### Prisma Client not generated
```bash
npx prisma generate
```

### Migration conflicts
```bash
npx prisma migrate reset  # ⚠️ Deletes data
# Or manually resolve in migration files
```

### Type errors after schema change
```bash
npx prisma generate
# Restart TypeScript server in IDE
```

## Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)

