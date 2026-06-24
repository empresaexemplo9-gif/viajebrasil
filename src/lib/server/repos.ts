/**
 * Repositórios de domínio — todas as leituras/escritas passam por `withTenant`,
 * ficando sujeitas ao RLS. Devolvem tipos simples (sem Decimal/enum cru) para a
 * UI. Esta camada substitui os mocks em memória (dados.ts/usuarios.ts/planos.ts)
 * pelas tabelas reais.
 */
import { withTenant, prisma } from './prisma';
import { dePlanoDb, paraPlanoDb, type ChavePlano } from '../planos';

export interface UsuarioView {
  id: string;
  nome: string;
  email: string;
  papel: string;
  tipoPerfil: string;
  scoreIa: number;
  plano: ChavePlano;
  perfil: {
    tipo: string;
    areaAtuacao: string;
    regiao: string;
    bio: string;
    visibilidadePublica: boolean;
  } | null;
}

/** Usuário + perfil + plano do tenant (para /painel). */
export async function carregarUsuario(
  tenantId: string,
  userId: string,
): Promise<UsuarioView | null> {
  return withTenant(tenantId, async (db) => {
    const u = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true, tenant: true },
    });
    if (!u) return null;
    return {
      id: u.id,
      nome: u.nome,
      email: u.email,
      papel: u.papel,
      tipoPerfil: u.tipoPerfil,
      scoreIa: u.scoreIa,
      plano: dePlanoDb(u.tenant.plano),
      perfil: u.profile
        ? {
            tipo: u.profile.tipo,
            areaAtuacao: u.profile.areaAtuacao ?? '',
            regiao: u.profile.regiao ?? '',
            bio: u.profile.bio ?? '',
            visibilidadePublica: u.profile.visibilidadePublica,
          }
        : null,
    };
  });
}

export async function salvarPerfil(
  tenantId: string,
  userId: string,
  dados: { areaAtuacao: string; regiao: string; bio: string },
): Promise<void> {
  await withTenant(tenantId, async (db) => {
    const existe = await db.profile.findUnique({ where: { userId } });
    if (existe) {
      await db.profile.update({ where: { userId }, data: dados });
    } else {
      await db.profile.create({
        data: { tenantId, userId, tipo: 'empresa_contratante', ...dados },
      });
    }
  });
}

export interface VagaView {
  id: string;
  titulo: string;
  status: string;
}

export async function listarVagas(tenantId: string): Promise<VagaView[]> {
  return withTenant(tenantId, (db) =>
    db.job
      .findMany({ orderBy: { criadoEm: 'desc' }, take: 50 })
      .then((vs) => vs.map((v) => ({ id: v.id, titulo: v.titulo, status: v.status }))),
  );
}

export interface CandidatoRanqueado {
  applicationId: string;
  nome: string;
  area: string;
  regiao: string;
  score: number;
  resumo: string;
  criterios: { aderencia: number; experiencia: number; certificacoes: number; referencias: number };
}

/** Ranking de candidatos de uma vaga, lendo o score já calculado pela IA. */
export async function ranquearCandidatos(
  tenantId: string,
  jobId: string,
): Promise<CandidatoRanqueado[]> {
  return withTenant(tenantId, async (db) => {
    const apps = await db.application.findMany({
      where: { jobId },
      include: { candidate: { include: { profile: true } } },
      orderBy: { scoreIa: 'desc' },
    });
    // Resumos de IA por referência (application.id).
    const analises = await db.aiAnalysis.findMany({
      where: { tipo: 'curriculo', referenciaId: { in: apps.map((a) => a.id) } },
    });
    const resumoPorRef = new Map(analises.map((a) => [a.referenciaId, a.resumo ?? '']));

    return apps.map((a) => {
      const c = (a.classificacaoIa as Record<string, number> | null) ?? {};
      return {
        applicationId: a.id,
        nome: a.candidate.nome,
        area: a.candidate.profile?.areaAtuacao ?? '—',
        regiao: a.candidate.profile?.regiao ?? '—',
        score: a.scoreIa ?? 0,
        resumo: resumoPorRef.get(a.id) ?? '',
        criterios: {
          aderencia: Number(c.aderencia ?? 0),
          experiencia: Number(c.experiencia ?? 0),
          certificacoes: Number(c.certificacoes ?? 0),
          referencias: Number(c.referencias ?? 0),
        },
      };
    });
  });
}

export interface MetricasPrime {
  curriculosAnalisados: number;
  scoreMedio: number;
}

export async function metricasPrime(tenantId: string): Promise<MetricasPrime> {
  return withTenant(tenantId, async (db) => {
    const agg = await db.application.aggregate({
      _count: { _all: true },
      _avg: { scoreIa: true },
      where: { scoreIa: { not: null } },
    });
    return {
      curriculosAnalisados: agg._count._all,
      scoreMedio: Math.round(agg._avg.scoreIa ?? 0),
    };
  });
}

/** Assina/troca o plano: atualiza o tenant e registra a assinatura. */
export async function assinarPlano(
  tenantId: string,
  chave: ChavePlano,
  trialDias = 0,
): Promise<void> {
  const planoDb = paraPlanoDb(chave);
  await withTenant(tenantId, async (db) => {
    await db.tenant.update({
      where: { id: tenantId },
      data: { plano: planoDb, statusAssinatura: trialDias > 0 ? 'trial' : 'ativa' },
    });
    await db.subscription.create({
      data: {
        tenantId,
        plano: planoDb,
        status: trialDias > 0 ? 'trial' : 'ativa',
        renovaEm: new Date(Date.now() + (trialDias > 0 ? trialDias : 30) * 864e5),
      },
    });
  });
}

/** Plano atual do tenant (para gates de UI). */
export async function planoDoTenant(tenantId: string): Promise<ChavePlano> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { plano: true } });
  return dePlanoDb(t?.plano ?? 'free');
}
