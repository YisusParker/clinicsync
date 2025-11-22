# ClinicSync MVP

A minimalistic but high-impact medical platform designed for independent doctors and small clinics in Latin America. ClinicSync modernizes healthcare workflows with a polished, trustworthy, and professional system that feels as seamless as modern SaaS while remaining lightweight enough for rapid iteration and future scalability.

## 🎯 Overview

ClinicSync MVP focuses on the essentials that deliver immediate value to doctors:

- **Account Management**: Secure registration and login with session handling
- **Dashboard**: Real-time overview of patients, consultations, and activity
- **Patient Management**: Complete CRUD operations for patient records
- **Consultation Tracking**: Store and manage visit summaries
- **Future-Ready Foundation**: Database schema prepared for NFC tokens, vitals monitoring, treatment plans, and AI-supported features

## 🎨 Design Philosophy

The product follows a clean, modern, healthcare-oriented aesthetic:

- **Bright, trustworthy medical branding** (blue `#0A6CBD` + green `#29B86F` accents)
- **White surfaces** with gentle shadows and rounded cards
- **Hierarchical typography** for clarity
- **App-like interfaces** rather than form-heavy designs
- **Zero visual noise** - everything feels intentional and calm

The UI communicates:
- ✅ Reliability
- ✅ Professionalism
- ✅ Simplicity
- ✅ Efficiency
- ✅ Premium digital experience

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

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
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/clinicsync"
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
clinicsync/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   │   ├── authcard.tsx     # Login/Register component
│   │   ├── layout.tsx       # Auth layout
│   │   └── page.tsx         # Auth page
│   ├── (platform)/          # Protected platform routes
│   │   ├── dashboard/       # Dashboard page
│   │   ├── patients/        # Patient management
│   │   │   ├── page.tsx     # Patient list
│   │   │   ├── new/         # Create patient
│   │   │   └── [id]/        # Patient detail & edit
│   │   └── consultations/  # Consultation management
│   │       ├── new/         # Create consultation
│   │       └── [id]/        # Consultation detail
│   ├── layout.tsx            # Root layout
│   └── styles/              # Global styles
├── lib/                      # Server actions & utilities
│   ├── auth.ts              # Authentication functions
│   ├── patients.ts          # Patient CRUD operations
│   ├── consultations.ts    # Consultation CRUD operations
│   └── db.ts                # Prisma client instance
├── prisma/                   # Database schema & migrations
│   ├── schema.prisma        # Prisma schema
│   └── migrations/          # Database migrations
└── public/                   # Static assets
    └── logo.png             # ClinicSync logo
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 12.23
- **Icons**: Lucide React 0.554
- **Authentication**: bcryptjs for password hashing
- **Session Management**: HTTP-only cookies

## 📋 Features

### ✅ Implemented (MVP)

#### Authentication
- [x] Doctor registration with email validation
- [x] Secure login with password hashing (bcryptjs)
- [x] Session management with HTTP-only cookies
- [x] Protected routes with automatic redirects
- [x] Logout functionality

#### Dashboard
- [x] Real-time patient count
- [x] Consultation statistics
- [x] Active follow-up plans count
- [x] Recent consultations list
- [x] Empty states for new users

#### Patient Management
- [x] Create new patients
- [x] View patient list with search
- [x] View patient details
- [x] Edit patient information
- [x] Patient medical information:
  - Name, email, emergency phone
  - Blood type
  - Allergies
  - Current medications
- [x] View patient consultation history

#### Consultation Management
- [x] Create consultations linked to patients
- [x] View consultation details
- [x] Consultation summaries
- [x] Date/time tracking
- [x] Patient context in consultations

### 🔮 Future Features (Schema Ready)

- [ ] NFC token quick-check-in
- [ ] Real-time vitals monitoring
- [ ] Treatment plans
- [ ] Automated follow-ups
- [ ] AI-supported diagnosis summaries
- [ ] Appointment scheduling
- [ ] Check-in system with alerts

