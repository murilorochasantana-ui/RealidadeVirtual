# Aparelhos testados

O mesmo endereço, aberto em aparelhos de classes diferentes, precisa produzir relatórios diferentes
(Passo 6). Cada linha abaixo registra o que foi de fato observado; o que ainda não foi medido está
marcado como _a preencher_.

| Aparelho | Regime que abriu | O que não abriu |
| :--- | :--- | :--- |
| Chromium 141 em Linux, sem visor nem câmera (navegador de teste automatizado) | Na tela (`inline`) | No visor (`immersive-vr`) e Pela câmera (`immersive-ar`): o aparelho respondeu "não suportado" |
| Celular do grupo (modelo e navegador: _a preencher_) | Pela câmera (`immersive-ar`): a sessão abriu e a bateria apareceu sobre a imagem da câmera | _a preencher com o relatório do botão "Sondar aparelho"_ |

## Custo do quadro medido

O número vem da plaqueta de custo dentro da cena (Passo 9). Teto declarado: 33,3 ms (30 FPS,
Seção 10 da especificação).

| Aparelho | Regime | Custo observado | Dentro do teto? |
| :--- | :--- | :--- | :--- |
| Chromium 141 em Linux, renderização por software (sem placa de vídeo) | Na tela | entre 35 e 132 ms | Não — a máquina de teste não tem aceleração gráfica, então o número não representa um aparelho real |
| Celular do grupo | Pela câmera | _a preencher_ | _a preencher_ |

## Como preencher uma linha nova

1. Abra o endereço no aparelho (ver "Como pôr para rodar" no [README](../README.md)).
2. No painel **Relatório**, anote a tabela "Regimes suportados" (o que o aparelho diz suportar).
3. Toque em **Sondar aparelho** e anote o que a sessão respondeu: modo aberto, recursos concedidos
   ou não, graus de liberdade.
4. Abra o regime (START AR / ENTER VR, ou só a tela) e anote o custo da plaqueta com a cena parada.
