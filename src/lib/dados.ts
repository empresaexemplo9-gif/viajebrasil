/**
 * Dados de demonstração do MVP (em memória). Mantêm o app navegável sem banco.
 * Quando o PostgreSQL/Prisma for ligado (DATABASE_URL), estas funções passam a
 * consultar o banco — as telas não mudam.
 */

export type TipoPerfil = 'pessoa' | 'empresa' | 'autonomo' | 'produto';
export type TipoVaga = 'CLT' | 'PJ' | 'Freela';
export type TipoPost = 'busca-servico' | 'busca-parceiro' | 'disponivel' | 'produto';

export interface Perfil {
  id: string;
  tipo: TipoPerfil;
  nome: string;
  areaAtuacao: string;
  regiao: string;
  bio: string;
  contato: string;
  habilidades: string[];
  score: number;
}

export interface Vaga {
  id: string;
  titulo: string;
  empresa: string;
  tipo: TipoVaga;
  area: string;
  regiao: string;
  habilidades: string[];
  descricao: string;
  salario: string;
}

export interface Servico {
  id: string;
  titulo: string;
  perfil: string;
  descricao: string;
  preco: string;
  prazo: string;
  regiao: string;
}

export interface PostFeed {
  id: string;
  autor: string;
  tipo: TipoPost;
  texto: string;
  regiao: string;
  quando: string;
}

export const perfis: Perfil[] = [
  {
    id: 'p1',
    tipo: 'autonomo',
    nome: 'Marina Costa',
    areaAtuacao: 'Design & Branding',
    regiao: 'São Paulo - SP',
    bio: 'Designer de marcas com 8 anos de experiência ajudando pequenas empresas a se destacarem.',
    contato: 'marina@exemplo.com',
    habilidades: ['Branding', 'Figma', 'Identidade Visual', 'Social Media'],
    score: 92,
  },
  {
    id: 'p2',
    tipo: 'empresa',
    nome: 'TechNova Soluções',
    areaAtuacao: 'Tecnologia',
    regiao: 'Goiânia - GO',
    bio: 'Software house focada em automação e integrações para PMEs.',
    contato: 'contato@technova.com',
    habilidades: ['Desenvolvimento', 'Automação', 'APIs', 'Cloud'],
    score: 78,
  },
  {
    id: 'p3',
    tipo: 'pessoa',
    nome: 'Rafael Lima',
    areaAtuacao: 'Marketing Digital',
    regiao: 'Belo Horizonte - MG',
    bio: 'Gestor de tráfego e performance. Foco em gerar leads qualificados.',
    contato: 'rafael@exemplo.com',
    habilidades: ['Tráfego Pago', 'Google Ads', 'Meta Ads', 'Analytics'],
    score: 85,
  },
  {
    id: 'p4',
    tipo: 'produto',
    nome: 'Café Serra Dourada',
    areaAtuacao: 'Alimentos & Bebidas',
    regiao: 'Brasília - DF',
    bio: 'Café especial torrado artesanalmente. Venda no atacado e varejo.',
    contato: 'vendas@serradourada.com',
    habilidades: ['Atacado', 'Varejo', 'Entrega'],
    score: 64,
  },
];

export const vagas: Vaga[] = [
  {
    id: 'v1',
    titulo: 'Designer de Social Media',
    empresa: 'TechNova Soluções',
    tipo: 'PJ',
    area: 'Design & Branding',
    regiao: 'Goiânia - GO',
    habilidades: ['Figma', 'Social Media', 'Identidade Visual'],
    descricao: 'Criação de peças para redes sociais e apoio à identidade visual de clientes.',
    salario: 'R$ 3.000 – R$ 4.500',
  },
  {
    id: 'v2',
    titulo: 'Gestor de Tráfego Pago',
    empresa: 'Agência Conecta',
    tipo: 'Freela',
    area: 'Marketing Digital',
    regiao: 'Remoto',
    habilidades: ['Google Ads', 'Meta Ads', 'Analytics', 'Tráfego Pago'],
    descricao: 'Gestão de campanhas de performance para carteira de PMEs.',
    salario: 'R$ 2.500 + variável',
  },
  {
    id: 'v3',
    titulo: 'Desenvolvedor(a) Full-Stack',
    empresa: 'TechNova Soluções',
    tipo: 'CLT',
    area: 'Tecnologia',
    regiao: 'Goiânia - GO',
    habilidades: ['Desenvolvimento', 'APIs', 'Cloud', 'React'],
    descricao: 'Construção de integrações e automações para clientes B2B.',
    salario: 'R$ 6.000 – R$ 9.000',
  },
];

export const servicos: Servico[] = [
  {
    id: 's1',
    titulo: 'Criação de Identidade Visual',
    perfil: 'Marina Costa',
    descricao: 'Logo, paleta, tipografia e manual da marca para sua empresa.',
    preco: 'A partir de R$ 1.800',
    prazo: '10 dias úteis',
    regiao: 'São Paulo - SP / Remoto',
  },
  {
    id: 's2',
    titulo: 'Gestão de Tráfego Mensal',
    perfil: 'Rafael Lima',
    descricao: 'Campanhas no Google e Meta com relatórios semanais de performance.',
    preco: 'R$ 1.500 / mês',
    prazo: 'Início em 3 dias',
    regiao: 'Remoto',
  },
  {
    id: 's3',
    titulo: 'Café Especial — Atacado',
    perfil: 'Café Serra Dourada',
    descricao: 'Grãos torrados artesanalmente, pacotes de 1kg. Entrega em todo o DF.',
    preco: 'R$ 48 / kg',
    prazo: 'Entrega em 2 dias',
    regiao: 'Brasília - DF',
  },
  {
    id: 's4',
    titulo: 'Automação de Processos',
    perfil: 'TechNova Soluções',
    descricao: 'Integração de sistemas e automação de fluxos repetitivos.',
    preco: 'Sob orçamento',
    prazo: 'A combinar',
    regiao: 'Goiânia - GO / Remoto',
  },
];

export const feed: PostFeed[] = [
  {
    id: 'f1',
    autor: 'Loja Bella Moda',
    tipo: 'busca-servico',
    texto: 'Procuro designer para renovar a identidade visual da loja. Orçamento até R$ 2.500.',
    regiao: 'São Paulo - SP',
    quando: 'há 2 h',
  },
  {
    id: 'f2',
    autor: 'Rafael Lima',
    tipo: 'disponivel',
    texto: 'Disponível para 2 novos clientes de tráfego pago neste mês. Foco em e-commerce.',
    regiao: 'Remoto',
    quando: 'há 5 h',
  },
  {
    id: 'f3',
    autor: 'TechNova Soluções',
    tipo: 'busca-parceiro',
    texto: 'Buscamos parceiros de marketing para indicar projetos de automação. Comissão por indicação.',
    regiao: 'Goiânia - GO',
    quando: 'há 1 dia',
  },
  {
    id: 'f4',
    autor: 'Café Serra Dourada',
    tipo: 'produto',
    texto: 'Novo lote de café especial disponível para atacado. Amostras grátis para cafeterias.',
    regiao: 'Brasília - DF',
    quando: 'há 1 dia',
  },
];

export function perfilPorNome(nome: string): Perfil | undefined {
  return perfis.find((p) => p.nome === nome);
}
