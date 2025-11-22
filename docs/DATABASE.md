# ClinicSync Database Documentation

## Overview

ClinicSync uses PostgreSQL as the database with Prisma ORM for type-safe database access. The schema is defined in `prisma/schema.prisma`.

## Database Schema

### Entity Relationship Diagram

```
Doctor
  ├── has many → Patient
  │     ├── has many → Consultation
  │     │     └── has one → FollowUpPlan
  │     │           └── has many → CheckIn
  │     │                 └── has one → Alert
  │     └── has many → NfcToken
  └── has many → Consultation
```

## Models

### Doctor

Represents a medical professional using the system.

```prisma
model Doctor {
  id            Int            @id @default(autoincrement())
  name          String
  email         String         @unique
  password      String         // Hashed with bcryptjs
  consultations Consultation[]
  patients      Patient[]
}
```

**Fields**:
- `id`: Primary key (auto-increment)
- `name`: Doctor's full name
- `email`: Unique email address (used for login)
- `password`: Hashed password (never returned in queries)

**Relations**:
- One-to-many with `Patient`
- One-to-many with `Consultation`

**Indexes**:
- `email` is unique (enforced by database)

---

### Patient

Represents a patient under a doctor's care.

```prisma
model Patient {
  id             Int            @id @default(autoincrement())
  name           String
  email          String?
  doctorId       Int
  bloodType      String?
  allergies      String?
  medications    String?
  emergencyPhone String?
  checkIns       CheckIn[]
  consultations  Consultation[]
  nfcTokens      NfcToken[]
  doctor         Doctor         @relation(fields: [doctorId], references: [id])
}
```

**Fields**:
- `id`: Primary key (auto-increment)
- `name`: Patient's full name (required)
- `email`: Patient's email (optional)
- `doctorId`: Foreign key to `Doctor` (required)
- `bloodType`: Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
- `allergies`: Known allergies (free text)
- `medications`: Current medications (free text)
- `emergencyPhone`: Emergency contact phone number

**Relations**:
- Many-to-one with `Doctor`
- One-to-many with `Consultation`
- One-to-many with `CheckIn` (future)
- One-to-many with `NfcToken` (future)

**Constraints**:
- `doctorId` is required (foreign key constraint)
- Patient belongs to exactly one doctor

**Data Isolation**:
- All queries filter by `doctorId` to ensure doctors only see their own patients

---

### Consultation

Represents a medical consultation/visit.

```prisma
model Consultation {
  id           Int           @id @default(autoincrement())
  date         DateTime      @default(now())
  summary      String
  doctorId     Int
  patientId    Int
  doctor       Doctor        @relation(fields: [doctorId], references: [id])
  patient      Patient       @relation(fields: [patientId], references: [id])
  FollowUpPlan FollowUpPlan?
}
```

**Fields**:
- `id`: Primary key (auto-increment)
- `date`: Date and time of consultation (defaults to now)
- `summary`: Consultation notes/summary (required)
- `doctorId`: Foreign key to `Doctor` (required)
- `patientId`: Foreign key to `Patient` (required)

**Relations**:
- Many-to-one with `Doctor`
- Many-to-one with `Patient`
- One-to-one with `FollowUpPlan` (optional, future)

**Constraints**:
- Both `doctorId` and `patientId` are required
- Consultation belongs to exactly one doctor and one patient

**Indexes**:
- Queries typically filter by `doctorId` and order by `date DESC`

---

### FollowUpPlan

Represents a treatment follow-up plan (future feature).

```prisma
model FollowUpPlan {
  id             Int          @id @default(autoincrement())
  consultationId Int          @unique
  active         Boolean      @default(true)
  CheckIn        CheckIn[]
  Consultation   Consultation @relation(fields: [consultationId], references: [id])
}
```

**Fields**:
- `id`: Primary key (auto-increment)
- `consultationId`: Foreign key to `Consultation` (unique, one-to-one)
- `active`: Whether the plan is currently active

**Relations**:
- One-to-one with `Consultation`
- One-to-many with `CheckIn`

**Status**: Schema ready, not yet implemented in UI

---

### CheckIn

Represents a patient check-in for a follow-up plan (future feature).

```prisma
model CheckIn {
  id           Int          @id @default(autoincrement())
  planId       Int
  patientId    Int
  createdAt    DateTime     @default(now())
  symptomScore Int
  notes        String?
  alert        Alert?
  patient      Patient      @relation(fields: [patientId], references: [id])
  FollowUpPlan FollowUpPlan @relation(fields: [planId], references: [id])
}
```

**Fields**:
- `id`: Primary key (auto-increment)
- `planId`: Foreign key to `FollowUpPlan`
- `patientId`: Foreign key to `Patient`
- `createdAt`: When the check-in was created
- `symptomScore`: Numeric score (1-10) for symptom severity
- `notes`: Optional notes from patient

**Relations**:
- Many-to-one with `FollowUpPlan`
- Many-to-one with `Patient`
- One-to-one with `Alert` (optional)

**Status**: Schema ready, not yet implemented in UI

---

### Alert

Represents an alert triggered by a concerning check-in (future feature).