## 🗄️ Database Schema

### Core Models

- **Doctor**: User accounts for medical professionals
- **Patient**: Patient records with medical information
- **Consultation**: Visit summaries and medical notes
- **FollowUpPlan**: Treatment follow-up plans (future)
- **CheckIn**: Patient check-ins for follow-ups (future)
- **Alert**: Alerts for concerning check-ins (future)
- **NfcToken**: NFC tokens for quick patient check-in (future)

See `prisma/schema.prisma` for complete schema definition.

## 🔐 Security

- **Password Hashing**: bcryptjs with salt rounds (10)
- **Session Cookies**: HTTP-only, secure in production, SameSite=Lax
- **Route Protection**: Server-side authentication checks
- **Data Isolation**: Doctors can only access their own patients/consultations
- **Input Validation**: Server-side validation for all forms

## 🎨 Design System

### Colors

```javascript
medical: {
  blue: "#0A6CBD",      // Primary actions, links
  "blue-dark": "#095a9d", // Hover states
  green: "#29B86F",      // Success actions, accents
  "green-dark": "#238f5a" // Hover states
}
```

### Typography

- **Headings**: Bold, hierarchical sizing (text-3xl, text-2xl, text-lg)
- **Body**: Regular weight, slate colors for readability
- **Labels**: Medium weight, smaller size (text-sm)

### Components

- **Cards**: White background, rounded-2xl, subtle shadows
- **Buttons**: Primary (blue) and secondary (green) variants
- **Inputs**: Rounded-xl, focus rings with medical blue
- **Icons**: Lucide React, consistent sizing

## 📝 API Reference

### Authentication (`lib/auth.ts`)

```typescript
// Register a new doctor
registerDoctor(formData: FormData): Promise<{ error?: string }>

// Login existing doctor
loginDoctor(formData: FormData): Promise<{ error?: string }>

// Logout current doctor
logoutDoctor(): Promise<void>

// Get current authenticated doctor
getCurrentDoctor(): Promise<Doctor | null>
```

### Patients (`lib/patients.ts`)

```typescript
// Get all patients for current doctor
getPatients(): Promise<Patient[]>

// Get single patient by ID
getPatient(id: number): Promise<Patient | null>

// Create new patient
createPatient(formData: FormData): Promise<{ error?: string }>

// Update patient
updatePatient(id: number, formData: FormData): Promise<{ error?: string }>

// Delete patient
deletePatient(id: number): Promise<{ error?: string }>
```

### Consultations (`lib/consultations.ts`)

```typescript
// Get all consultations for current doctor
getConsultations(): Promise<Consultation[]>

// Get recent consultations
getRecentConsultations(limit?: number): Promise<Consultation[]>

// Get single consultation by ID
getConsultation(id: number): Promise<Consultation | null>

// Create new consultation
createConsultation(formData: FormData): Promise<{ error?: string }>

// Update consultation
updateConsultation(id: number, formData: FormData): Promise<{ error?: string }>

// Delete consultation
deleteConsultation(id: number): Promise<{ error?: string }>

// Get dashboard statistics
getDashboardStats(): Promise<DashboardStats | null>
```

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database Management

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js config
- Prefer server components over client components
- Use server actions for form submissions
- Follow Next.js App Router conventions

## 🚢 Deployment

### Environment Variables

Required for production:

```env
DATABASE_URL="postgresql://..."
NODE_ENV="production"
```

### Build for Production

```bash
npm run build
npm start
```

### Recommended Platforms

- **Vercel**: Optimized for Next.js (recommended)
- **Railway**: Easy PostgreSQL + Next.js deployment
- **Render**: Simple deployment with PostgreSQL
- **Self-hosted**: Docker + PostgreSQL

## 📚 Additional Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

- ClinicSync Development Team

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Prisma for the powerful ORM
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icon set

---

**Built with ❤️ for healthcare professionals in Latin America**
