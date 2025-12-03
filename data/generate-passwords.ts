/**
 * Script para generar contraseñas hasheadas para los doctores
 * 
 * Uso: npx tsx data/generate-passwords.ts
 * 
 * Esto generará las contraseñas hasheadas que puedes copiar al CSV de doctors
 */

import bcrypt from 'bcryptjs';

const password = 'password123'; // Contraseña por defecto para todos los doctores

async function generateHash() {
  const hash = await bcrypt.hash(password, 10);
  console.log('\n🔐 Contraseña hasheada:');
  console.log(hash);
  console.log('\n📋 Copia esta línea y reemplaza todas las contraseñas en doctors.csv:');
  console.log(`\nNota: La contraseña original es: ${password}`);
  console.log('Puedes cambiarla editando esta variable en el script.\n');
}

generateHash();


