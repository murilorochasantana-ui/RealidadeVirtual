import * as THREE from 'three';
import type { XRScene } from './scene';

const NORMAL_MINIMA_PARA_CIMA = 0.9;

export function setupARHitTest(renderer: THREE.WebGLRenderer, xr: XRScene) {
  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.07, 0.09, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x4f7cff }),
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  xr.scene.add(reticle);

  const dica = document.getElementById('dica-ar');
  function mostrarDica(texto: string): void {
    if (dica !== null && dica.textContent !== texto) dica.textContent = texto;
  }

  let hitTestSource: XRHitTestSource | null = null;
  let requested = false;
  let emAR = false;
  let bateriaColocada = false;

  renderer.xr.addEventListener('sessionstart', () => {

    const session = renderer.xr.getSession();
    emAR = session !== null && session.environmentBlendMode !== 'opaque';
    if (!emAR) return;
    bateriaColocada = false;
    xr.prepararParaMesa();
    document.body.classList.add('em-ar');
  });

  renderer.xr.addEventListener('sessionend', () => {
    if (!emAR) return;
    emAR = false;
    reticle.visible = false;
    xr.restaurarTamanhoReal();
    document.body.classList.remove('em-ar');
  });

  const controller = renderer.xr.getController(0);
  controller.addEventListener('select', () => {
    if (!emAR || !reticle.visible) return;
    xr.colocarBateria(reticle.matrix);
    bateriaColocada = true;
  });
  xr.scene.add(controller);

  return {
    update(frame: XRFrame): void {
      if (!emAR) return;
      const session = renderer.xr.getSession();
      if (!session) return;

      const referenceSpace = renderer.xr.getReferenceSpace();
      if (!referenceSpace) return;

      if (!requested) {
        requested = true;
        session.requestReferenceSpace('viewer').then((viewerSpace) => {
          session.requestHitTestSource?.({ space: viewerSpace })?.then((source) => {
            hitTestSource = source;
          });
        });
        session.addEventListener('end', () => {
          requested = false;
          hitTestSource = null;
        });
      }

      if (hitTestSource) {
        const results = frame.getHitTestResults(hitTestSource);
        const pose = results.length > 0 ? results[0].getPose(referenceSpace) : undefined;

        if (pose !== undefined && pose.transform.matrix[5] > NORMAL_MINIMA_PARA_CIMA) {
          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
        } else {
          reticle.visible = false;
        }
      }

      if (!reticle.visible) {
        mostrarDica('Mova o celular devagar, apontando para uma mesa ou para o chão.');
      } else if (!bateriaColocada) {
        mostrarDica('Toque na tela para colocar a bateria no anel azul.');
      } else {
        mostrarDica('Toque em outro ponto para mudar a bateria de lugar.');
      }
    },
  };
}
