import type * as THREE from 'three';

const TELA_COMPACTA = '(max-width: 640px), (max-height: 500px)';

export function configurarPaineis(renderer: THREE.WebGLRenderer): void {
  const paineis = Array.from(document.querySelectorAll<HTMLDetailsElement>('details.painel'));
  const telaCompacta = window.matchMedia(TELA_COMPACTA);

  for (const painel of paineis) {
    painel.open = !telaCompacta.matches;

    painel.addEventListener('toggle', () => {
      if (!painel.open || !telaCompacta.matches) return;
      for (const outro of paineis) {
        if (outro !== painel) outro.open = false;
      }
    });

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

  const bancada = document.getElementById('bancada');
  const diario = document.getElementById('diario');
  if (bancada === null || diario === null) return;
  const marcarAviso = (): void => {
    bancada.classList.toggle('com-aviso', diario.querySelector('.diario-alerta, .diario-falha') !== null);
  };
  marcarAviso();
  new MutationObserver(marcarAviso).observe(diario, { childList: true });
}
