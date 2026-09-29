# Bateria Acústica — ambiente WebXR

Trabalho de Realidade Virtual do **Grupo 4**: Guilherme Yuji Tanaka, Leandro Henrico Ide Tonelotti,
Maria Fernanda Rodrigues Santos, Murilo Gonçalves Rocha Santana e Pedro Henrique Arroio Quiqueto Franco.

## O que é o ambiente

Uma bateria acústica em que a pessoa chega, vê o instrumento, monta as peças nos seus suportes e
toca (especificação completa em [`docs/especificacao.md`](docs/especificacao.md)). O mesmo endereço
abre em três regimes:

| Regime | O que faz com o mundo de quem observa | Onde abre |
| :--- | :--- | :--- |
| Na tela (`inline`) | mostra a bateria por uma janela, sem tocar o mundo | qualquer navegador |
| No visor (`immersive-vr`) | substitui o mundo inteiro | visor com WebXR |
| Pela câmera (`immersive-ar`) | mantém o mundo e deposita a bateria sobre uma mesa ou o chão | celular Android com ARCore |

Estado atual (Módulos 01 a 03): a cena é montada como árvore, com geometria primitiva e escala em
metros; há uma sonda que pergunta ao aparelho o que ele suporta e um relatório legível na própria
tela; a troca de pai preserva a posição no mundo, conferida em números; e o custo de cada quadro
aparece dentro da cena, contra um teto declarado.

## Como pôr para rodar

Requisitos: [Node.js](https://nodejs.org/) 20.19 ou mais novo (ou 22.12+).

```bash
cd webxr-app
npm install
npm run dev
```

- **No computador:** abra `https://localhost:5173`.
- **No celular:** conecte-o ao mesmo Wi-Fi do computador e abra o endereço **Network** que o terminal
  mostra (algo como `https://192.168.x.x:5173`). O navegador avisa que o certificado não é
  confiável porque ele é gerado pelo próprio projeto (a API XR exige HTTPS): toque em "Avançado" →
  "Continuar".
- **Windows, se o PowerShell bloquear o `npm`** ("a execução de scripts foi desabilitada"): use
  `npm.cmd install` e `npm.cmd run dev`, ou rode os comandos no Prompt de Comando (cmd).

Outros comandos: `npm run typecheck` (confere os tipos) e `npm run build` (gera `webxr-app/dist`).

## Roteiro da demonstração

Na ordem pedida pela atividade, com o painel **Cena e ancoragem** aberto:

1. **A cena abre com os objetos que a especificação prometeu:** as 17 peças da Seção 3 aparecem na
   tela e na árvore do painel (o bloco "Domínio" do painel **Relatório** mostra a mesma contagem).
2. **Um objeto se move junto com outro porque está preso a ele:** botão **Mover o bumbo**. O bumbo
   recua e volta; o tom de ataque e o pedal vão junto porque são filhos dele.
3. **Um objeto troca de pai e continua onde estava no mundo:** botão **Ancorar o tom no bumbo**. O
   painel mostra a posição antes e depois e o desvio (~1e-16 m). Mover o bumbo de novo leva esse tom
   junto — prova de que o pai mudou.
4. **O indicador de custo do quadro está visível dentro da cena:** a plaqueta acima da bateria, com o
   custo em ms e o teto de 33,3 ms.

No celular, **START AR**: aponte para uma mesa ou o chão até aparecer o anel azul e toque para colocar
a bateria (em escala de mesa); tocar em outro ponto muda a bateria de lugar.

## Onde está cada passo

| Passo | Onde ver com o projeto rodando | Onde está no código |
| :--- | :--- | :--- |
| 1. Escolher a cena | — | `docs/especificacao.md`, Seção 1 |
| 2. Delimitar o domínio | painel Relatório → "Domínio" | `src/bancada/dominio/dominio.ts` |
| 3. Declarar os três regimes | painel Relatório → "Regimes suportados" e detalhes | `src/bancada/modes/regimes.ts` |
| 4. Especificação | — | `docs/especificacao.md` |
| 5. Sonda de capacidades | painel Relatório → botão "Sondar aparelho" | `src/bancada/devices/` |
| 6. Relatório visível | painel Relatório inteiro | `src/bancada/relatorio/`, `src/paineis.ts` |
| 7. Cena como árvore | painel Cena → árvore e "Mover o bumbo" | `src/scene.ts` |
| 8. Reparentar | painel Cena → "Ancorar o tom no bumbo" | `src/scene.ts` (`ancorarPeca`) |
| 9. Laço contra o relógio | plaqueta de custo na cena; "Mover o bumbo" | `src/main.ts`, `src/scene.ts` (`update`) |

Os caminhos de código são relativos a `webxr-app/`. O regime pela câmera (colocar e mover a bateria
numa superfície real) está em `src/ar.ts`.

## Em que aparelhos já foi visto funcionando

Ver a tabela em [`docs/aparelhos-testados.md`](docs/aparelhos-testados.md): aparelho, regime que
abriu e o que não abriu.
