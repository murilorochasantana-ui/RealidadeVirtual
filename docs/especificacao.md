# Bateria Acústica

---

## Bloco A

### Seção 1
* **Grupo 4:**
  * Guilherme Yuji Tanaka
  * Leandro Henrico Ide Tonelotti
  * Maria Fernanda Rodrigues Santos
  * Murilo Gonçalves Rocha Santana
  * Pedro Henrique Arroio Quiqueto Franco
* **Cenário:** Bateria Acústica
* **Conceito:** Um ambiente com liberdade para expressar e experimentar (*BADUM TSS*).
* **Justificativa e Risco:** Essa cena endurece a interação, retorno e regras de encaixe. Escolhemos pela liberdade para projetar. O risco é de escopo e pretendemos fazer um ponto de decisão entre fases para lidar com isso.

### Seção 2
A pessoa chega, vê a bateria, se posiciona e interage com o instrumento.

### Seção 3
| Objeto | Quantos | Origem | Move | Observação
| :--- | :--- | :--- | :--- | :---: |
| Baqueta | 2 | Modelo Importado + Código | Sim |  Usada para ativar o som
| Bumbo | 1 | Modelo Importado + Código | Não | Parte da bateria
| Pratos | 4 | Modelo Importado + Código | Não | Parte da bateria
| Caixa | 1 | Modelo Importado + Código | Não | Parte da bateria
| Tons | 3 | Modelo Importado + Código | Não | Parte da bateria
| Estantes | 4 | Modelo Importado | Não | Parte da bateria
| Pedal | 1 | Modelo Importado + Código | Não | Parte da bateria
| Bancada | 1 | Modelo Importado | Não | Apoio fixo da cena

### Seção 4
* **Dimensões e Proporções:**
  * **Espaço total da bateria:** ~2,50 m de largura × 2,00 m de profundidade.
  * **Bumbo:** ~0,60 m de diâmetro × 0,40 m de profundidade.
  * **Caixa:** ~0,36 m de diâmetro × 0,15 m de altura.
  * **Tons:** entre 0,25 m e 0,35 m de diâmetro.
  * **Pratos:** entre 0,40 m e 0,50 m de diâmetro.
  * **Estantes:** altura variando de 1,00 m a 1,50 m.
* **Escalas Previstas:**
  * Versão menor para uso sobre mesa via câmera do celular.
  * Versão em tamanho real.

---

## Bloco B

### Seção 5
| Ação | O que a pessoa faz | O que o sistema faz | Se não puder
| :--- | :--- | :--- | :---: |
| Tocar | Interage com uma peça | Libera o som referente a peça | Se nenhum peça for selecionada, não solta o som
| Ajustar Altura | Segura a peça para alinhar a altura correta | Desliza a peça conforme o movimento | Avisa que atingiu o limite
| Ajustar Ângulo | Segura a peça já encaixada e gira | A peça se inclina e mantém o novo ângulo | Avisa que atingiu o limite
| Encaixar Peças | Aproxima as peças onde deve ser fixado | A peça fica rígida e imóvel | Recusa e diz o motivo
| Soltar sem encaixar | Solta a peça selecionada fora de qualquer ponto de fixação | A peça cai e permance no chão | Não se aplica

### Seção 6
* **Estado inicial:**  As peças da bateria começam espalhadas pelo chão.
* **Estado Final:** O conjunto da bateria é totalmente montado. A partir desse momento, as peças respondem ao toque do usuário com os sons correspondentes de cada peça.
* **Ordem das Etapas:** A ordem de montagem é livre. O usuário terá liberdade parcial na posição final (como a escolha da altura e do ângulo).
* **Validação:**  A tarefa está cumprida quando a bateria está completa. Como a ordem é livre, a condição é que todas as conexões obrigatórias de ancoragem tenham sido feitas.

### Seção 7
* **Folga de posição:** 8cm, pois como a mão será usada um valor muito acima ou muito abaixo torna difícil acertar o tracking da mão.
* **Folga de Ângulo:** 20°, pois um valor muito abaixo ou muito acima poderá resultar em erro por tremor de pulso ou baixará a credibilidade do encaixe.

### Seção 8
* **Objeto mirado:** A peça da bateria sendo mirada fica circulada com uma luz verde.
* **Objeto apanhado:** O objeto ficará com um contorno em negrito.
* **Encaixe aceito:**  O som da parte selecionada é reproduzido.
* **Encaixe recusado:** Nenhum som da bateria é reproduzido.
* **Tarefa concluída:** O usuário consegue construir músicas com a bateria virtual.
---

## Bloco C 

