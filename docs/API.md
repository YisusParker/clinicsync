# ClinicSync API Reference

## Overview

ClinicSync uses Next.js Server Actions instead of traditional REST APIs. All server actions are located in the `lib/` directory and are marked with `"use server"`.

## Authentication API

### `registerDoctor`

Registers a new doctor account.

**Location**: `lib/auth.ts`

**Signature**:
```typescript
export async function registerDoctor(
  formData: FormData
): Promise<{ error?: string } | void>
```

**Form Fields**:
- `name` (string, required): Doctor's full name
- `email` (string, required): Doctor's email (must be unique)
- `password` (string, required): Password (min 6 characters)
- `confirm` (string, required): Password confirmation

**Returns**:
- `void` on success (redirects to `/dashboard`)
- `{ error: string }` on failure

**Example**:
```typescript
const formData = new FormData();
formData.append("name", "Dr. Juan Pérez");
formData.append("email", "juan@clinic.com");
formData.append("password", "secure123");
formData.append("confirm", "secure123");

const result = await registerDoctor(formData);
if (result?.error) {
  console.error(result.error);
}
```

**Errors**:
- `"Nombre, email y contraseña son obligatorios."` - Missing required fields
- `"La contraseña debe tener al menos 6 caracteres."` - Password too short
- `"Las contraseñas no coinciden."` - Passwords don't match
- `"Ya existe un doctor con este email."` - Email already registered

---

### `loginDoctor`

Logs in an existing doctor.

**Location**: `lib/auth.ts`

**Signature**:
```typescript
export async function loginDoctor(
  formData: FormData
): Promise<{ error?: string } | void>
```

**Form Fields**:
- `email` (string, required): Doctor's email
- `password` (string, required): Doctor's password

**Returns**:
- `void` on success (redirects to `/dashboard`)
- `{ error: string }` on failure

**Example**:
```typescript
const formData = new FormData();
formData.append("email", "juan@clinic.com");
formData.append("password", "secure123");

const result = await loginDoctor(formData);
if (result?.error) {
  console.error(result.error);
}
```

**Errors**:
- `"Email y contraseña son obligatorios."` - Missing fields
- `"Credenciales inválidas."` - Wrong email or password

---

### `logoutDoctor`

Logs out the current doctor.

**Location**: `lib/auth.ts`

**Signature**:
```typescript
export async function logoutDoctor(): Promise<void>
```

**Returns**: `void` (redirects to `/`)

**Example**:
```typescript
await logoutDoctor();
```

---

### `getCurrentDoctor`

Gets the currently authenticated doctor.

**Location**: `lib/auth.ts`

**Signature**:
```typescript
export async function getCurrentDoctor(): Promise<Doctor | null>
```

**Returns**:
- `Doctor` object with `{ id, name, email }` if authenticated
- `null` if not authenticated

**Example**:
```typescript
const doctor = await getCurrentDoctor();
if (doctor) {
  console.log(`Logged in as ${doctor.name}`);
}
```

---

## Patient API

### `getPatients`

Gets all patients for the current doctor.

**Location**: `lib/patients.ts`

**Signature**:
```typescript
export async function getPatients(): Promise<Patient[]>
```

**Returns**: Array of patient objects with:
- `id`, `name`, `email`, `bloodType`, `allergies`, `medications`, `emergencyPhone`
- `_count.consultations` - Number of consultations

**Example**:
```typescript
const patients = await getPatients();
patients.forEach(patient => {
  console.log(`${patient.name}: ${patient._count.consultations} consultations`);
});
```

**Note**: Automatically redirects to `/` if not authenticated.

---

### `getPatient`

Gets a single patient by ID.

**Location**: `lib/patients.ts`

**Signature**:
```typescript
export async function getPatient(id: number): Promise<Patient | null>
```

**Parameters**:
- `id` (number): Patient ID

**Returns**:
- `Patient` object with consultations included, or
- `null` if patient not found or doesn't belong to doctor

