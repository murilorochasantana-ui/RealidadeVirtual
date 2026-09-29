export type PecaId =
  | 'baqueta'
  | 'bumbo'
  | 'caixa'
  | 'tom'
  | 'prato'
  | 'estante'
  | 'pedal'
  | 'bancada';

export interface Peca {
  readonly id: PecaId;
  readonly nome: string;

  readonly quantidade: number;

  readonly move: boolean;

  readonly exigeAncoragem: boolean;
  readonly observacao: string;
}

export interface TarefaDoAmbiente {
  readonly enunciado: string;
  readonly estadoFinal: string;
}

export interface Dominio {
  readonly nome: string;
  readonly descricao: string;
  readonly tarefa: TarefaDoAmbiente;
  readonly pecas: readonly Peca[];
}

export const BATERIA: Dominio = {
  nome: 'Bateria Acústica',
  descricao:
    'Um ambiente com liberdade para expressar e experimentar: a pessoa chega, ' +
    'vê a bateria, se posiciona e interage com o instrumento (Especificação, Seções 1-2).',
  tarefa: {
    enunciado:
      'Montar o conjunto da bateria ancorando cada peça no seu suporte (caixa e pratos ' +
      'nas estantes, tons de ataque e pedal no bumbo, bumbo e surdo na bancada), ' +
      'em ordem livre, e então tocar cada peça para produzir seu som (Seções 5-6).',
    estadoFinal:
      'Todas as conexões obrigatórias de ancoragem foram feitas — a ordem é livre, ' +
      'mas nenhuma peça marcada como exigeAncoragem pode ficar solta — e, a partir ' +
      'daí, cada peça responde ao toque com o som correspondente (Seção 6).',
  },
  pecas: [
    {
      id: 'baqueta',
      nome: 'Baqueta',
      quantidade: 2,
      move: true,
      exigeAncoragem: false,
      observacao: 'Usada para ativar o som; não se encaixa em suporte algum.',
    },
    {
      id: 'bumbo',
      nome: 'Bumbo',
      quantidade: 1,
      move: false,
      exigeAncoragem: true,
      observacao: 'Parte da bateria; recebe os dois tons de ataque e o pedal.',
    },
    {
      id: 'caixa',
      nome: 'Caixa',
      quantidade: 1,
      move: false,
      exigeAncoragem: true,
      observacao: 'Parte da bateria.',
    },
    {
      id: 'tom',
      nome: 'Tom',
      quantidade: 3,
      move: false,
      exigeAncoragem: true,
      observacao: 'Dois tons de ataque, presos ao bumbo, e o surdo, de pé na bancada.',
    },
    {
      id: 'prato',
      nome: 'Prato',
      quantidade: 4,
      move: false,
      exigeAncoragem: true,
      observacao: 'Dois no chimbal, um crash e um ride.',
    },
    {
      id: 'estante',
      nome: 'Estante',
      quantidade: 4,
      move: false,
      exigeAncoragem: false,
      observacao: 'Suporte fixo (caixa, chimbal, crash e ride) — recebe outras peças, não é ancorada em nada.',
    },
    {
      id: 'pedal',
      nome: 'Pedal',
      quantidade: 1,
      move: false,
      exigeAncoragem: true,
      observacao: 'Parte da bateria; preso ao aro do bumbo.',
    },
    {
      id: 'bancada',
      nome: 'Bancada',
      quantidade: 1,
      move: false,
      exigeAncoragem: false,
      observacao: 'Apoio fixo da cena.',
    },
  ],
};

export function totalDeInstancias(dominio: Dominio): number {
  return dominio.pecas.reduce((soma, peca) => soma + peca.quantidade, 0);
}

export function inconsistenciasDoDominio(dominio: Dominio): string[] {
  const problemas: string[] = [];

  if (dominio.tarefa.enunciado.trim().length === 0) {
    problemas.push('A tarefa não tem enunciado.');
  }
  if (dominio.tarefa.estadoFinal.trim().length === 0) {
    problemas.push('A tarefa não declara estado final.');
  }
  for (const peca of dominio.pecas) {
    if (peca.quantidade <= 0) {
      problemas.push(`A peça "${peca.nome}" está declarada com quantidade zero.`);
    }
  }
  if (!dominio.pecas.some((peca) => peca.exigeAncoragem)) {
    problemas.push(
      'Nenhuma peça exige ancoragem — a tarefa de montagem não teria o que verificar.',
    );
  }

  return problemas;
}
