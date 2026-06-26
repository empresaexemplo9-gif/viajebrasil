import { Suspense } from 'react';
import { Formulario } from './Formulario';

export const metadata = { title: 'Entrar' };
// Renderiza por request (não pré-renderiza no build) — evita o erro de
// useSearchParams sem Suspense durante a geração estática.
export const dynamic = 'force-dynamic';

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <Formulario />
    </Suspense>
  );
}
