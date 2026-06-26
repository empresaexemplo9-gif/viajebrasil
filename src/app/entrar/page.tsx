import { Suspense } from 'react';
import { Formulario } from './Formulario';

export const metadata = { title: 'Entrar' };

export default function EntrarPage() {
  const provedores = {
    google: Boolean(process.env.GOOGLE_CLIENT_ID),
    linkedin: Boolean(process.env.LINKEDIN_CLIENT_ID),
  };
  return (
    <Suspense>
      <Formulario provedores={provedores} />
    </Suspense>
  );
}
