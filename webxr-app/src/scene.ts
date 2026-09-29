import * as THREE from 'three';

export const ORCAMENTO_QUADRO_MS = 33.3;

export const ESCALA_MESA = 0.3;

const POSICAO_Y_DO_BUMBO = 0.325;
const POSICAO_Z_DO_BUMBO = -0.3;

const RECUO_DO_BUMBO_M = 0.15;
const PERIODO_DO_BUMBO_S = 4;

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

export class XRScene {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly interactive: THREE.Object3D[] = [];

  readonly bateria: THREE.Group;
  private readonly chao: THREE.GridHelper;

  readonly bumbo: THREE.Object3D;

  readonly tomLivre: THREE.Object3D;

  private demonstrandoParentesco = false;
  private tempoDaDemonstracao = 0;

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
    this.chao = this.addFloor();

    this.bateria = new THREE.Group();
    this.bateria.name = 'bateria';
    this.scene.add(this.bateria);

    const bancada = this.criarBancada();
    this.bateria.add(bancada);

    this.bumbo = malha(
      new THREE.CylinderGeometry(0.3, 0.3, 0.4, 24).rotateX(Math.PI / 2),
      0x8a5a2b,
      'bumbo',
    );
    this.bumbo.position.set(0, POSICAO_Y_DO_BUMBO, POSICAO_Z_DO_BUMBO);
    bancada.add(this.bumbo);

    const pedal = malha(new THREE.BoxGeometry(0.15, 0.05, 0.25), 0x333333, 'pedal');
    pedal.position.set(0, -0.275, 0.335);
    this.bumbo.add(pedal);

    const tom1 = malha(new THREE.CylinderGeometry(0.14, 0.14, 0.22, 24), 0xb33c3c, 'tom-1');
    tom1.position.set(-0.16, 0.45, 0.05);
    tom1.rotation.x = 0.2;
    this.bumbo.add(tom1);

    const surdo = malha(new THREE.CylinderGeometry(0.17, 0.17, 0.4, 24), 0xb33c3c, 'tom-3-surdo');
    surdo.position.set(0.5, 0.225, 0.02);
    bancada.add(surdo);

