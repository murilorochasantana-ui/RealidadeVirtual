import { sondar, sondarSemSessao, type ResultadoDaSonda } from './devices/sonda';
import { montarSemSessao, montarSonda } from './relatorio/relatorio';
import { Diario, explicarFalha } from './relatorio/diario';

function exigirElemento(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (el === null) {
    throw new Error(`[Bancada] Elemento #${id} não encontrado no DOM.`);
  }
  return el;
}

export function iniciarSonda(): void {
  let elDiario: HTMLElement;
  let elSemSessao: HTMLElement;
  let elSonda: HTMLElement;
  let botao: HTMLElement;

  try {
    elDiario = exigirElemento('diario');
    elSemSessao = exigirElemento('relatorio-sem-sessao');
    elSonda = exigirElemento('relatorio-sonda');
    botao = exigirElemento('botao-sonda');
  } catch (e) {
    console.error(e);
    return;
  }

  const diario = new Diario();
  diario.fixarDestino(elDiario);

  if (!window.isSecureContext) {
    diario.alerta(
      'Esta página não está em contexto seguro (sem HTTPS). ' +
        'A API XR não é exposta aqui, e o botão vai responder como se o aparelho não tivesse suporte, o que seria informação falsa sobre o aparelho.',
    );
  }

  // Primeiro tempo: sem sessão 

  void sondarSemSessao()
    .then((resultado) => {
      montarSemSessao(elSemSessao, resultado);
      diario.nota(
        'Consulta inicial concluída. ' +
          (resultado.modosSuportados.length > 0
            ? 'Toque o botão para sondar dentro de uma sessão.'
            : 'Este aparelho não declara sessão imersiva, o botão não abrirá sessão.'),
      );
    })
    .catch((erro: unknown) => {
      diario.falha(explicarFalha(erro));
    });

  // Segundo tempo: com sessão 

  botao.addEventListener('click', () => {
    (botao as HTMLButtonElement).disabled = true;
    botao.textContent = '⏳ Sondando…';
    diario.nota('Sondando. Se um visor pedir permissão, aceite: sem ela a sessão não abre.');

    void sondar()
      .then((resultado: ResultadoDaSonda) => {
        montarSonda(elSonda, resultado);
        diario.nota('Sondagem concluída e sessão encerrada.');
      })
      .catch((erro: unknown) => {
        diario.falha(explicarFalha(erro));
      })
      .finally(() => {
        botao.textContent = 'Sondar aparelho';
        (botao as HTMLButtonElement).disabled = false;
      });
  });
}
