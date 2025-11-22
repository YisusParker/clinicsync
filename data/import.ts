/**
 * Script para importar datos de prueba desde CSVs a la base de datos
 * 
 * Uso: npx tsx data/import.ts
 * 
 * Requisitos:
 * - Instalar: npm install csv-parser
 * - Las contraseñas de doctores deben estar hasheadas en el CSV
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface CSVRow {
  [key: string]: string;
}

async function readCSV(filePath: string): Promise<CSVRow[]> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    quote: '"',
    escape: '"',
  }) as CSVRow[];
  return records;
}

async function importDoctors(): Promise<number[]> {
  console.log('📋 Importando doctores...');
  const doctors = await readCSV(path.join(__dirname, 'doctors.csv'));
  const doctorIds: number[] = [];
  
  for (const doctor of doctors) {
    const result = await prisma.doctor.upsert({
      where: { email: doctor.email },
      update: {
        name: doctor.name,
        password: doctor.password,
      },
      create: {
        name: doctor.name,
        email: doctor.email,
        password: doctor.password,
      },
    });
    doctorIds.push(result.id);
  }
  console.log(`✅ ${doctors.length} doctores importados`);
  return doctorIds;
}

async function importPatients(doctorIds: number[]): Promise<number[]> {
  console.log('📋 Importando pacientes...');
  const patients = await readCSV(path.join(__dirname, 'patients.csv'));
  const patientIds: number[] = [];
  
  for (const patient of patients) {
    const doctorIndex = parseInt(patient.doctorId) - 1; // Convert 1-based to 0-based index
    if (doctorIndex < 0 || doctorIndex >= doctorIds.length) {
      throw new Error(`Invalid doctorId ${patient.doctorId} for patient ${patient.name}. Valid range: 1-${doctorIds.length}`);
    }
    const actualDoctorId = doctorIds[doctorIndex];
    
    const result = await prisma.patient.create({
      data: {
        name: patient.name,
        email: patient.email || null,
        doctorId: actualDoctorId,
        bloodType: patient.bloodType || null,
        allergies: patient.allergies || null,
        medications: patient.medications || null,
        emergencyPhone: patient.emergencyPhone || null,
      },
    });
    patientIds.push(result.id);
  }
  console.log(`✅ ${patients.length} pacientes importados`);
  return patientIds;
}

async function importConsultations(doctorIds: number[], patientIds: number[]): Promise<number[]> {
  console.log('📋 Importando consultas...');
  const consultations = await readCSV(path.join(__dirname, 'consultations.csv'));
  const consultationIds: number[] = [];
  
  for (const consultation of consultations) {
    const doctorIndex = parseInt(consultation.doctorId) - 1;
    const patientIndex = parseInt(consultation.patientId) - 1;
    
    if (doctorIndex < 0 || doctorIndex >= doctorIds.length) {
      throw new Error(`Invalid doctorId ${consultation.doctorId} in consultation. Valid range: 1-${doctorIds.length}`);
    }
    if (patientIndex < 0 || patientIndex >= patientIds.length) {
      throw new Error(`Invalid patientId ${consultation.patientId} in consultation. Valid range: 1-${patientIds.length}`);
    }
    
    const result = await prisma.consultation.create({
      data: {
        date: new Date(consultation.date),
        summary: consultation.summary,
        doctorId: doctorIds[doctorIndex],
        patientId: patientIds[patientIndex],
      },
    });
    consultationIds.push(result.id);
  }
  console.log(`✅ ${consultations.length} consultas importadas`);
  return consultationIds;
}

async function importFollowUpPlans(consultationIds: number[]): Promise<Map<number, number>> {
  console.log('📋 Importando planes de seguimiento...');
  const plans = await readCSV(path.join(__dirname, 'followup_plans.csv'));
  // Map from consultationId (1-based CSV index) to actual plan database ID
  const consultationIdToPlanId = new Map<number, number>();
  
  for (const plan of plans) {
    const consultationIndex = parseInt(plan.consultationId) - 1;
    
    if (consultationIndex < 0 || consultationIndex >= consultationIds.length) {
      throw new Error(`Invalid consultationId ${plan.consultationId} in follow-up plan. Valid range: 1-${consultationIds.length}`);
    }
    
    const result = await prisma.followUpPlan.create({
      data: {
        consultationId: consultationIds[consultationIndex],
        active: plan.active === 'true',
      },
    });
    // Map the CSV consultationId (1-based) to the actual plan database ID
    consultationIdToPlanId.set(parseInt(plan.consultationId), result.id);
  }
  console.log(`✅ ${plans.length} planes de seguimiento importados`);
  return consultationIdToPlanId;
}

async function importCheckIns(consultationIdToPlanId: Map<number, number>, patientIds: number[]): Promise<number[]> {
  console.log('📋 Importando check-ins...');
  const checkIns = await readCSV(path.join(__dirname, 'checkins.csv'));
  const checkInIds: number[] = [];
  
  for (const checkIn of checkIns) {
    const planConsultationId = parseInt(checkIn.planId); // This is actually a consultationId
    const patientIndex = parseInt(checkIn.patientId) - 1;
    
    const actualPlanId = consultationIdToPlanId.get(planConsultationId);
    if (!actualPlanId) {
      throw new Error(`Invalid planId ${checkIn.planId} in check-in. No follow-up plan found for consultationId ${planConsultationId}`);
    }
    
    if (patientIndex < 0 || patientIndex >= patientIds.length) {
      throw new Error(`Invalid patientId ${checkIn.patientId} in check-in. Valid range: 1-${patientIds.length}`);
    }
    
    const result = await prisma.checkIn.create({
      data: {
        planId: actualPlanId,
        patientId: patientIds[patientIndex],
        createdAt: new Date(checkIn.createdAt),
        symptomScore: parseInt(checkIn.symptomScore),
        notes: checkIn.notes || null,
      },
    });
    checkInIds.push(result.id);
  }
  console.log(`✅ ${checkIns.length} check-ins importados`);
  return checkInIds;
}

async function importAlerts(checkInIds: number[]) {
  console.log('📋 Importando alertas...');
  const alerts = await readCSV(path.join(__dirname, 'alerts.csv'));
  
  for (const alert of alerts) {
    const checkInIndex = parseInt(alert.checkInId) - 1;
    
    if (checkInIndex < 0 || checkInIndex >= checkInIds.length) {
      throw new Error(`Invalid checkInId ${alert.checkInId} in alert. Valid range: 1-${checkInIds.length}`);
    }
    
    await prisma.alert.create({
      data: {
        checkInId: checkInIds[checkInIndex],
        createdAt: new Date(alert.createdAt),
        resolved: alert.resolved === 'true',
      },
    });
  }
  console.log(`✅ ${alerts.length} alertas importadas`);
}

async function importNfcTokens(patientIds: number[]) {
  console.log('📋 Importando tokens NFC...');
  const tokens = await readCSV(path.join(__dirname, 'nfc_tokens.csv'));
  
  for (const token of tokens) {
    const patientIndex = parseInt(token.patientId) - 1;
    
    if (patientIndex < 0 || patientIndex >= patientIds.length) {
      throw new Error(`Invalid patientId ${token.patientId} in NFC token. Valid range: 1-${patientIds.length}`);
    }
    
    await prisma.nfcToken.upsert({
      where: { token: token.token },
      update: {
        patientId: patientIds[patientIndex],
        active: token.active === 'true',
      },
      create: {
        token: token.token,
        patientId: patientIds[patientIndex],
        createdAt: new Date(token.createdAt),
        active: token.active === 'true',
      },
    });
  }
  console.log(`✅ ${tokens.length} tokens NFC importados`);
}

async function main() {
  try {
    console.log('🚀 Iniciando importación de datos de prueba...\n');
    
    const doctorIds = await importDoctors();
    const patientIds = await importPatients(doctorIds);
    const consultationIds = await importConsultations(doctorIds, patientIds);
    const consultationIdToPlanId = await importFollowUpPlans(consultationIds);
    const checkInIds = await importCheckIns(consultationIdToPlanId, patientIds);
    await importAlerts(checkInIds);
    await importNfcTokens(patientIds);
    
    console.log('\n✨ Importación completada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

