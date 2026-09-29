import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XRScene } from './scene';
import { setupControllers } from './controllers';
import { setupARHitTest } from './ar';
import { Diario } from './bancada/relatorio/diario';
import { configurarPaineis } from './paineis';

const container = document.getElementById('app') as HTMLDivElement;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
container.appendChild(renderer.domElement);

configurarPaineis(renderer);

const xr = new XRScene();

const orbit = new OrbitControls(xr.camera, renderer.domElement);
orbit.target.set(0, 1.2, -1);
orbit.update();

const controllers = setupControllers(renderer, xr.scene, xr.interactive);

const arHitTest = setupARHitTest(renderer, xr);

document.body.appendChild(VRButton.createButton(renderer));
document.body.appendChild(
  ARButton.createButton(renderer, {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['local-floor', 'bounded-floor', 'dom-overlay'],
    domOverlay: { root: document.body },
  }),
);

const clock = new THREE.Clock();

renderer.setAnimationLoop((_timestamp, frame) => {
  const delta = clock.getDelta();
  xr.update(delta);
  xr.atualizarCustoDoQuadro(delta * 1000);
  controllers.update();
  if (frame) arHitTest.update(frame);
  renderer.render(xr.scene, xr.camera);
});

window.addEventListener('resize', () => {
  xr.camera.aspect = window.innerWidth / window.innerHeight;
  xr.camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function exigirElementoDaCena(id: string): HTMLElement {
  const elemento = document.getElementById(id);
  if (elemento === null) {
    throw new Error(`A página não tem o elemento #${id}.`);
  }
  return elemento;
}

const elEstrutura = exigirElementoDaCena('estrutura');
const elDiarioCena = exigirElementoDaCena('diario-cena');
const botaoAncorar = exigirElementoDaCena('botao-ancorar') as HTMLButtonElement;
const botaoMover = exigirElementoDaCena('botao-mover') as HTMLButtonElement;

const diarioCena = new Diario();
diarioCena.fixarDestino(elDiarioCena);

function renderizarEstrutura(): void {
  elEstrutura.textContent = xr.estrutura().join('\n');
}
renderizarEstrutura();

let tomJaAncorado = false;

botaoMover.addEventListener('click', () => {
  const ligada = xr.alternarDemonstracaoDoBumbo();
  botaoMover.textContent = ligada ? 'Parar o bumbo' : 'Mover o bumbo';
  if (!ligada) {
    diarioCena.nota('Bumbo parado e de volta ao lugar.');
    return;
  }
  diarioCena.nota(
    'O bumbo recua 15 cm e volta a cada 4 s, contados no relógio e não em quadros. ' +
      'Só a posição do bumbo muda: o tom de ataque e o pedal vão junto porque são filhos dele.' +
      (tomJaAncorado ? ' O tom que estava no chão também vai, porque agora é filho do bumbo.' : ''),
  );
});

botaoAncorar.addEventListener('click', () => {
  if (tomJaAncorado) {
    diarioCena.nota('O Tom já foi ancorado nesta sessão da página. Recarregue para repetir a demonstração.');
    return;
  }
  const { antes, depois, desvio } = xr.ancorarPeca(xr.tomLivre, xr.bumbo);
  tomJaAncorado = true;
  botaoAncorar.disabled = true;
  botaoAncorar.textContent = 'Tom ancorado';
  diarioCena.nota(
    `Ancorado. Posição de mundo antes: (${antes.x.toFixed(3)}, ${antes.y.toFixed(3)}, ${antes.z.toFixed(3)}). ` +
      `Depois: (${depois.x.toFixed(3)}, ${depois.y.toFixed(3)}, ${depois.z.toFixed(3)}). ` +
      `Desvio: ${desvio.toExponential(2)} m — deveria ser ~0, porque attach() preserva a posição de mundo.`,
  );
  renderizarEstrutura();
});