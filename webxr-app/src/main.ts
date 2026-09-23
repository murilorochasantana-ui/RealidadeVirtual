import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XRScene } from './scene';
import { setupControllers } from './controllers';
import { setupARHitTest } from './ar';
import { Diario } from './bancada/relatorio/diario';

const container = document.getElementById('app') as HTMLDivElement;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // habilita o loop WebXR
container.appendChild(renderer.domElement);

const xr = new XRScene();

const orbit = new OrbitControls(xr.camera, renderer.domElement);
orbit.target.set(0, 1.2, -1);
orbit.update();

// --- Controllers XR ---
const controllers = setupControllers(renderer, xr.scene, xr.interactive);

// --- AR hit-test ---
const arHitTest = setupARHitTest(renderer, xr.scene);

// --- Botões VR e AR ---
document.body.appendChild(VRButton.createButton(renderer));
document.body.appendChild(
  ARButton.createButton(renderer, {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['local-floor', 'bounded-floor', 'dom-overlay'],
    domOverlay: { root: document.body },
  }),
);

// --- Loop de animação (use setAnimationLoop, NÃO requestAnimationFrame) ---
// Passo 9: o laço avança pelo tempo transcorrido (delta), não por número de
// quadros — é o que faz a cena se comportar igual em máquinas diferentes. O
// custo de cada quadro (delta em milissegundos) é medido aqui e passado ao
// indicador dentro da própria cena, contra o teto declarado em scene.ts.
const clock = new THREE.Clock();

renderer.setAnimationLoop((_timestamp, frame) => {
  const delta = clock.getDelta();
  xr.update(delta);
  xr.atualizarCustoDoQuadro(delta * 1000);
  controllers.update();
  if (frame) arHitTest.update(frame);
  renderer.render(xr.scene, xr.camera);
});

// --- Responsividade ---
window.addEventListener('resize', () => {
  xr.camera.aspect = window.innerWidth / window.innerHeight;
  xr.camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------------------------
// Passo 7: a estrutura da árvore, impressa na página — não aparece na
// imagem, então precisa ser lida como texto para se conferir.
// Passo 8: o botão dispara a ancoragem do Tom livre na estante restante e
// registra a verificação em números (posição antes/depois, desvio).
// ---------------------------------------------------------------------------
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

const diarioCena = new Diario();
diarioCena.fixarDestino(elDiarioCena);

function renderizarEstrutura(): void {
  elEstrutura.textContent = xr.estrutura().join('\n');
}
renderizarEstrutura();

let tomJaAncorado = false;
botaoAncorar.addEventListener('click', () => {
  if (tomJaAncorado) {
    diarioCena.nota('O Tom já foi ancorado nesta sessão da página. Recarregue para repetir a demonstração.');
    return;
  }
  const { antes, depois, desvio } = xr.ancorarPeca(xr.tomLivre, xr.estanteLivre);
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