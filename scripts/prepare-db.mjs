/**
 * Preparação do banco no build da Vercel — sem precisar de terminal local.
 *
 * Se DATABASE_URL existir e o banco estiver acessível, aplica o schema
 * (prisma db push) e roda o seed idempotente. Qualquer falha é apenas
 * registrada (não derruba o build), para que as páginas públicas subam mesmo
 * antes do banco estar configurado.
 */
import { execSync } from 'node:child_process';

if (!process.env.DATABASE_URL) {
  console.warn('[prepare-db] DATABASE_URL ausente — pulando db push/seed (configure o Postgres na Vercel).');
  process.exit(0);
}

try {
  console.log('[prepare-db] aplicando schema (prisma db push)…');
  execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
  console.log('[prepare-db] rodando seed idempotente…');
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
  console.log('[prepare-db] banco pronto.');
} catch (e) {
  console.warn('[prepare-db] não consegui preparar o banco (o build segue):', e?.message ?? e);
}
