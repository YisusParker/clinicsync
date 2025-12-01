# ClinicSync Architecture Documentation

## Overview

ClinicSync is built using Next.js 16 with the App Router, following modern React Server Components patterns. The architecture emphasizes security, scalability, and maintainability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js App Router                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  (auth)/     │  │ (platform)/  │  │   Layout     │ │
│  │  - Login     │  │ - Dashboard  │  │   - Root     │ │
│  │  - Register  │  │ - Patients   │  │   - Auth    │ │
│  └──────────────┘  │ - Consult.   │  │   - Platform│ │
│                     └──────────────┘  └──────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Server Actions (lib/)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  auth.ts │  │patients.ts│  │consult.  │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Prisma ORM (lib/db.ts)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database                        │
└─────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Server-First Approach

**Why**: Security, performance, and SEO benefits

- All data fetching happens on the server
- Server Actions for mutations (no API routes needed)
- Minimal client-side JavaScript
- Better security (credentials never exposed)

### 2. Route Groups

**Structure**: `(auth)` and `(platform)` route groups

- **`(auth)`**: Public routes for login/register
- **`(platform)`**: Protected routes requiring authentication
- Layouts are scoped to route groups
- Clean separation of concerns

### 3. Server Actions Pattern

**Pattern**: All mutations use Server Actions

```typescript
// lib/patients.ts
"use server"

export async function createPatient(formData: FormData) {
  // Server-side logic
  // Automatic CSRF protection
  // Type-safe with TypeScript
}
```

**Benefits**:
- No API routes needed
- Automatic CSRF protection
- Type-safe end-to-end
- Progressive enhancement

### 4. Authentication Strategy

**Method**: HTTP-only cookies with session IDs

```typescript
// Session stored in HTTP-only cookie
cookieStore.set(SESSION_COOKIE, doctorId, {
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // HTTPS only in production
  sameSite: "lax",     // CSRF protection
  maxAge: 7 days
});
```

**Flow**:
1. User submits login form
2. Server validates credentials
3. Server sets HTTP-only cookie with doctor ID
4. Subsequent requests include cookie automatically
5. Server reads cookie to identify user

### 5. Data Isolation

**Pattern**: Row-level security via doctorId

Every query filters by `doctorId`:

```typescript
const patients = await prisma.patient.findMany({
  where: { doctorId: doctor.id }  // Always filter by doctor
});
```

**Benefits**:
- Doctors can only see their own data
- No need for complex permission systems
- Simple and secure

## File Organization

### App Directory Structure

```
app/
├── layout.tsx              # Root layout (global styles, metadata)
├── (auth)/                 # Authentication route group
│   ├── layout.tsx         # Auth-specific layout
│   ├── page.tsx           # Auth page (renders AuthCard)
│   └── authcard.tsx       # Client component for login/register
└── (platform)/            # Protected route group
    ├── layout.tsx         # Platform layout (sidebar, navigation)
    ├── dashboard/
    │   └── page.tsx       # Dashboard (server component)
    ├── patients/
    │   ├── page.tsx                    # Patient list (server)
    │   ├── PatientsListClient.tsx      # Patient list (client with search)
    │   ├── PatientListSearch.tsx       # Search component
    │   ├── new/
    │   │   └── page.tsx                # Create patient
    │   ├── import/
    │   │   ├── page.tsx                # Import patient page
    │   │   └── ImportPatientForm.tsx   # Import form component
    │   └── [id]/
    │       ├── page.tsx                # Patient detail
    │       └── edit/
    │           └── page.tsx            # Edit patient
    └── consultations/
        ├── new/
        │   ├── page.tsx                # New consultation (server)
        │   ├── NewConsultationClient.tsx  # New consultation (client)
        │   ├── PatientSearch.tsx       # Smart patient search
        │   ├── QuickContextPanel.tsx   # Quick context panel ⭐
        │   ├── search-actions.ts       # Search server actions
        │   └── context-actions.ts      # Context server actions
        └── [id]/
            └── page.tsx                # Consultation detail
```

### Lib Directory Structure

