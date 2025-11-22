# Datos de Prueba para ClinicSync

Este directorio contiene archivos CSV con datos de prueba para poblar la base de datos.

## Archivos Disponibles

- `doctors.csv` - 4 doctores de prueba
- `patients.csv` - 12 pacientes de prueba
- `consultations.csv` - 12 consultas de prueba
- `followup_plans.csv` - 6 planes de seguimiento
- `checkins.csv` - 11 check-ins de pacientes
- `alerts.csv` - 2 alertas generadas
- `nfc_tokens.csv` - 12 tokens NFC (uno por paciente)

## ⚠️ Importante: Contraseñas de Doctores

Las contraseñas en `doctors.csv` son placeholders. **Debes generar contraseñas hasheadas** antes de importar.

### Opción 1: Usar bcrypt para generar contraseñas

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 10).then(hash => console.log(hash));"
```

### Opción 2: Crear doctores manualmente

Puedes crear los doctores a través de la interfaz de registro de la aplicación, y luego importar el resto de los datos.

## Orden de Importación

Debes importar los datos en este orden debido a las relaciones (foreign keys):

1. **doctors.csv** - Primero (no tiene dependencias)
2. **patients.csv** - Requiere `doctorId`
3. **consultations.csv** - Requiere `doctorId` y `patientId`
4. **followup_plans.csv** - Requiere `consultationId`
5. **checkins.csv** - Requiere `planId` y `patientId`
6. **alerts.csv** - Requiere `checkInId`
7. **nfc_tokens.csv** - Requiere `patientId`

## Métodos de Importación

### Opción 1: Usando Prisma Studio

1. Abre Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Para cada tabla:
   - Haz clic en el botón "Add record"
   - Copia los datos del CSV manualmente o usa la función de importación si está disponible

### Opción 2: Usando SQL directo (PostgreSQL)

```sql
-- Importar doctors (después de hashear contraseñas)
COPY "Doctor" (name, email, password)
FROM '/ruta/a/data/doctors.csv'
DELIMITER ','
CSV HEADER;

-- Importar patients
COPY "Patient" (name, email, "doctorId", "bloodType", allergies, medications, "emergencyPhone")
FROM '/ruta/a/data/patients.csv'
DELIMITER ','
CSV HEADER;

-- Importar consultations
COPY "Consultation" (date, summary, "doctorId", "patientId")
FROM '/ruta/a/data/consultations.csv'
DELIMITER ','
CSV HEADER;

-- Importar followup_plans
COPY "FollowUpPlan" ("consultationId", active)
FROM '/ruta/a/data/followup_plans.csv'
DELIMITER ','
CSV HEADER;

-- Importar checkins
COPY "CheckIn" ("planId", "patientId", "createdAt", "symptomScore", notes)
FROM '/ruta/a/data/checkins.csv'
DELIMITER ','
CSV HEADER;

-- Importar alerts
COPY "Alert" ("checkInId", "createdAt", resolved)
FROM '/ruta/a/data/alerts.csv'
DELIMITER ','
CSV HEADER;

-- Importar nfc_tokens
COPY "NfcToken" (token, "patientId", "createdAt", active)
FROM '/ruta/a/data/nfc_tokens.csv'
DELIMITER ','
CSV HEADER;
```

### Opción 3: Script de Importación Automático (Recomendado)

Se incluye un script de importación en `data/import.ts` que importa todos los datos en el orden correcto.

**Requisitos:**
```bash
npm install csv-parse
npm install -D tsx  # Si no lo tienes instalado
```

**Uso:**
```bash
# Primero, asegúrate de hashear las contraseñas en doctors.csv
# Luego ejecuta:
npx tsx data/import.ts
```

El script:
- ✅ Importa todos los datos en el orden correcto
- ✅ Maneja las relaciones automáticamente
- ✅ Usa `upsert` para doctores (evita duplicados)
- ✅ Muestra progreso durante la importación

## Notas sobre los Datos

- **Doctores**: Las contraseñas deben ser hasheadas con bcrypt antes de importar
- **Pacientes**: Distribuidos entre los 4 doctores (3 pacientes por doctor)
- **Consultas**: Fechas desde enero 2024 hasta febrero 2024
- **Check-ins**: Algunos tienen scores altos que generan alertas
- **Tokens NFC**: Formato `NFC` seguido de números únicos

## Credenciales de Prueba (después de importar)

Si usas las contraseñas hasheadas correctamente, puedes crear estas cuentas:

- Email: `maria.gonzalez@clinicsync.com` / Password: `password123`
- Email: `carlos.ramirez@clinicsync.com` / Password: `password123`
- Email: `ana.martinez@clinicsync.com` / Password: `password123`
- Email: `luis.fernandez@clinicsync.com` / Password: `password123`

**Nota**: Necesitas hashear estas contraseñas antes de importar.

