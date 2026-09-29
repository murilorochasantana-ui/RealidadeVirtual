import type { SondaSemSessao, ResultadoDaSonda, SondaEmSessao } from '../devices/sonda';
import { conferirComposicao } from '../devices/sonda';
import type { LinhaDoRelatorio } from '../modes/verificacao';
import type { EstadoDeRecurso } from '../devices/recursos';
import type { Dominio } from '../dominio/dominio';
import { totalDeInstancias } from '../dominio/dominio';

function paragrafo(texto: string): HTMLParagraphElement {
  const el = document.createElement('p');
  el.textContent = texto;
  return el;
}

function subtitulo(texto: string): HTMLHeadingElement {
  const el = document.createElement('h3');
  el.textContent = texto;
  return el;
}

function celula(texto: string, cabecalho: boolean = false): HTMLTableCellElement {
  const el = document.createElement(cabecalho ? 'th' : 'td') as HTMLTableCellElement;
  el.textContent = texto;
  return el;
}

function badgeSuporte(suporte: string): string {
  if (suporte === 'sim') return 'suportado';
  if (suporte === 'api-ausente') return 'sem resposta';
  return 'não suportado';
}

function badgeEstado(estado: EstadoDeRecurso): string {
  if (estado === 'concedido') return 'concedido';
  if (estado === 'indeterminado') return 'sem resposta';
  return 'não concedido';
}

function tabelaDeRegimes(linhas: readonly LinhaDoRelatorio[]): HTMLTableElement {
  const tabela = document.createElement('table');

  const cabecalho = tabela.insertRow();
  for (const titulo of ['Neste aparelho', 'Modo', 'Nome', 'Trata o mundo como']) {
    cabecalho.appendChild(celula(titulo, true));
  }

  for (const linha of linhas) {
    const fileira = tabela.insertRow();
    fileira.appendChild(celula(badgeSuporte(linha.suporte)));
    const tdId = celula(linha.regime.id);
    tdId.classList.add('codigo');
    fileira.appendChild(tdId);
    fileira.appendChild(celula(linha.regime.nome));
    fileira.appendChild(celula(linha.regime.tratamentoDoMundo));
  }

  return tabela;
}

function detalhesDosRegimes(linhas: readonly LinhaDoRelatorio[]): HTMLElement {
  const bloco = document.createElement('div');
  for (const linha of linhas) {
    const r = linha.regime;
    bloco.appendChild(subtitulo(r.nome));
    bloco.appendChild(paragrafo(`Espaço de referência: ${r.espacoDeReferencia}`));
    bloco.appendChild(paragrafo(`Rastreia: ${r.rastreia}`));
    bloco.appendChild(paragrafo(`Registrado contra: ${r.registroContra}`));
  }
  return bloco;
}

export function montarSemSessao(raiz: HTMLElement, resultado: SondaSemSessao): void {
  raiz.replaceChildren();

  const titulo = document.createElement('h2');
  titulo.textContent = 'O que o aparelho declara (sem sessão)';
  raiz.appendChild(titulo);

  raiz.appendChild(
    paragrafo(
      resultado.contextoSeguro
        ? 'Contexto seguro (HTTPS), a API XR está disponível e as respostas abaixo são sobre o aparelho.'
        : 'Esta página NÃO está em contexto seguro. A API XR não é exposta aqui.'
    ),
  );

  raiz.appendChild(
    paragrafo(
      resultado.temApiXr
        ? 'navigator.xr encontrado.'
        : 'navigator.xr ausente, navegador sem suporte ou contexto inseguro.',
    ),
  );

  raiz.appendChild(subtitulo('Regimes suportados'));
  raiz.appendChild(tabelaDeRegimes(resultado.regimes));
  raiz.appendChild(detalhesDosRegimes(resultado.regimes));
}

export function montarDominio(
  raiz: HTMLElement,
  dominio: Dominio,
  problemas: readonly string[],
): void {
  raiz.replaceChildren();

  const titulo = document.createElement('h2');
  titulo.textContent = `Domínio: ${dominio.nome}`;
  raiz.appendChild(titulo);

  raiz.appendChild(paragrafo(dominio.descricao));
  raiz.appendChild(
    paragrafo(
      `Tarefa: ${dominio.tarefa.enunciado} Concluída quando: ${dominio.tarefa.estadoFinal}`,
    ),
  );
  raiz.appendChild(
    paragrafo(
      `${dominio.pecas.length} tipos de peça declarados, ${totalDeInstancias(dominio)} ` +
        'instâncias no total. ' +
        (problemas.length === 0
          ? 'Nenhuma inconsistência.'
          : `Inconsistências: ${problemas.join(' ')}`),
    ),
  );
}

