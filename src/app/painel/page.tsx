import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { carregarUsuario, salvarPerfil } from '@/lib/server/repos';
import { ehAdminPlataforma } from '@/lib/server/admin';
import { contarUsuariosDoTenant } from '@/lib/server/conta';
import { obterPlano } from '@/lib/planos';
import { UploadImagem } from '@/components/UploadImagem';
import { CabecalhoPerfil } from '@/components/CabecalhoPerfil';
import { Icon } from '@/components/Icon';
import { ExcluirContaBotao } from '@/components/ExcluirContaBotao';

export const metadata = { title: 'Meu painel' };

// Tipos de perfil disponíveis (qualquer usuário pode alternar entre eles).
const TIPOS_PERFIL = [
  { v: 'candidato', r: 'Candidato (busca trabalho)' },
  { v: 'empresa_contratante', r: 'Empresa / Contratante' },
  { v: 'vendedor', r: 'Vendedor / Prestador' },
  { v: 'comprador', r: 'Comprador' },
];

export default async function PainelPage({
  searchParams,
}: {
  searchParams?: { salvo?: string; erro?: string };
}) {
  const ctx = await obterContexto();
  if (!ctx) redirect('/entrar?proximo=/painel');

  const u = await carregarUsuario(ctx.tenantId, ctx.userId);
  if (!u) redirect('/entrar');

  async function salvar(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual) redirect('/entrar');
    // Tipo de perfil restrito às opções válidas.
    const tipoBruto = String(formData.get('tipo') ?? '');
    const tipo = TIPOS_PERFIL.some((t) => t.v === tipoBruto) ? tipoBruto : '';
    const r = await salvarPerfil(atual.tenantId, atual.userId, {
      nome: String(formData.get('nome') ?? '').trim(),
      tipo,
      email: String(formData.get('email') ?? '').trim(),
      senha: String(formData.get('senha') ?? ''),
      areaAtuacao: String(formData.get('areaAtuacao') ?? ''),
      regiao: String(formData.get('regiao') ?? ''),
      bio: String(formData.get('bio') ?? ''),
      avatarUrl: String(formData.get('avatarUrl') ?? '').trim(),
      bannerUrl: String(formData.get('bannerUrl') ?? '').trim(),
      representa: String(formData.get('representa') ?? '').trim(),
      visibilidadePublica: String(formData.get('visibilidadePublica') ?? '') === 'on',
    });
    redirect(r.ok ? '/painel?salvo=1' : `/painel?erro=${encodeURIComponent(r.erro ?? 'Falha ao salvar.')}`);
  }

  const plano = obterPlano(u.plano);
  const completude = calcularCompletude(u);
  const admin = ehAdminPlataforma(ctx.email);
  const totalUsuarios = await contarUsuariosDoTenant(ctx.tenantId);

  return (
    <div className="container-app py-12">
      {/* Admin da plataforma — no TOPO, bem visível (só superadmin). */}
      {admin && (
        <Link
          href="/admin"
          className="mb-6 flex items-center justify-between rounded-xl border border-ink-900 bg-ink-950 px-4 py-3 text-creme"
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <Icon name="shield" size={18} className="text-marca-300" />
            Painel do admin da plataforma — moderação, edições e reparos
          </span>
          <span className="text-sm font-semibold text-marca-300">Abrir →</span>
        </Link>
      )}

      {/* Cabeçalho social (banner + foto), como no feed */}
      <div className="mb-6">
        <CabecalhoPerfil
          id={u.id}
          nome={u.nome}
          avatarUrl={u.avatarUrl}
          bannerUrl={u.perfil?.bannerUrl}
          subtitulo={u.perfil?.areaAtuacao || u.email}
          acaoHref={`/perfil/${u.id}`}
          acaoRotulo="Ver perfil público"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-tinta">
            Olá, {u.nome.split(' ')[0]}
          </h1>
          <p className="text-slate-500">
            {u.email} · papel <strong className="capitalize">{u.papel.replace('_', ' ')}</strong>
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-marca-600">{completude}%</div>
          <div className="text-xs font-semibold text-slate-400">perfil completo</div>
        </div>
      </div>

      {searchParams?.salvo && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Perfil salvo.
        </p>
      )}
      {searchParams?.erro && (
        <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {searchParams.erro}
        </p>
      )}

      {/* Plano atual */}
      <div className="cartao mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span
            className={`selo ${plano.prime ? 'bg-marca-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {plano.nome}
          </span>
          <p className="mt-2 text-sm text-slate-600">
            {plano.prime
              ? 'IA de classificação de currículos e visibilidade direcionada ativas.'
              : 'Assine o Prime para a IA ranquear seus currículos e ampliar seu alcance.'}
          </p>
        </div>
        {plano.prime ? (
          <Link href="/painel/prime" className="btn-primario !py-2">
            Painel de visibilidade
          </Link>
        ) : (
          <Link href="/planos" className="btn-primario !py-2">
            Conhecer o Prime
          </Link>
        )}
      </div>

      {/* Atalhos */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Atalho href="/painel/vagas" titulo="Minhas vagas" desc="Publicar e gerir vagas, ver candidatos." />
        <Atalho href="/painel/vitrine" titulo="Minha vitrine" desc="Produtos/serviços com visibilidade por plano." />
        <Atalho href="/painel/agenda" titulo="Agenda e calls" desc="Reuniões, entrevistas e negociações com sala de call." />
        <Atalho href="/painel/chat" titulo="Chat" desc="Converse e envie convites de reunião na conversa." />
        <Atalho href="/painel/crm" titulo="CRM" desc="Capte clientes (link, perfil, vitrine) e gerencie o funil." />
        <Atalho href="/painel/clientes" titulo="Clientes" desc="Negócios fechados, registrados automaticamente do funil." />
        <Atalho href="/painel/grupos" titulo="Grupos" desc="Comunidades por setor e região." />
        <Atalho href="/painel/propostas" titulo="Propostas" desc="Gere propostas e link em PDF para o cliente." />
        <Atalho href="/ranking" titulo="Ranking" desc="Engajamento e recompensas por atividade." />
        <Atalho href="/painel/prime" titulo="Ranking por IA" desc="Currículos pontuados e métricas." />
        <Atalho href="/perfil" titulo="Buscar perfis" desc="Diretório de empresas, profissionais e candidatos." />
        <Atalho href="/vitrine" titulo="Vitrine" desc="Marketplace de produtos e serviços." />
      </div>

      <form action={salvar} className="cartao mt-8 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="font-bold text-tinta">Editar perfil público</h2>
          <p className="text-xs text-slate-500">
            Edite seu nome, tipo de perfil, foto e banner — valem para qualquer tipo de conta.
          </p>
        </div>

        <Campo nome="nome" rotulo="Nome (ou nome da marca/empresa)" valor={u.nome} />

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Tipo de perfil</span>
          <select
            name="tipo"
            defaultValue={u.perfil?.tipo ?? 'empresa_contratante'}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
          >
            {TIPOS_PERFIL.map((t) => (
              <option key={t.v} value={t.v}>
                {t.r}
              </option>
            ))}
          </select>
        </label>

        <Campo nome="email" rotulo="E-mail (login)" valor={u.email} tipo="email" />

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">
            Nova senha (deixe em branco para manter)
          </span>
          <input
            type="password"
            name="senha"
            autoComplete="new-password"
            placeholder="8+ caracteres, maiúscula, número e especial"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
          />
        </label>

        {/* Pré-visualização banner + avatar */}
        <div className="sm:col-span-2">
          <div className="relative aspect-[29/10] w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-ink-900 to-ink-700">
            {u.perfil?.bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.perfil.bannerUrl} alt="banner" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-xs text-white/60">
                Banner recomendado: 1750×570 a 1900×680
              </span>
            )}
            <div className="absolute -bottom-6 left-4 h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-marca-100">
              {u.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-lg font-black text-marca-700">
                  {u.nome.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div className="h-7" />
        </div>

        <UploadImagem
          name="avatarUrl"
          label="Foto de perfil (sua ou da marca/empresa)"
          defaultUrl={u.avatarUrl}
          formato="avatar"
        />
        <UploadImagem
          name="bannerUrl"
          label="Banner (1750×570 a 1900×680)"
          defaultUrl={u.perfil?.bannerUrl ?? ''}
          formato="banner"
        />
        <Campo nome="representa" rotulo="Marca/empresa que representa (opcional)" valor={u.perfil?.representa ?? ''} />
        <Campo nome="areaAtuacao" rotulo="Área de atuação" valor={u.perfil?.areaAtuacao ?? ''} />
        <Campo nome="regiao" rotulo="Região" valor={u.perfil?.regiao ?? ''} />

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Bio</span>
          <textarea
            name="bio"
            defaultValue={u.perfil?.bio ?? ''}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
          />
        </label>

        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            name="visibilidadePublica"
            defaultChecked={u.perfil?.visibilidadePublica ?? true}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm text-slate-600">
            Aparecer na busca pública de perfis (<Link href="/perfil" className="font-semibold text-marca-600">ver diretório</Link>)
          </span>
        </label>

        <div className="sm:col-span-2">
          <button className="btn-primario">Salvar perfil</button>
        </div>
      </form>

      {/* Zona de perigo */}
      <div className="cartao mt-8 border-rose-200">
        <h2 className="font-bold text-rose-700">Zona de perigo</h2>
        <p className="mt-1 text-sm text-slate-600">
          {totalUsuarios <= 1
            ? 'Você é o único usuário deste negócio — excluir sua conta apaga o negócio inteiro e todos os dados.'
            : 'Exclua sua conta e seus dados pessoais deste negócio. Esta ação não pode ser desfeita.'}
        </p>
        <div className="mt-3">
          <ExcluirContaBotao email={u.email} apagaNegocio={totalUsuarios <= 1} />
        </div>
      </div>
    </div>
  );
}

function calcularCompletude(u: {
  nome: string;
  email: string;
  perfil: { areaAtuacao: string; regiao: string; bio: string } | null;
}): number {
  const campos = [u.nome, u.email, u.perfil?.areaAtuacao, u.perfil?.regiao, u.perfil?.bio];
  const preenchidos = campos.filter((c) => c && c.trim().length > 0).length;
  return Math.round((preenchidos / campos.length) * 100);
}

function Atalho({ href, titulo, desc }: { href: string; titulo: string; desc: string }) {
  return (
    <Link href={href} className="cartao block">
      <h3 className="font-bold text-tinta">{titulo}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
      <span className="mt-2 inline-block text-sm font-semibold text-marca-600">Abrir →</span>
    </Link>
  );
}

function Campo({
  nome,
  rotulo,
  valor,
  tipo = 'text',
}: {
  nome: string;
  rotulo: string;
  valor: string;
  tipo?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{rotulo}</span>
      <input
        name={nome}
        type={tipo}
        defaultValue={valor}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-100"
      />
    </label>
  );
}