### Seção 9
| Aspecto | Na Tela | No Visor | Pela Câmera
| :--- | :--- | :--- | :---: |
| Como se olha | Projetada em um plano fixo, controlado pelo sistema| Cena ao redor da cabeça, enquadramento é o próprio corpo virando, a bateria existe atrás e dos lados também | Cena sobreposta ao espaço físico real da sala, através da tela do dispositivo apontado para frente
| Como se aponta e age | Cursor ou toque na tela, mira e ação são mesmo ponto 2D | Mão rastreada ou raio a partir do controle, mira é onde o braço aponta no espaço 3D | Mão ou dispositivo apontado para um ponto do espaço físico, a mira depende de onde a peça virtual foi ancorada na sala real
| Escala da cena | Reduzida, cabe inteira num retângulo; a pessoa vê a bateria de fora, como uma maquete | Tamanho real ou próximo dele, a pesosa está dentro da cena, no meio das peças | Tamanho real, mas convivendo com a escala do cômodo onde a pessoa está fisicamente
| O que a cena faz de diferente | Reorganiza para caber no enquadramento, pode girar sozinha para mostrar ângulos | Permanece fixa no espaço virtual enquanto a cabeça se move ao redor dela| Ancora num ponto do chão ou mesa reais e permance ali enqunato a pessoa anda pelo cômodo
| O que não existe neste regime | Não existe se virar. A cena não está ao redor, está na frente | Não existe o cômodo da pessoa, tudo é substituido pelo espaço virtual| Não existe reposicionamento livre da bateria inteira sem sair do app.

### Seção 10
* Vamos ter 14 objetos. 
* Os pratos, os tons e as estantes se repetem mais a ideia é reutilizar os mesmos modelos sempre que possível.
* Queremos manter fluidez de no mínimo 30 FPS, utilizando modelos mais simples e, quando possível, os mesmos materiais e texturas pros objetos que repetem. 
* Caso a cena fique pesada, a otimização seguirá uma ordem. 
* * Primeiro, serão reduzidos os detalhes dos modelos, principalmente nas peças menores. 
* * Se ainda não for suficiente, serão reduzidos ou retirados alguns objetos que não sejam essenciais para a interação. 
* * Por último, o cenário ao redor da bateria será simplificado, mantendo apenas o que for realmente necessário.

### Seção 11
* **1. O celular não suporta a aplicação:** Se o celular não tiver desempenho suficiente, o aplicativo deverá avisar o usuário. Sempre que possível, poderá usar uma versão mais simples da cena, com menos detalhes 
* **2. Permissão da câmera negada:** Se o usuário não permitir o acesso à câmera, o aplicativo deverá informar que a câmera é necessária para utilizar a realidade aumentada. Também deverá orientar o usuário a liberar a permissão nas configurações do celular.
* **3. Perda do rastreamento:** Se a câmera apontar para uma parede lisa ou para um local onde o celular não consiga identificar bem o ambiente, o rastreamento poderá ser perdido. Nesse caso, a bateria ficará parada temporariamente e o aplicativo pedirá para o usuário apontar a câmera para outro local com mais detalhes.
* **4. Usuário fora do espaço de interação:** Se o usuário ficar muito longe da bateria ou tentar alcançar uma peça que esteja fora do alcance definido, a interação será limitada. O aplicativo poderá avisar que é necessário se aproximar da bateria para continuar utilizando aquela parte da cena.

---

## Bloco D

### Seção 12
| Arquivo (File) | Origem (Autor/Site) | Licença | Endereço (Link) |
| :--- | :--- | :--- | :--- |
| `drums.obj` | "Drums" por *luka00* (Sketchfab) | CC BY 4.0 | https://sketchfab.com/3d-models/drums-607b086f7ace4fbbbfb9086a0f5a4aa3 |
| `drum_sticks.fbx` | "Drum Sticks" por *tubivr56* (Sketchfab) | CC BY 4.0 | https://sketchfab.com/3d-models/drum-sticks-2e96348b71314a928ecd69e0bb37ee8d |
| `som_prato_crash.wav`| "CRASH VERB" por *.Andre_Onate* (Freesound) | CC0 | https://freesound.org/people/.Andre_Onate/sounds/161447/ |
| `som_chimbal.wav` | "Hat_05-9" por *CBeeching* (Freesound) | CC0 | https://freesound.org/people/CBeeching/sounds/75045/ |
| `tex_madeira_095.png`| "Wood 095" (AmbientCG) | CC0 | https://ambientcg.com/view?id=Wood095 |
| `tex_metal_038.png` | "Metal 038" (AmbientCG) | CC0 | https://ambientcg.com/view?id=Metal038 |

### Seção 13

* **Bloco A:** Cenário abre com a bateria já montada.
* **Bloco B:** Instrumentos permanecem em posições definidas.
* **Bloco C:** Cada peça responde ao toque com seu som.
* **Bloco D:** As peças apresentam resposta visual ao toque.

### Seção 14
#### Riscos
* **Referencial sonoro no visor:** a posição do som pode não bater com a posição da cabeça no visor. Testar primeiro na tela, depois portar e medir no visor, antes de iniciar esse regime.
* **Latência entre toque e som:** atraso perceptível quebra o retorno imediato, que é o ganho central do projeto. Medir o tempo de resposta em cada regime; declarar se a câmera atrasar mais, ao final de cada regime implementado.
* **Encaixe vs. ajuste livre confundidos:** risco de tratar encaixar, ajustar altura e ajustar ângulo como uma função só, perdendo a distinção de restrições da Seção 5. Revisar as três ações separadamente antes de integrar, antes dos testes de recusa com usuários.
* **Câmera em ambiente real variável:** iluminação ruim ou espaço pequeno pode impedir a ancoragem.

#### Decisões em aberto
* **Trava visual no ajuste:** guia visual de limite ou só aviso textual.
* **Prioridade entre visor e câmera:** decide-se pelo regime com ancoragem mais estável ao final.