**Example**:
```typescript
const patient = await getPatient(1);
if (patient) {
  console.log(`Patient: ${patient.name}`);
  console.log(`Recent consultations: ${patient.consultations.length}`);
}
```

---

### `createPatient`

Creates a new patient.

**Location**: `lib/patients.ts`

**Signature**:
```typescript
export async function createPatient(
  formData: FormData
): Promise<{ error?: string } | void>
```

**Form Fields**:
- `name` (string, required): Patient's full name
- `email` (string, optional): Patient's email
- `bloodType` (string, optional): Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
- `allergies` (string, optional): Known allergies
- `medications` (string, optional): Current medications
- `emergencyPhone` (string, optional): Emergency contact phone

**Returns**:
- `void` on success (redirects to `/patients/{id}`)
- `{ error: string }` on failure

**Example**:
```typescript
const formData = new FormData();
formData.append("name", "María López");
formData.append("email", "maria@example.com");
formData.append("bloodType", "O+");
formData.append("allergies", "Penicilina");
formData.append("medications", "Metformina 500mg");
formData.append("emergencyPhone", "+52 555 123 4567");

const result = await createPatient(formData);
if (result?.error) {
  console.error(result.error);
}
```

**Errors**:
- `"No autorizado."` - Not authenticated
- `"El nombre es obligatorio."` - Name is required

---

### `updatePatient`

Updates an existing patient.

**Location**: `lib/patients.ts`

**Signature**:
```typescript
export async function updatePatient(
  id: number,
  formData: FormData
): Promise<{ error?: string } | void>
```

**Parameters**:
- `id` (number): Patient ID to update

**Form Fields**: Same as `createPatient`

**Returns**:
- `void` on success (redirects to `/patients/{id}`)
- `{ error: string }` on failure

**Example**:
```typescript
const formData = new FormData();
formData.append("name", "María López García");
formData.append("allergies", "Penicilina, Polen");

const result = await updatePatient(1, formData);
if (result?.error) {
  console.error(result.error);
}
```

**Errors**:
- `"No autorizado."` - Not authenticated
- `"Paciente no encontrado."` - Patient not found or doesn't belong to doctor
- `"El nombre es obligatorio."` - Name is required

---

### `deletePatient`

Deletes a patient.

**Location**: `lib/patients.ts`

**Signature**:
```typescript
export async function deletePatient(
  id: number
): Promise<{ error?: string } | void>
```

**Parameters**:
- `id` (number): Patient ID to delete

**Returns**:
- `void` on success (redirects to `/patients`)
- `{ error: string }` on failure

**Example**:
```typescript
const result = await deletePatient(1);
if (result?.error) {
  console.error(result.error);
}
```

**Errors**:
- `"No autorizado."` - Not authenticated
- `"Paciente no encontrado."` - Patient not found or doesn't belong to doctor

---

### `searchPatients`

Searches for patients using multiple criteria.

**Location**: `lib/patients.ts`

**Signature**:
```typescript
export async function searchPatients(
  query: string
): Promise<Patient[]>
```

**Parameters**:
- `query` (string): Search term (min 2 characters)

**Returns**: Array of patient objects matching the search criteria. Searches in:
- Name
- Email
- Emergency phone
- Blood type

**Note**: Returns empty array if query is less than 2 characters.

**Example**:
```typescript
const results = await searchPatients("María");
// Returns patients with "María" in name, email, or phone
```

---

### `getPatientQuickContext`

Gets quick context information for a patient (used in Quick Context Panel).

**Location**: `lib/patients.ts`

**Signature**:
```typescript
export async function getPatientQuickContext(
  id: number
): Promise<PatientContext | null>
```

**Parameters**:
- `id` (number): Patient ID

**Returns**:
```typescript
{
  id: number;
  name: string;
  email: string | null;
  bloodType: string | null;
  allergies: string | null;
  medications: string | null;
  emergencyPhone: string | null;
  consultations: Consultation[]; // Last 5 consultations
  _count: { consultations: number };
  daysSinceLastConsultation: number | null;
} | null
```

