// src/scene.ts
// ---------------------------------------------------------------------------
// A Bateria Acústica como árvore de nós — Passos 7, 8 e 9 do Módulo 03.
//
// O que muda em relação ao andaime original: os cinco cubos genéricos saem,
// e entram os objetos que a especificação prometeu (docs/especificacao.md,
// Seção 3), como nós com transformação própria em relação ao pai. As
// geometrias são primitivas (caixas, cilindros) — placeholders para os
// modelos importados que a Seção 12 já licenciou; trocar o placeholder pelo
// modelo real não deve mudar a árvore, só a malha de cada nó.
//
// Passo 7 — parentesco por razão de projeto: cada Estante é pai das peças
// que ela sustenta (Caixa, Toms, Pratos). Mover a estante move a peça
// junto, e nenhuma coordenada foi somada à mão para isso — é consequência
// de `estante.add(peca)` e da matriz local do Three.js.
//
// Passo 8 — reparentar sem recalcular à mão: um Tom (tomLivre) começa "no
// chão" (filho da cena, ver Seção 6 "estado inicial: peças espalhadas pelo
// chão"), sem estante. A operação `ancorarPeca` o prende à estante restante
// usando `Object3D.attach`, que resolve a transformação local nova
// preservando a posição de mundo. A verificação não é visual: main.ts chama
// esta função e loga a posição antes/depois em números.
//
// Passo 9 — o indicador de custo do quadro é um Sprite dentro da própria
// cena (não HTML sobreposto), porque em VR não existe overlay de DOM: o que
// não estiver na cena não é visto dentro do visor.
// ---------------------------------------------------------------------------
import * as THREE from 'three';

/** Teto declarado para o custo do quadro, em milissegundos. Segue a meta de
 * "no mínimo 30 FPS" da Seção 10 da especificação (1000ms / 30 ≈ 33.3ms). */
export const ORCAMENTO_QUADRO_MS = 33.3;

interface ResultadoDeAncoragem {
  readonly antes: THREE.Vector3;
  readonly depois: THREE.Vector3;
  readonly desvio: number;
}

function malha(geometria: THREE.BufferGeometry, cor: number, nome: string): THREE.Mesh {
  const material = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.5, metalness: 0.1 });
  const objeto = new THREE.Mesh(geometria, material);
  objeto.name = nome;
  return objeto;
}

/**
 * Encapsula a cena, a câmera e a bateria montada como árvore.
 * `interactive` é a lista de objetos que os controllers podem apontar/pegar
 * (Especificação, Seção 3: só as duas baquetas têm "Move: Sim").
 */
export class XRScene {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly interactive: THREE.Object3D[] = [];

  /** Referências para a demonstração do Passo 8 — o Tom ainda não ancorado
   * e a estante que vai recebê-lo. */
  readonly tomLivre: THREE.Object3D;
  readonly estanteLivre: THREE.Object3D;

  private readonly indicadorCanvas: HTMLCanvasElement;
  private readonly indicadorContexto: CanvasRenderingContext2D;
  private readonly indicadorTextura: THREE.CanvasTexture;
  private quadrosDesdeUltimaAtualizacao = 0;

  constructor() {
    this.scene.background = new THREE.Color(0x101015);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      100,
    );
    this.camera.position.set(0, 1.6, 2.6);

    this.addLights();
    this.addFloor();

    const bancada = this.criarBancada();
    this.scene.add(bancada);

