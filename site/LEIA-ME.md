# Site da Tintas Matriz

Site de uma página só, feito para ser apresentado na TV e no iPad. Funciona sozinho: imagens, fontes e bibliotecas estão dentro desta pasta, sem depender de nenhum outro site.

## Como colocar no ar (Netlify, grátis)

1. Entre em **app.netlify.com/drop** (crie uma conta se ainda não tiver).
2. Arraste a pasta **`site`** inteira para a área indicada.
3. Em segundos aparece um endereço, tipo `nome-aleatorio.netlify.app`. O site já está no ar.
4. Para trocar o nome do endereço: **Site configuration → Change site name**.
5. Para atualizar depois: abra o site no Netlify, vá em **Deploys** e arraste a pasta `site` de novo.

> Abrir o `index.html` direto do computador (dois cliques) **não funciona**: o navegador bloqueia as partes em 3D fora de um endereço de site. Use o Netlify.

## Como apresentar na reunião

- **F** (ou o botão de tela cheia no topo): entra e sai da tela cheia.
- **Seta para baixo / espaço:** avança um passo (inclui cada etapa da Emborrachada e cada produto da prateleira). **Seta para cima:** volta.
- **Page Down / Page Up** (ou o passador de slides): pula de seção em seção.
- **Esc:** fecha o detalhe de um produto.
- **No iPad:** toque em **Ativar movimento** no topo para o balde acompanhar a inclinação do aparelho. Arraste qualquer balde com o dedo para girar.
- **Modo vitrine:** depois de 30 segundos sem ninguém mexer, o site se apresenta sozinho (topo → Emborrachada → prateleira → Sua marca). Basta tocar, mexer o mouse ou apertar uma tecla para sair.

## O único arquivo que você edita: `js/dados.js`

Abra num editor de texto (Bloco de Notas serve), troque o que está entre aspas e salve. Depois arraste a pasta no Netlify de novo.

### Pré-carregar a marca da rede antes da reunião
Em `marcaCliente`:
```js
marcaCliente: { nome: 'Nome da Rede', logo: 'img/clientes/logo-da-rede.png', cor: '#1E5FA8' },
```
1. Crie a pasta `img/clientes/` e coloque o logo da rede (PNG com fundo transparente ou SVG).
2. Escreva o nome e o caminho do logo como no exemplo.
3. `cor` é a cor do rótulo (código hex). Se não souber, deixe `'#C8102E'`.

Na seção "Sua marca", o balde já abre com o rótulo da rede, e o modo vitrine também usa esse nome.

### Modo reunião (esconder o que falta)
- `modoReuniao: true` → nada de [A DEFINIR] ou [NÚMERO] aparece. O que estiver vazio some da tela (contadores, chips, contatos).
- `modoReuniao: false` → mostra tudo o que falta preencher, para você revisar.

### Som
- `somLigado: false` (padrão) → o site abre em silêncio. Aparece um botão de som no topo para ligar na hora.
- `somLigado: true` → o som liga no primeiro toque na tela.

### Outros campos
- **Contatos** (`whatsapp`, `instagram`, `telefone`, `endereco`). Quando o WhatsApp está preenchido, o botão e o QR code abrem a conversa.
- **Números da fábrica** (`CONTADORES`): preencha `valor` só com algarismos. Com o modo reunião ligado, os vazios somem. Se todos estiverem vazios, a faixa inteira some.
- **Pedido mínimo e prazo** (`SUA_MARCA`): vazio = não aparece.
- **Modo vitrine** (`vitrine`): `ativo: false` desliga; `segundos` muda a espera.

## Pastas

- `index.html` · página
- `css/style.css` · visual
- `js/dados.js` · **produtos, cores, contatos, números, marca do cliente**
- `js/main.js` · liga tudo (rolagem, prateleira, Sua marca, vitrine, teclado)
- `js/gl/` · motor 3D único: `motor.js` (um só desenho para o site inteiro, pausa sozinho), `balde3d.js` (balde redondo em 3D), `fluido.js` (tinta líquida do topo), `particulas.js`
- `js/cenas.js` · as cenas 3D de cada seção
- `js/rotulo.js` · desenha os rótulos (padrão Matriz e marca do cliente)
- `js/simulador.js` · simulador de cor na parede
- `js/demos.js` · diferenciais (planta, régua, antes/depois, baixo odor)
- `js/som.js` · som opcional, gerado no navegador
- `js/palco.js` · versão em imagem dos baldes (aparelhos sem 3D e detalhe do produto)
- `img/baldes/` · renders sem fundo (`-800` e `-1600` px) + `luz/` (luz das bordas)
- `img/rotulos/` · rótulo de cada balde "desenrolado" em 360° para o 3D
- `vendor/` · GSAP, ScrollTrigger, Three.js, RoomEnvironment, gerador de QR code
- `fonts/` · Sora e Inter

## Se o aparelho não tiver 3D

O site percebe sozinho e troca para a versão em imagens: os baldes viram fotos com luz e pódio, a prateleira vira uma fila de fotos e o "Sua marca" desenha o balde em 2D. Com "reduzir movimento" ligado no aparelho, as animações param e tudo aparece pronto.

## O que ficou para confirmar

- **WhatsApp (11) 96284-2432 e Instagram @tintasmatriz:** tirados do rodapé do catálogo 2024. Confirmar se continuam valendo.
- **Telefone e endereço:** não estão no catálogo. Ficam escondidos até serem preenchidos.
- **Números da fábrica** (anos, litros por mês, cores no tintométrico, revendas): não estão no catálogo. Os rótulos são sugestão.
- **Pedido mínimo e prazo de produção** para marca própria.
- **Rendimento da Manta Líquida:** o catálogo não informa. No detalhe dela, a linha de rendimento some.
- **Cores das cartelas:** são aproximadas, tiradas das amostras do PDF. O site avisa "Cores aproximadas, consulte a cartela".
- **Borracha Líquida:** no catálogo, o balde "4 Estações" é a embalagem dela. O site usa esse render para ela.
- **Esmalte Epóxi:** o catálogo mostra só a cor "Branco Acetinado".
- **Produtos sem render** (Verniz, Resina, Massa Corrida, Massa Acrílica, Selador, Texturas, Fundo Preparador): ganham um balde 3D com rótulo ilustrativo no padrão Matriz (nome do catálogo + linha). O detalhe avisa "Rótulo ilustrativo". Trocar quando houver foto real.
- **Faixa premium/standard/econômica:** só os produtos que o catálogo classifica aparecem na régua.
- **"Baixo odor":** a lista só traz os produtos que o catálogo descreve como baixo odor ou sem cheiro.