**Example**:
```typescript
const context = await getPatientQuickContext(1);
if (context) {
  console.log(`Last consultation: ${context.daysSinceLastConsultation} days ago`);
}
```

---

### `importPatientFromFile`

Imports a patient from an exported medical file.

**Location**: `lib/patients.ts`

**Signature**:
```typescript
export async function importPatientFromFile(
  fileContent: string,
  consultations: Array<{ date: string; summary: string }>
): Promise<{ error?: string; patientId?: number }>
```

**Parameters**:
- `fileContent` (string): Content of the exported medical file (.txt)
- `consultations` (array): Array of consultations to import

**Returns**:
- `{ patientId: number }` on success
- `{ error: string }` on failure

**Example**:
```typescript
const fileContent = await fs.readFile("patient.txt", "utf-8");
const result = await importPatientFromFile(fileContent, consultations);
if (result.error) {
  console.error(result.error);
} else {
  console.log(`Patient imported with ID: ${result.patientId}`);
}
```

**Errors**:
- `"No autorizado."` - Not authenticated
- `"No se pudo extraer el nombre del paciente del archivo."` - Invalid file format
- `"Error al importar el paciente. Verifica el formato del archivo."` - Import failed

---

## Consultation API

### `getConsultations`

Gets all consultations for the current doctor.

**Location**: `lib/consultations.ts`

**Signature**:
```typescript
export async function getConsultations(): Promise<Consultation[]>
```

**Returns**: Array of consultation objects with patient information included.

**Example**:
```typescript
const consultations = await getConsultations();
consultations.forEach(consultation => {
  console.log(`${consultation.patient.name}: ${consultation.summary}`);
});
```

---

### `getRecentConsultations`

Gets recent consultations (limited).

**Location**: `lib/consultations.ts`

**Signature**:
```typescript
export async function getRecentConsultations(
  limit?: number
): Promise<Consultation[]>
```

**Parameters**:
- `limit` (number, optional): Maximum number of consultations (default: 5)

**Returns**: Array of recent consultation objects.

**Example**:
```typescript
const recent = await getRecentConsultations(10);
console.log(`Found ${recent.length} recent consultations`);
```

---

### `getConsultation`

Gets a single consultation by ID.

**Location**: `lib/consultations.ts`

**Signature**:
```typescript
export async function getConsultation(
  id: number
): Promise<Consultation | null>
```

**Parameters**:
- `id` (number): Consultation ID

**Returns**:
- `Consultation` object with patient information, or
- `null` if consultation not found or doesn't belong to doctor

---

### `createConsultation`

Creates a new consultation.

**Location**: `lib/consultations.ts`

**Signature**:
```typescript
export async function createConsultation(
  formData: FormData
): Promise<{ error?: string } | void>
```

**Form Fields**:
- `patientId` (string, required): Patient ID (will be converted to number)
- `summary` (string, required): Consultation summary/notes
- `date` (string, optional): ISO datetime string (defaults to now)

**Returns**:
- `void` on success (redirects to `/consultations/{id}`)
- `{ error: string }` on failure

**Example**:
```typescript
const formData = new FormData();
formData.append("patientId", "1");
formData.append("summary", "Chequeo general. Presión arterial normal.");
formData.append("date", "2024-01-15T10:30:00");

const result = await createConsultation(formData);
if (result?.error) {
  console.error(result.error);
}
```

**Errors**:
- `"No autorizado."` - Not authenticated
- `"Paciente y resumen son obligatorios."` - Missing required fields
- `"Paciente no encontrado."` - Patient not found or doesn't belong to doctor

---

### `updateConsultation`

Updates an existing consultation.

**Location**: `lib/consultations.ts`

**Signature**:
```typescript
export async function updateConsultation(
  id: number,
  formData: FormData
): Promise<{ error?: string } | void>
```