```
lib/
├── db.ts                  # Prisma client singleton
├── auth.ts               # Authentication server actions
├── patients.ts           # Patient CRUD + search + import operations
└── consultations.ts      # Consultation CRUD operations
```

## Data Flow

### Reading Data

```
1. User navigates to /patients
2. Next.js renders app/(platform)/patients/page.tsx (Server Component)
3. Page calls getPatients() server action
4. Server action queries database via Prisma
5. Data returned to Server Component
6. Component renders HTML with data
7. HTML sent to client
```

### Writing Data

```
1. User submits form
2. Form action calls server action (e.g., createPatient)
3. Server action validates input
4. Server action queries/updates database
5. Server action redirects to success page
6. Next.js handles redirect
7. New page loads with updated data
```

## Security Layers

### 1. Authentication Layer

- **Location**: `app/(platform)/layout.tsx`
- **Mechanism**: Checks for session cookie
- **Action**: Redirects to `/` if not authenticated

```typescript
const doctor = await getCurrentDoctor();
if (!doctor) {
  redirect("/");
}
```

### 2. Authorization Layer

- **Location**: Every server action
- **Mechanism**: Verifies doctor owns the resource
- **Action**: Returns error or redirects if unauthorized

```typescript
const patient = await prisma.patient.findFirst({
  where: { id, doctorId: doctor.id }  // Verify ownership
});
```

### 3. Input Validation Layer

- **Location**: Server actions
- **Mechanism**: Validates all form inputs
- **Action**: Returns error messages for invalid input

## State Management

### Server State

- **Method**: Server Components + Server Actions
- **No client-side state management needed**
- Data fetched fresh on each request
- Automatic cache invalidation on mutations

### Client State

- **Minimal**: Only for UI interactions
- **Examples**: Form validation, password visibility toggles
- **Tool**: React `useState` for simple cases

## Styling Architecture

### Tailwind CSS

- **Utility-first**: No custom CSS files
- **Configuration**: `tailwind.config.js`
- **Custom colors**: Medical blue/green in theme
- **Components**: Reusable utility classes

### Component Styles

```typescript
// Custom utility classes in globals.css
.input-field { /* ... */ }
.btn-primary { /* ... */ }
.btn-secondary { /* ... */ }
```

## Database Architecture

### Prisma ORM

- **Schema**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations/`
- **Client**: Singleton pattern in `lib/db.ts`

### Connection Pooling

```typescript
// lib/db.ts
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn"] 
    : ["error"]
});
```

## Performance Optimizations

### 1. Server Components

- **Zero JavaScript** sent to client for static content
- **Faster initial load**
- **Better SEO**

### 2. Automatic Code Splitting

- **Next.js** automatically splits code by route
- **Lazy loading** for client components
- **Optimized bundles**

### 3. Database Query Optimization

- **Selective fields**: Only fetch needed data
- **Relations**: Use `include`/`select` strategically
- **Indexes**: Prisma automatically creates indexes

## Error Handling

### Server Actions

```typescript
try {
  // Operation
  redirect("/success");
} catch (err: any) {
  // Re-throw redirect errors
  if (err?.digest?.startsWith("NEXT_REDIRECT")) {
    throw err;
  }
  // Handle actual errors
  return { error: "Error message" };
}
```

### Client Components

- **Form validation**: Client-side for UX
- **Error display**: Show server errors in UI
- **Loading states**: Disable buttons during submission

## Future Scalability

### Current Limitations

- Single database (no sharding)
- No caching layer
- No background jobs
- No real-time features

### Scaling Path

1. **Add Redis** for session storage and caching
2. **Add message queue** for background jobs
3. **Add CDN** for static assets
4. **Database read replicas** for read-heavy operations
5. **Horizontal scaling** with load balancer

## Best Practices

### ✅ Do

- Use Server Components by default
- Use Server Actions for mutations
- Validate input on server
- Filter by `doctorId` in every query
- Use TypeScript strictly
- Handle errors gracefully

### ❌ Don't

- Don't expose sensitive data to client
- Don't trust client-side validation alone
- Don't skip authorization checks
- Don't use client components unnecessarily
- Don't store passwords in plain text

