import Link from 'next/link';

export const metadata = { title: 'Diretrizes da comunidade' };

const REGRAS: { titulo: string; texto: string }[] = [
  {
    titulo: '1. Respeito acima de tudo',
    texto:
      'Não toleramos linguajar ofensivo, ataques pessoais, assédio, discurso de ódio ou discriminação por raça, gênero, religião, orientação ou qualquer outra condição.',
  },
  {
    titulo: '2. Nada de conteúdo apelativo ou sexual',
    texto:
      'É proibido publicar conteúdo sexual explícito, nudez, pornografia ou material apelativo. Esta é uma plataforma profissional de negócios.',
  },
  {
    titulo: '3. Sem spam, golpes ou desinformação',
    texto:
      'Não publique correntes, esquemas de pirâmide, links maliciosos, propaganda enganosa ou informação comprovadamente falsa.',
  },
  {
    titulo: '4. Conteúdo legal e autoral',
    texto:
      'Publique apenas conteúdo que você tem o direito de compartilhar. Respeite marcas, direitos autorais e a privacidade de terceiros.',
  },
  {
    titulo: '5. Moderação',
    texto:
      'Publicações com linguajar proibido são bloqueadas automaticamente. Qualquer pessoa pode denunciar uma publicação pelo menu (⋯). A equipe de administração revisa as denúncias e pode remover conteúdo, suspender ou excluir perfis que violem estas diretrizes.',
  },
];

export default function DiretrizesPage() {
  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-2xl">
        <span className="selo bg-ink-900 text-creme">Comunidade</span>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-tinta">
          Diretrizes da comunidade
        </h1>
        <p className="mt-2 text-slate-600">
          Para manter a DRAP Business um ambiente profissional e seguro, todos os perfis concordam
          com as regras abaixo ao publicar.
        </p>

        <div className="mt-8 space-y-5">
          {REGRAS.map((r) => (
            <div key={r.titulo} className="cartao">
              <h2 className="font-black text-tinta">{r.titulo}</h2>
              <p className="mt-1 text-sm text-slate-600">{r.texto}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Encontrou algo que viola estas diretrizes? Use o menu (⋯) da publicação e clique em
          “Denunciar”. {' '}
          <Link href="/feed" className="font-semibold text-marca-600 hover:underline">
            Voltar ao feed
          </Link>
        </p>
      </div>
    </div>
  );
}