**Parameters**:
- `id` (number): Consultation ID to update

**Form Fields**:
- `summary` (string, required): Updated consultation summary
- `date` (string, optional): Updated date (ISO datetime string)

**Returns**:
- `void` on success (redirects to `/consultations/{id}`)
- `{ error: string }` on failure

**Errors**:
- `"No autorizado."` - Not authenticated
- `"Consulta no encontrada."` - Consultation not found or doesn't belong to doctor
- `"El resumen es obligatorio."` - Summary is required

---

### `deleteConsultation`

Deletes a consultation.

**Location**: `lib/consultations.ts`

**Signature**:
```typescript
export async function deleteConsultation(
  id: number
): Promise<{ error?: string } | void>
```

**Parameters**:
- `id` (number): Consultation ID to delete

**Returns**:
- `void` on success (redirects to `/consultations`)
- `{ error: string }` on failure

---

### `getDashboardStats`

Gets dashboard statistics.

**Location**: `lib/consultations.ts`

**Signature**:
```typescript
export async function getDashboardStats(): Promise<DashboardStats | null>
```

**Returns**:
```typescript
{
  patientCount: number;
  consultationCount: number;
  recentConsultations: Consultation[];
  activePlans: number;
} | null
```

**Example**:
```typescript
const stats = await getDashboardStats();
if (stats) {
  console.log(`Patients: ${stats.patientCount}`);
  console.log(`Consultations: ${stats.consultationCount}`);
  console.log(`Active Plans: ${stats.activePlans}`);
}
```

---

## Type Definitions

### Doctor

```typescript
type Doctor = {
  id: number;
  name: string;
  email: string;
  // password is never returned
}
```

### Patient

```typescript
type Patient = {
  id: number;
  name: string;
  email: string | null;
  bloodType: string | null;
  allergies: string | null;
  medications: string | null;
  emergencyPhone: string | null;
  _count?: {
    consultations: number;
  };
  consultations?: Consultation[];
}
```

### Consultation

```typescript
type Consultation = {
  id: number;
  date: Date;
  summary: string;
  patient?: {
    id: number;
    name: string;
    email?: string | null;
    bloodType?: string | null;
    allergies?: string | null;
    medications?: string | null;
  };
}
```

---

## Error Handling

All server actions follow this pattern:

1. **Authentication Check**: Verify user is logged in
2. **Authorization Check**: Verify user owns the resource
3. **Validation**: Validate input data
4. **Operation**: Perform database operation
5. **Redirect**: Redirect on success, return error on failure

**Error Response Format**:
```typescript
{ error: "Error message in Spanish" }
```

**Success Response**:
- Server actions that succeed will redirect using Next.js `redirect()`
- This throws a special error that should not be caught
- The redirect happens automatically

---

## Usage in Components

### Server Components

```typescript
// app/(platform)/patients/page.tsx
import { getPatients } from "@/lib/patients";

export default async function PatientsPage() {
  const patients = await getPatients();
  // Render patients...
}
```

### Client Components with Forms

```typescript
// app/(platform)/patients/new/page.tsx
import { createPatient } from "@/lib/patients";

export default function NewPatientPage() {
  return (
    <form action={createPatient}>
      {/* Form fields */}
    </form>
  );
}
```

### With Error Handling

```typescript
"use client";

import { useState } from "react";
import { createPatient } from "@/lib/patients";

export default function NewPatientForm() {
  const [error, setError] = useState("");

  return (
    <form action={async (formData) => {
      const result = await createPatient(formData);
      if (result?.error) {
        setError(result.error);
      }
    }}>
      {error && <div>{error}</div>}
      {/* Form fields */}
    </form>
  );
}
```

---

## Security Notes

1. **All actions require authentication** (except register/login)
2. **Data is isolated by doctorId** - doctors can only access their own data
3. **Input validation** happens on the server
4. **Passwords are hashed** with bcryptjs
5. **Sessions use HTTP-only cookies** - not accessible via JavaScript

