# Contributing to ClinicSync

Thank you for your interest in contributing to ClinicSync! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or remote)
- Git

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clinicsync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

4. **Set up database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Use type aliases for unions/primitives

### React/Next.js

- **Prefer Server Components** over Client Components
- Use `"use client"` only when necessary (interactivity, hooks, browser APIs)
- Use Server Actions for all mutations
- Use `async/await` for data fetching in Server Components

### File Naming

- Components: `PascalCase.tsx`
- Server actions: `camelCase.ts`
- Utilities: `camelCase.ts`
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)

### Code Organization

```
lib/
  ├── auth.ts          # Authentication functions
  ├── patients.ts      # Patient CRUD
  ├── consultations.ts # Consultation CRUD
  └── db.ts            # Prisma client

app/
  ├── (auth)/          # Public routes
  └── (platform)/     # Protected routes
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following the style guide
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Test in browser
npm run dev
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add patient search functionality"
```

**Commit Message Format**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Adding New Features

### Adding a New Server Action

1. **Create or update file in `lib/`**
   ```typescript
   "use server";
   
   import { getCurrentDoctor } from "./auth";
   import { prisma } from "./db";
   
   export async function newAction(formData: FormData) {
     const doctor = await getCurrentDoctor();
     if (!doctor) {
       redirect("/");
       return { error: "No autorizado." };
     }
     
     // Your logic here
   }
   ```

2. **Always check authentication**
3. **Always filter by `doctorId` for data isolation**
4. **Validate input**
5. **Handle errors gracefully**

### Adding a New Page

1. **Create page file** in appropriate route group
2. **Use Server Component** by default
3. **Fetch data** using server actions
4. **Handle loading/error states**

Example:
```typescript
// app/(platform)/new-feature/page.tsx
import { getData } from "@/lib/data";

export default async function NewFeaturePage() {
  const data = await getData();
  
  return (
    <div>
      {/* Your UI */}
    </div>
  );
}
```

### Adding a New Database Model

1. **Update `prisma/schema.prisma`**
   ```prisma
   model NewModel {
     id        Int      @id @default(autoincrement())
     doctorId  Int
     // ... fields
     doctor    Doctor   @relation(fields: [doctorId], references: [id])
   }
   ```

2. **Create migration**
   ```bash
   npx prisma migrate dev --name add_new_model
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Update TypeScript types** (auto-generated)

## Security Guidelines

### ✅ Always Do

- ✅ Check authentication in every server action
- ✅ Filter queries by `doctorId`
- ✅ Validate all user input
- ✅ Use parameterized queries (Prisma handles this)
- ✅ Hash passwords with bcryptjs
- ✅ Use HTTP-only cookies for sessions

### ❌ Never Do

- ❌ Trust client-side validation alone
- ❌ Expose sensitive data to client
- ❌ Skip authorization checks
- ❌ Store passwords in plain text
- ❌ Use `any` type for user input
- ❌ Query without `doctorId` filter

## Testing Checklist

Before submitting a PR, verify:

- [ ] Code follows style guide
- [ ] All server actions check authentication
- [ ] All queries filter by `doctorId`
- [ ] Input validation works
- [ ] Error handling is in place
- [ ] No console errors in browser
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Documentation updated (if needed)

## Common Patterns

### Form with Server Action

```typescript
// Server Component
import { createItem } from "@/lib/items";

export default function NewItemPage() {
  return (
    <form action={createItem}>
      <input name="name" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Form with Client-Side Validation

```typescript
"use client";

import { useState } from "react";
import { createItem } from "@/lib/items";

export default function NewItemForm() {
  const [error, setError] = useState("");

  return (
    <form action={async (formData) => {
      const result = await createItem(formData);
      if (result?.error) {
        setError(result.error);
      }
    }}>
      {error && <div>{error}</div>}
      <input name="name" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Protected Route

```typescript
// app/(platform)/layout.tsx
import { getCurrentDoctor } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PlatformLayout({ children }) {
  const doctor = await getCurrentDoctor();
  
  if (!doctor) {
    redirect("/");
  }
  
  return <div>{children}</div>;
}
```

### Data Fetching with Error Handling

```typescript
export default async function DataPage() {
  const data = await getData();
  
  if (!data) {
    return <div>Error loading data</div>;
  }
  
  return <div>{/* Render data */}</div>;
}
```

## Debugging

### Database Queries

Enable Prisma query logging:
```typescript
// lib/db.ts
const prisma = new PrismaClient({
  log: ["query", "error", "warn"]
});
```

### Server Actions

Add console.logs (remove before committing):
```typescript
export async function myAction(formData: FormData) {
  console.log("Action called with:", formData);
  // ...
}
```

### Client Components

Use React DevTools and browser console.

## Questions?

- Check existing code for patterns
- Review documentation in `docs/` folder
- Ask in PR comments

Thank you for contributing! 🎉