function tabelaDeRecursos(sonda: SondaEmSessao): HTMLTableElement {
  const tabela = document.createElement('table');

  const cabecalho = tabela.insertRow();
  for (const titulo of ['Neste aparelho', 'Recurso', 'Para que serve']) {
    cabecalho.appendChild(celula(titulo, true));
  }

  for (const recurso of sonda.recursos) {
    const fileira = tabela.insertRow();
    fileira.appendChild(celula(badgeEstado(recurso.estado)));
    const tdNome = celula(recurso.nome);
    tdNome.classList.add('codigo');
    fileira.appendChild(tdNome);
    fileira.appendChild(celula(recurso.paraQueServe));
  }

  return tabela;
}

function tabelaDeFontes(sonda: SondaEmSessao): HTMLElement {
  if (sonda.fontesDeEntrada.length === 0) {
    return paragrafo(
      'Nenhuma fonte de entrada foi declarada durante a sondagem. Num visor, isso costuma significar controle desligado ou fora de alcance; num aparelho de mão, é o esperado até o primeiro toque na tela.',
    );
  }

  const tabela = document.createElement('table');

  const cabecalho = tabela.insertRow();
  for (const titulo of ['Lado', 'Mira', 'Pose de punho', 'Mão articulada', 'Perfis']) {
    cabecalho.appendChild(celula(titulo, true));
  }

  for (const fonte of sonda.fontesDeEntrada) {
    const fileira = tabela.insertRow();
    fileira.appendChild(celula(fonte.lado));
    fileira.appendChild(celula(fonte.mira));
    fileira.appendChild(celula(fonte.temPoseDePunho ? 'sim' : 'não'));
    fileira.appendChild(celula(fonte.temMao ? 'sim' : 'não'));
    fileira.appendChild(celula(fonte.perfis.join(', ') || '—'));
  }

  return tabela;
}

export function montarSonda(raiz: HTMLElement, resultado: ResultadoDaSonda): void {
  raiz.replaceChildren();

  const sonda: SondaEmSessao | undefined = resultado.emSessao;

  const titulo = document.createElement('h2');
  titulo.textContent = 'O que a sessão respondeu';
  raiz.appendChild(titulo);

  raiz.appendChild(paragrafo(`Classe identificada: ${resultado.classe}`));

  if (sonda === undefined) {
    raiz.appendChild(
      paragrafo(
        resultado.motivoSemSessao ??
          'Não houve sessão imersiva, e o motivo não foi registrado.',
      ),
    );
    return;
  }

  raiz.appendChild(paragrafo(`Sessão aberta em modo: ${sonda.modo}`));
  raiz.appendChild(paragrafo(`Graus de liberdade: ${sonda.graus}`));

  raiz.appendChild(subtitulo('Recursos opcionais'));
  raiz.appendChild(tabelaDeRecursos(sonda));

  raiz.appendChild(subtitulo('Espaços de referência'));
  raiz.appendChild(
    paragrafo(
      sonda.espacosConcedidos.length === 0
        ? 'Nenhum espaço de referência foi concedido.'
        : `Concedidos: ${sonda.espacosConcedidos.join(', ')}.`,
    ),
  );

  raiz.appendChild(subtitulo('Composição do fundo'));
  raiz.appendChild(paragrafo(`A sessão informou composição: ${sonda.composicaoObservada}`));
  raiz.appendChild(paragrafo(conferirComposicao(sonda)));

  raiz.appendChild(subtitulo('Fontes de entrada'));
  raiz.appendChild(tabelaDeFontes(sonda));

  raiz.appendChild(subtitulo('Estabilidade do rastreamento'));
  raiz.appendChild(paragrafo(sonda.diagnostico));

  const tabelaEst = document.createElement('table');
  const dadosEst: [string, string][] = [
    ['Quadros observados', String(sonda.estabilidade.totalQuadros)],
    ['Quadros sem pose', String(sonda.estabilidade.quadrosSemPose)],
    ['Maior lacuna consecutiva', `${sonda.estabilidade.maiorLacuna} quadros`],
    ['Quadros com sessão oculta', String(sonda.estabilidade.quadrosOcultos)],
  ];
  for (const [rotulo, valor] of dadosEst) {
    const fileira = tabelaEst.insertRow();
    fileira.appendChild(celula(rotulo));
    fileira.appendChild(celula(valor));
  }
  raiz.appendChild(tabelaEst);
}
