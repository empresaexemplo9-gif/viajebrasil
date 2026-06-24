/**
 * Currículos/candidatos (demonstração) que a IA de classificação analisa.
 * Na fase 2 vêm do banco (perfis com papel candidato + currículo).
 */

export interface Candidato {
  id: string;
  nome: string;
  area: string;
  regiao: string;
  anosExperiencia: number;
  formacao: string;
  certificacoes: string[];
  habilidades: string[];
  /** Quantidade de referências profissionais informadas. */
  referencias: number;
  resumo: string;
}

export const candidatos: Candidato[] = [
  {
    id: 'c1',
    nome: 'Marina Costa',
    area: 'Design & Branding',
    regiao: 'São Paulo - SP',
    anosExperiencia: 8,
    formacao: 'Superior em Design Gráfico',
    certificacoes: ['Adobe Certified', 'UX Design (Google)'],
    habilidades: ['Branding', 'Figma', 'Identidade Visual', 'Social Media'],
    referencias: 3,
    resumo: 'Designer de marcas sênior, foco em identidade visual para PMEs.',
  },
  {
    id: 'c2',
    nome: 'Bruno Almeida',
    area: 'Design & Branding',
    regiao: 'Goiânia - GO',
    anosExperiencia: 3,
    formacao: 'Tecnólogo em Design',
    certificacoes: ['Figma Advanced'],
    habilidades: ['Figma', 'Social Media', 'Motion'],
    referencias: 1,
    resumo: 'Designer pleno com forte atuação em social media e motion.',
  },
  {
    id: 'c3',
    nome: 'Carla Nunes',
    area: 'Design & Branding',
    regiao: 'Remoto',
    anosExperiencia: 1,
    formacao: 'Cursando Design',
    certificacoes: [],
    habilidades: ['Identidade Visual', 'Canva'],
    referencias: 0,
    resumo: 'Designer júnior em início de carreira, criativa e dedicada.',
  },
  {
    id: 'c4',
    nome: 'Diego Ferraz',
    area: 'Tecnologia',
    regiao: 'Goiânia - GO',
    anosExperiencia: 6,
    formacao: 'Engenharia de Software',
    certificacoes: ['AWS Solutions Architect', 'Scrum Master'],
    habilidades: ['Desenvolvimento', 'APIs', 'Cloud', 'React'],
    referencias: 4,
    resumo: 'Dev full-stack sênior com forte base em cloud e integrações.',
  },
  {
    id: 'c5',
    nome: 'Patrícia Rocha',
    area: 'Marketing Digital',
    regiao: 'Remoto',
    anosExperiencia: 5,
    formacao: 'Publicidade',
    certificacoes: ['Google Ads', 'Meta Blueprint'],
    habilidades: ['Tráfego Pago', 'Google Ads', 'Meta Ads', 'Analytics'],
    referencias: 2,
    resumo: 'Especialista em performance e mídia paga para e-commerce.',
  },
];
