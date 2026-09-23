// src/paineis.ts
// ---------------------------------------------------------------------------
// Os dois painéis de texto — o relatório do aparelho (Passo 6) e a árvore com
// o botão de ancoragem (Passos 7 e 8) — não podem sair: o relatório tem de ser
// legível no próprio aparelho, e a árvore e o reparentamento só se conferem
// lendo. Mas também não podem cobrir a bateria. Por isso cada um é um
// <details> recolhível: aberto em tela larga, recolhido no celular, e
// recolhido ao entrar numa sessão imersiva, porque no AR o dom-overlay
// desenha a página inteira por cima da câmera.
// ---------------------------------------------------------------------------
import type * as THREE from 'three';

/** Celular em pé ou deitado. É a mesma condição do @media de index.html. */
const TELA_COMPACTA = '(max-width: 640px), (max-height: 500px)';

export function configurarPaineis(renderer: THREE.WebGLRenderer): void {
  const paineis = Array.from(document.querySelectorAll<HTMLDetailsElement>('details.painel'));
  const telaCompacta = window.matchMedia(TELA_COMPACTA);

  for (const painel of paineis) {
    painel.open = !telaCompacta.matches;

    // No celular, dois painéis abertos voltam a cobrir a tela inteira: abrir
    // um recolhe o outro.
    painel.addEventListener('toggle', () => {
      if (!painel.open || !telaCompacta.matches) return;
      for (const outro of paineis) {
        if (outro !== painel) outro.open = false;
      }
    });

    // No AR, tocar no painel também dispararia o 'select' da sessão e
    // colocaria um cilindro no retículo (ar.ts). Cancelar o beforexrselect
    // separa o toque na página do toque no mundo.
    painel.addEventListener('beforexrselect', (evento) => evento.preventDefault());
  }

  let abertosAntesDaSessao: HTMLDetailsElement[] = [];
  renderer.xr.addEventListener('sessionstart', () => {
    abertosAntesDaSessao = paineis.filter((painel) => painel.open);
    for (const painel of paineis) painel.open = false;
    document.body.classList.add('em-sessao-xr');
  });
  renderer.xr.addEventListener('sessionend', () => {
    for (const painel of abertosAntesDaSessao) painel.open = true;
    document.body.classList.remove('em-sessao-xr');
  });

  // O diário é o canal de erro de quem não abre console. Com o relatório
  // recolhido ele some, então o título ganha uma marca enquanto houver
  // alerta ou falha registrados.
  const bancada = document.getElementById('bancada');
  const diario = document.getElementById('diario');
  if (bancada === null || diario === null) return;
  const marcarAviso = (): void => {
    bancada.classList.toggle('com-aviso', diario.querySelector('.diario-alerta, .diario-falha') !== null);
  };
  marcarAviso();
  new MutationObserver(marcarAviso).observe(diario, { childList: true });
}
