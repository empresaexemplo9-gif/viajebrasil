import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Papel } from '../tipos';
import { carregarTokenPersistido, definirToken } from '../servicos/sessao';
import { eu } from '../servicos/auth';
import { TENANT } from '../servicos/config';

export type { Papel };
/** Qual interface o usuário está vendo (relevante só para consultor/admin). */
export type ModoVisao = 'cliente' | 'interno';

interface Usuario {
  nome: string;
  email: string;
  papel: Papel;
  /** Tenant ao qual o login pertence — base do isolamento multi-tenant. */
  tenantId: string;
}

interface AutenticacaoContextValor {
  usuario: Usuario | null;
  autenticado: boolean;
  carregando: boolean;
  ehAdmin: boolean;
  ehConsultor: boolean;
  /** Consultor ou admin (tem área interna). */
  ehStaff: boolean;
  /** Interface ativa: 'cliente' ou 'interno' (cliente comum é sempre 'cliente'). */
  modo: ModoVisao;
  definirModo: (m: ModoVisao) => void;
  tenantId: string;
  temPapel: (...papeis: Papel[]) => boolean;
  entrar: (email: string, papel?: Papel, nome?: string) => void;
  sair: () => void;
}

const AutenticacaoContext = createContext<AutenticacaoContextValor | null>(null);
const CHAVE_MODO = `@viajebrasil/${TENANT.id}/modo`;

const ehStaffPapel = (p?: Papel) => p === 'admin' || p === 'consultor';

export function AutenticacaoProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [modo, setModoState] = useState<ModoVisao>('cliente');

  // Reidrata token + usuário (papel) + modo de visão salvo.
  useEffect(() => {
    let ativo = true;
    (async () => {
      await carregarTokenPersistido();
      const u = await eu();
      let modoSalvo: ModoVisao | null = null;
      try {
        const raw = await AsyncStorage.getItem(CHAVE_MODO);
        if (raw === 'cliente' || raw === 'interno') modoSalvo = raw;
      } catch {
        modoSalvo = null;
      }
      if (!ativo) return;
      if (u) setUsuario({ ...u, tenantId: TENANT.id });
      // Staff cai na área interna por padrão (a menos que tenha escolhido cliente).
      setModoState(modoSalvo ?? (u && ehStaffPapel(u.papel) ? 'interno' : 'cliente'));
      setCarregando(false);
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const definirModo = useCallback((m: ModoVisao) => {
    setModoState(m);
    void AsyncStorage.setItem(CHAVE_MODO, m).catch(() => {});
  }, []);

  const entrar = useCallback((email: string, papel: Papel = 'cliente', nome?: string) => {
    const nomeFinal = (nome ?? email.split('@')[0] ?? 'Viajante').trim();
    setUsuario({ nome: nomeFinal, email, papel, tenantId: TENANT.id });
    definirModo(ehStaffPapel(papel) ? 'interno' : 'cliente');
  }, [definirModo]);

  const sair = useCallback(() => {
    void definirToken(null);
    setUsuario(null);
    definirModo('cliente');
  }, [definirModo]);

  const temPapel = useCallback(
    (...papeis: Papel[]) => (usuario ? papeis.includes(usuario.papel) : false),
    [usuario],
  );

  const ehStaff = ehStaffPapel(usuario?.papel);

  const valor = useMemo(
    () => ({
      usuario,
      autenticado: usuario !== null,
      carregando,
      ehAdmin: usuario?.papel === 'admin',
      ehConsultor: usuario?.papel === 'consultor',
      ehStaff,
      // Cliente comum nunca entra no modo interno.
      modo: ehStaff ? modo : ('cliente' as ModoVisao),
      definirModo,
      tenantId: TENANT.id,
      temPapel,
      entrar,
      sair,
    }),
    [usuario, carregando, ehStaff, modo, definirModo, temPapel, entrar, sair],
  );

  return (
    <AutenticacaoContext.Provider value={valor}>{children}</AutenticacaoContext.Provider>
  );
}

export function useAutenticacao() {
  const ctx = useContext(AutenticacaoContext);
  if (!ctx) throw new Error('useAutenticacao deve ser usado dentro de AutenticacaoProvider');
  return ctx;
}
