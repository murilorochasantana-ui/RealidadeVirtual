
export interface Estabilidade {
  readonly totalQuadros: number;
  readonly quadrosSemPose: number;
  readonly maiorLacuna: number;
  readonly quadrosOcultos: number;
}


export class ContadorDeEstabilidade {
  private total: number = 0;
  private semPose: number = 0;
  private ocultos: number = 0;
  private maiorLacuna: number = 0;
  private lacunaCorrente: number = 0;

  public registrar(temPose: boolean, visivel: boolean): void {
    this.total += 1;

    if (!visivel) {
      this.ocultos += 1;
      this.lacunaCorrente = 0;
      return;
    }

    if (temPose) {
      this.lacunaCorrente = 0;
      return;
    }

    this.semPose += 1;
    this.lacunaCorrente += 1;
    if (this.lacunaCorrente > this.maiorLacuna) {
      this.maiorLacuna = this.lacunaCorrente;
    }
  }

  public resultado(): Estabilidade {
    return {
      totalQuadros: this.total,
      quadrosSemPose: this.semPose,
      maiorLacuna: this.maiorLacuna,
      quadrosOcultos: this.ocultos,
    };
  }
}


export function diagnosticar(estabilidade: Estabilidade): string {
  const { totalQuadros, quadrosSemPose, maiorLacuna } = estabilidade;

  if (totalQuadros === 0) {
    return 'Nenhum quadro foi entregue a sessão não chegou a produzir imagem.';
  }

  if (quadrosSemPose === 0) {
    return 'A pose veio em todos os quadros observados. A janela de observação é curta, e ausência de falha aqui não é promessa de estabilidade em uso prolongado.';
  }

  const proporcao = Math.round((quadrosSemPose / totalQuadros) * 100);
  return (
    `A pose faltou em ${proporcao}% dos quadros, com lacuna máxima de ` +
    `${maiorLacuna} quadros seguidos. As causas prováveis são superfície ` +
    'sem textura, iluminação pobre ou movimento brusco e daqui não se distingue qual delas.'
  );
}