    const estanteCaixa = this.criarEstante('estante-caixa', -0.35, 0.55, 0.12);
    const caixa = malha(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 24), 0xd9d9d9, 'caixa');
    caixa.position.set(0, 0.55, 0);
    estanteCaixa.add(caixa);
    bancada.add(estanteCaixa);

    const estanteChimbal = this.criarEstante('estante-chimbal', -0.6, 1.0, 0.05);
    const chimbalInferior = malha(new THREE.CylinderGeometry(0.2, 0.2, 0.01, 32), 0xd4af37, 'prato-chimbal-inferior');
    chimbalInferior.position.set(0, 1.0, 0);
    estanteChimbal.add(chimbalInferior);
    const chimbalSuperior = malha(new THREE.CylinderGeometry(0.2, 0.2, 0.01, 32), 0xd4af37, 'prato-chimbal-superior');
    chimbalSuperior.position.set(0, 1.03, 0);
    estanteChimbal.add(chimbalSuperior);
    bancada.add(estanteChimbal);

    const estanteCrash = this.criarEstante('estante-crash', -0.4, 1.3, -0.5);
    const crash = malha(new THREE.CylinderGeometry(0.22, 0.22, 0.01, 32), 0xd4af37, 'prato-crash');
    crash.position.set(0, 1.3, 0);
    estanteCrash.add(crash);
    bancada.add(estanteCrash);

    const estanteRide = this.criarEstante('estante-ride', 0.45, 1.2, -0.45);
    const ride = malha(new THREE.CylinderGeometry(0.24, 0.24, 0.01, 32), 0xd4af37, 'prato-ride');
    ride.position.set(0, 1.2, 0);
    estanteRide.add(ride);
    bancada.add(estanteRide);

    this.tomLivre = malha(new THREE.CylinderGeometry(0.14, 0.14, 0.22, 24), 0xb33c3c, 'tom-2-livre');
    this.tomLivre.position.set(0.9, 0.11, 0.6);
    this.bateria.add(this.tomLivre);

    const baquetaEsquerda = malha(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 8), 0xc79a6b, 'baqueta-esquerda');
    baquetaEsquerda.rotation.z = Math.PI / 2;
    baquetaEsquerda.position.set(-0.25, 0.62, 0.36);
    bancada.add(baquetaEsquerda);
    this.interactive.push(baquetaEsquerda);

    const baquetaDireita = malha(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 8), 0xc79a6b, 'baqueta-direita');
    baquetaDireita.rotation.z = Math.PI / 2;
    baquetaDireita.position.set(0.25, 0.62, 0.36);
    bancada.add(baquetaDireita);
    this.interactive.push(baquetaDireita);

    this.indicadorCanvas = document.createElement('canvas');
    this.indicadorCanvas.width = 512;
    this.indicadorCanvas.height = 128;
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
    sprite.position.set(0, 1.5, -0.9);
    this.bateria.add(sprite);
    this.atualizarCustoDoQuadro(0, true);
  }

  private addLights(): void {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444455, 1.0);
    hemi.position.set(0, 1, 0);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(1, 3, 2);
    this.scene.add(dir);
  }

  private addFloor(): THREE.GridHelper {
    const grid = new THREE.GridHelper(6, 12, 0x4f7cff, 0x2a2a35);
    grid.name = 'chao';
    this.scene.add(grid);
    return grid;
  }

  private criarBancada(): THREE.Object3D {
    const bancada = malha(new THREE.BoxGeometry(1.6, 0.05, 1.2), 0x4a4a52, 'bancada');
    bancada.position.set(0, 0.02, -0.2);
    return bancada;
  }

  private criarEstante(nome: string, x: number, altura: number, z: number): THREE.Object3D {
    const geometria = new THREE.CylinderGeometry(0.02, 0.02, altura, 12);
    geometria.translate(0, altura / 2, 0);
    const estante = malha(geometria, 0x555560, nome);
    estante.position.set(x, 0, z);
    return estante;
  }

  ancorarPeca(peca: THREE.Object3D, novoPai: THREE.Object3D): ResultadoDeAncoragem {
    const antes = new THREE.Vector3();
    peca.getWorldPosition(antes);

    novoPai.attach(peca);

    const depois = new THREE.Vector3();
    peca.getWorldPosition(depois);

    return { antes, depois, desvio: antes.distanceTo(depois) };
  }

  prepararParaMesa(): void {
    this.chao.visible = false;
    this.bateria.visible = false;
    this.bateria.scale.setScalar(ESCALA_MESA);
  }

  colocarBateria(superficie: THREE.Matrix4): void {
    this.bateria.position.setFromMatrixPosition(superficie);

    const olho = this.camera.position;
    this.bateria.rotation.set(
      0,
      Math.atan2(olho.x - this.bateria.position.x, olho.z - this.bateria.position.z),
      0,
    );
    this.bateria.visible = true;
  }

  restaurarTamanhoReal(): void {
    this.bateria.position.set(0, 0, 0);
    this.bateria.rotation.set(0, 0, 0);
    this.bateria.scale.setScalar(1);
    this.bateria.visible = true;
    this.chao.visible = true;
  }

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

  atualizarCustoDoQuadro(ms: number, forcar = false): void {
    this.quadrosDesdeUltimaAtualizacao += 1;
    if (!forcar && this.quadrosDesdeUltimaAtualizacao < 10) {
      return;
    }
    this.quadrosDesdeUltimaAtualizacao = 0;

    const ctx = this.indicadorContexto;
    const { width, height } = this.indicadorCanvas;
    const dentroDoOrcamento = ms <= ORCAMENTO_QUADRO_MS;

    const margem = 20;
    const larguraUtil = width - 2 * margem;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(10, 10, 20, 0.78)';
    ctx.fillRect(0, 0, width, height);
    ctx.font = 'bold 52px system-ui, sans-serif';
    ctx.fillStyle = dentroDoOrcamento ? '#4ade80' : '#f87171';
    ctx.fillText(`${ms.toFixed(1)} ms`, margem, 58, larguraUtil);
    ctx.font = '36px system-ui, sans-serif';
    ctx.fillStyle = '#dde';
    ctx.fillText(
      `teto ${ORCAMENTO_QUADRO_MS} ms · ${dentroDoOrcamento ? 'dentro' : 'acima'}`,
      margem,
      108,
      larguraUtil,
    );

    this.indicadorTextura.needsUpdate = true;
  }

  alternarDemonstracaoDoBumbo(): boolean {
    this.demonstrandoParentesco = !this.demonstrandoParentesco;
    this.tempoDaDemonstracao = 0;
    this.bumbo.position.z = POSICAO_Z_DO_BUMBO;
    return this.demonstrandoParentesco;
  }

  update(delta: number): void {
    if (!this.demonstrandoParentesco) return;
    this.tempoDaDemonstracao += delta;
    const fase = (2 * Math.PI * this.tempoDaDemonstracao) / PERIODO_DO_BUMBO_S;
    this.bumbo.position.z = POSICAO_Z_DO_BUMBO - (RECUO_DO_BUMBO_M * (1 - Math.cos(fase))) / 2;
  }
}