```prisma
model Alert {
  id        Int      @id @default(autoincrement())
  checkInId Int      @unique
  createdAt DateTime @default(now())
  resolved  Boolean  @default(false)
  checkIn   CheckIn  @relation(fields: [checkInId], references: [id])
}
```

**Fields**:
- `id`: Primary key (auto-increment)
- `checkInId`: Foreign key to `CheckIn` (unique, one-to-one)
- `createdAt`: When the alert was created
- `resolved`: Whether the alert has been resolved

**Relations**:
- One-to-one with `CheckIn`

**Status**: Schema ready, not yet implemented in UI

---

### NfcToken

Represents an NFC token for quick patient check-in (future feature).

```prisma
model NfcToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  patientId Int
  createdAt DateTime @default(now())
  active    Boolean  @default(true)
  patient   Patient  @relation(fields: [patientId], references: [id])
}
```

**Fields**:
- `id`: Primary key (auto-increment)
- `token`: Unique NFC token string
- `patientId`: Foreign key to `Patient`
- `createdAt`: When the token was created
- `active`: Whether the token is currently active

**Relations**:
- Many-to-one with `Patient`

**Status**: Schema ready, not yet implemented in UI

---

## Database Migrations

### Initial Migration

The initial migration creates all tables with proper relationships and constraints.

**Location**: `prisma/migrations/000_init/migration.sql`

**To apply migrations**:
```bash
npx prisma migrate dev
```

**To reset database** (⚠️ deletes all data):
```bash
npx prisma migrate reset
```

---

## Query Patterns

### Get All Patients for Doctor

```typescript
const patients = await prisma.patient.findMany({
  where: { doctorId: doctor.id },
  orderBy: { name: "asc" }
});
```

### Get Patient with Consultations

```typescript
const patient = await prisma.patient.findFirst({
  where: { id, doctorId: doctor.id },
  include: {
    consultations: {
      orderBy: { date: "desc" },
      take: 10
    }
  }
});
```

### Get Recent Consultations

```typescript
const consultations = await prisma.consultation.findMany({
  where: { doctorId: doctor.id },
  orderBy: { date: "desc" },
  take: 5,
  include: {
    patient: {
      select: { name: true }
    }
  }
});
```

### Count Statistics

```typescript
const [patientCount, consultationCount] = await Promise.all([
  prisma.patient.count({
    where: { doctorId: doctor.id }
  }),
  prisma.consultation.count({
    where: { doctorId: doctor.id }
  })
]);
```

---

## Data Isolation

**Critical**: All queries must filter by `doctorId` to ensure data isolation.

**✅ Correct**:
```typescript
const patient = await prisma.patient.findFirst({
  where: { id, doctorId: doctor.id }  // Always filter by doctorId
});
```

**❌ Incorrect**:
```typescript
const patient = await prisma.patient.findUnique({
  where: { id }  // Missing doctorId filter - security risk!
});
```

---

## Indexes

Prisma automatically creates indexes for:
- Primary keys (`id`)
- Unique fields (`email`, `token`)
- Foreign keys (`doctorId`, `patientId`)

**Recommended additional indexes** (if needed for performance):
```prisma
// In schema.prisma
model Consultation {
  // ...
  @@index([doctorId, date])  // For dashboard queries
}
```

---

## Data Types

### Strings
- `String`: Variable-length text
- `String?`: Optional variable-length text

### Numbers
- `Int`: 32-bit integer
- `Int?`: Optional 32-bit integer

### Dates
- `DateTime`: Timestamp with timezone
- `@default(now())`: Automatically set to current time

### Booleans
- `Boolean`: true/false
- `@default(true)`: Default value

---

## Constraints

### Foreign Key Constraints

All foreign keys have `onDelete` and `onUpdate` behavior (defaults to `Restrict`):

- Deleting a `Doctor` would fail if they have patients/consultations
- Deleting a `Patient` would fail if they have consultations
- Deleting a `Consultation` would delete associated `FollowUpPlan`

### Unique Constraints

- `Doctor.email`: Must be unique
- `NfcToken.token`: Must be unique
- `FollowUpPlan.consultationId`: One-to-one relationship
- `Alert.checkInId`: One-to-one relationship

---

## Seeding (Optional)

To seed the database with test data:

1. Create `prisma/seed.ts`
2. Add seed script to `package.json`:
   ```json
   "prisma": {
     "seed": "ts-node prisma/seed.ts"
   }
   ```
3. Run: `npx prisma db seed`

---

## Backup & Restore

### Backup

```bash
pg_dump -U user -d clinicsync > backup.sql
```

### Restore

```bash
psql -U user -d clinicsync < backup.sql
```

---

## Performance Considerations

1. **Use `select` instead of `include`** when you only need specific fields
2. **Limit results** with `take` for lists
3. **Use `findFirst`** instead of `findMany` when you only need one result
4. **Add indexes** for frequently queried fields
5. **Use `Promise.all`** for parallel queries

---

## Future Schema Changes

When adding new features:

1. **Update `schema.prisma`**
2. **Create migration**: `npx prisma migrate dev --name feature_name`
3. **Generate Prisma Client**: `npx prisma generate`
4. **Update TypeScript types** (auto-generated)

**Never** edit migration files directly after they've been applied to production!

