import { REGIMES, type Regime, type RegimeId } from './regimes';

export type SuporteARegime = 'sim' | 'não' | 'api-ausente';

export interface LinhaDoRelatorio {
  readonly regime: Regime;
  readonly suporte: SuporteARegime;
}

export async function levantarRelatorio(): Promise<LinhaDoRelatorio[]> {
  const xr: XRSystem | undefined = navigator.xr;

  if (xr === undefined) {
    return REGIMES.map((regime) => ({ regime, suporte: 'api-ausente' }));
  }

  const linhas: LinhaDoRelatorio[] = await Promise.all(
    REGIMES.map(async (regime): Promise<LinhaDoRelatorio> => {
      try {
        const suporta: boolean = await xr.isSessionSupported(
          regime.id as RegimeId,
        );
        return { regime, suporte: suporta ? 'sim' : 'não' };
      } catch {
        return { regime, suporte: 'não' };
      }
    }),
  );

  return linhas;
}