    const bumbo = malha(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 24), 0x8a5a2b, 'bumbo');
    bumbo.position.set(0, 0.2, -0.3);
    bancada.add(bumbo);

    const pedal = malha(new THREE.BoxGeometry(0.15, 0.05, 0.25), 0x333333, 'pedal');
    pedal.position.set(0, 0.03, 0.1);
    bancada.add(pedal);

    // --- Estantes: pais fixos, cada uma sustentando a peça que lhe cabe.
    // O filho fica em y = altura do poste (o topo, no espaço LOCAL da
    // estante) — é essa relação que faz mover a estante mover a peça junto,
    // sem que nenhuma coordenada tenha sido somada à mão (Passo 7).
    const estanteCaixa = this.criarEstante('estante-caixa', -0.35, 0.55, 0);
    const caixa = malha(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 24), 0xd9d9d9, 'caixa');
    caixa.position.set(0, 0.55, 0);
    estanteCaixa.add(caixa);
    bancada.add(estanteCaixa);

    const estanteTomMontado = this.criarEstante('estante-tom-1', 0.15, 0.5, -0.25);
    const tomMontado = malha(new THREE.CylinderGeometry(0.14, 0.14, 0.22, 24), 0xb33c3c, 'tom-1');
    tomMontado.position.set(0, 0.5, 0);
    estanteTomMontado.add(tomMontado);
    bancada.add(estanteTomMontado);

    const estantePrato1 = this.criarEstante('estante-prato-crash', -0.5, 0.95, -0.15);
    const prato1 = malha(new THREE.CylinderGeometry(0.22, 0.22, 0.01, 32), 0xd4af37, 'prato-crash');
    prato1.position.set(0, 0.95, 0);
    estantePrato1.add(prato1);
    bancada.add(estantePrato1);

    const estantePrato2 = this.criarEstante('estante-prato-ride', 0.5, 0.95, -0.15);
    const prato2 = malha(new THREE.CylinderGeometry(0.24, 0.24, 0.01, 32), 0xd4af37, 'prato-ride');
    prato2.position.set(0, 0.95, 0);
    estantePrato2.add(prato2);
    bancada.add(estantePrato2);

    // A estante que vai RECEBER o Tom livre — começa sem filho nenhum, e é
    // a segunda ponta da demonstração do Passo 8.
    this.estanteLivre = this.criarEstante('estante-tom-2', 0.35, 0.5, -0.25);
    bancada.add(this.estanteLivre);

    // O Tom que ainda não foi ancorado: filho direto da CENA, pousado no
    // chão — é o "estado inicial" da Seção 6 ("peças começam espalhadas
    // pelo chão"), e por isso não é filho da bancada nem da estante.
    this.tomLivre = malha(new THREE.CylinderGeometry(0.14, 0.14, 0.22, 24), 0xb33c3c, 'tom-2-livre');
    this.tomLivre.position.set(0.9, 0.11, 0.6);
    this.scene.add(this.tomLivre);

    // Baquetas — as únicas peças com "Move: Sim" na Seção 3, por isso são as
    // únicas na lista `interactive` que os controllers podem pegar.
    const baquetaEsquerda = malha(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 8), 0xc79a6b, 'baqueta-esquerda');
    baquetaEsquerda.rotation.z = Math.PI / 2;
    baquetaEsquerda.position.set(-0.25, 0.62, 0.3);
    bancada.add(baquetaEsquerda);
    this.interactive.push(baquetaEsquerda);

    const baquetaDireita = malha(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 8), 0xc79a6b, 'baqueta-direita');
    baquetaDireita.rotation.z = Math.PI / 2;
    baquetaDireita.position.set(0.25, 0.62, 0.3);
    bancada.add(baquetaDireita);
    this.interactive.push(baquetaDireita);

    // --- Indicador de custo do quadro (Passo 9) ---
    this.indicadorCanvas = document.createElement('canvas');
    this.indicadorCanvas.width = 256;
    this.indicadorCanvas.height = 64;
    const contexto = this.indicadorCanvas.getContext('2d');
    if (contexto === null) {
      throw new Error('Não foi possível obter contexto 2D para o indicador de custo.');
    }
    this.indicadorContexto = contexto;
    this.indicadorTextura = new THREE.CanvasTexture(this.indicadorCanvas);

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.indicadorTextura, depthTest: false }),
    );
    sprite.name = 'indicador-de-custo';
    sprite.scale.set(0.5, 0.125, 1);
    sprite.position.set(0, 1.5, -0.9); // preso ao mundo, visível de frente para a bancada
    this.scene.add(sprite);
    this.atualizarCustoDoQuadro(0);
  }

  private addLights(): void {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444455, 1.0);
    hemi.position.set(0, 1, 0);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(1, 3, 2);
    this.scene.add(dir);
  }

  private addFloor(): void {
    const grid = new THREE.GridHelper(6, 12, 0x4f7cff, 0x2a2a35);
    grid.name = 'chao';
    this.scene.add(grid);
  }

  private criarBancada(): THREE.Object3D {
    const bancada = malha(new THREE.BoxGeometry(1.6, 0.05, 1.2), 0x4a4a52, 'bancada');
    bancada.position.set(0, 0.02, -0.2);
    return bancada;
  }

  /** Uma estante é um poste fino de altura `altura`, com a base em y=0 no
   * espaço local do pai (a bancada) e o topo em y=altura. Filhos que se
   * posicionam "sobre" a estante usam y pequeno e positivo, relativo ao
   * topo, porque a origem do nó já está na base. */
  private criarEstante(nome: string, x: number, altura: number, z: number): THREE.Object3D {
    const geometria = new THREE.CylinderGeometry(0.02, 0.02, altura, 12);
    geometria.translate(0, altura / 2, 0); // origem do nó fica na base, não no centro
    const estante = malha(geometria, 0x555560, nome);
    estante.position.set(x, 0, z);
    estante.userData.altura = altura;
    return estante;
  }

  /**
   * Prende `peca` a `novoPai` preservando a posição de mundo — é a operação
   * única do Passo 8. `Object3D.attach` já resolve a nova transformação
   * local; a única coisa que fazemos aqui é medir antes e depois para que a
   * verificação seja em números, e não a olho.
   */
  ancorarPeca(peca: THREE.Object3D, novoPai: THREE.Object3D): ResultadoDeAncoragem {
    const antes = new THREE.Vector3();
    peca.getWorldPosition(antes);

    novoPai.attach(peca);
    peca.position.y = (novoPai.userData.altura as number | undefined) ?? peca.position.y;

    const depois = new THREE.Vector3();
    peca.getWorldPosition(depois);

    return { antes, depois, desvio: antes.distanceTo(depois) };
  }

  /** A árvore de cena, linha por linha, para exibir na página (Passo 7). */
  estrutura(): string[] {
    const linhas: string[] = ['cena'];
    for (const filho of this.scene.children) {
      linhas.push(...this.arvoreDeUmNo(filho, 1));
    }
    return linhas;
  }

  private arvoreDeUmNo(no: THREE.Object3D, profundidade: number): string[] {
    const rotulo = no.name.length > 0 ? no.name : `(${no.type})`;
    const linhas = [`${'  '.repeat(profundidade - 1)}└─ ${rotulo}`];
    for (const filho of no.children) {
      linhas.push(...this.arvoreDeUmNo(filho, profundidade + 1));
    }
    return linhas;
  }

  /**
   * Atualiza o indicador de custo do quadro dentro da própria cena.
   * Redesenhado a cada 10 quadros: redesenhar um canvas 2D a cada quadro é
   * gasto desnecessário para um texto que não precisa mudar 60 vezes por
   * segundo. `forcar` ignora o throttle (usado na primeira chamada).
   */
  atualizarCustoDoQuadro(ms: number, forcar = false): void {
    this.quadrosDesdeUltimaAtualizacao += 1;
    if (!forcar && this.quadrosDesdeUltimaAtualizacao < 10) {
      return;
    }
    this.quadrosDesdeUltimaAtualizacao = 0;

    const ctx = this.indicadorContexto;
    const { width, height } = this.indicadorCanvas;
    const dentroDoOrcamento = ms <= ORCAMENTO_QUADRO_MS;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(10, 10, 20, 0.78)';
    ctx.fillRect(0, 0, width, height);
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillStyle = dentroDoOrcamento ? '#4ade80' : '#f87171';
    ctx.fillText(`${ms.toFixed(1)} ms  (teto ${ORCAMENTO_QUADRO_MS} ms)`, 10, 40);

    this.indicadorTextura.needsUpdate = true;
  }

  /** Sem animação contínua no momento — não há mais cubos flutuando.
   * Mantido para simetria com o laço de main.ts, que chama xr.update(delta)
   * a cada quadro (Passo 9: o laço anda contra o relógio, não por quadro). */
  update(_delta: number): void {
    // ponto de extensão
  }
}
