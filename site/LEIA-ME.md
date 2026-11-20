# Site da Tintas Matriz

Site de uma página só. Funciona sozinho: as imagens, as fontes e as bibliotecas estão todas dentro desta pasta, então ele não depende de nenhum outro site para abrir.

## Como colocar no ar (Netlify, grátis)

1. Entre em **app.netlify.com/drop** (crie uma conta se ainda não tiver).
2. Arraste a pasta **`site`** inteira para a área indicada na página.
3. Espere uns segundos. O Netlify mostra um endereço, tipo `nome-aleatorio.netlify.app`. O site já está no ar.
4. Para trocar o nome do endereço: **Site configuration → Change site name**.
5. Para usar um domínio próprio (ex.: tintasmatriz.com.br): **Domain management → Add a domain**.

Para atualizar depois: no site do Netlify, abra **Deploys** e arraste a pasta `site` de novo.

## Como apresentar na reunião (TV ou tablet)

- Abra o site e aperte **F** (ou o botão de tela cheia no canto de cima) para entrar em tela cheia.
- **Seta para baixo / Page Down / espaço:** avança para a próxima parte. **Seta para cima:** volta.
- Um passador de slides (aquele controle de apresentação) também funciona, porque ele manda Page Down / Page Up.
- Na parte "Sua marca", o botão **Ver a transformação** repete a animação do balde.
- Clique ou toque em qualquer produto para abrir os detalhes. **Esc** fecha.

## Onde preencher o que está [A DEFINIR]

Tudo fica no arquivo **`js/dados.js`**. Abra num editor de texto e troque o que está entre aspas:

- **Contato:** `whatsapp` (só números, com 55 e DDD), `telefone`, `instagram` (sem @) e `endereco`. Quando o WhatsApp é preenchido, o botão verde e o QR code passam a abrir a conversa sozinhos.
- **Números da fábrica:** em `CONTADORES`, preencha `valor` (só algarismos). O número aparece contando na tela. Dá para trocar o `rotulo` de cada um.
- **Pedido mínimo e prazos** (parte "Sua marca"): ficam no arquivo `index.html`. Procure por `[A DEFINIR]`.

## Organização das pastas

- `index.html`: a página
- `css/style.css`: visual
- `js/main.js`: animações e interações
- `js/particulas.js`: partículas de luz do fundo (Three.js)
- `js/dados.js`: **produtos, contatos e números** (é o único arquivo que você precisa editar)
- `img/baldes/`: os 13 baldes sem fundo + o balde neutro "SUA MARCA AQUI"
- `vendor/`: bibliotecas (GSAP, ScrollTrigger, Three.js, gerador de QR code)
- `fonts/`: fontes Sora e Inter

## Observações

- Os textos e os rendimentos vêm do Catálogo Matriz 2024. A Manta Líquida não tem rendimento no catálogo, então ela aparece como [A DEFINIR].
- No catálogo, o balde "4 Estações" é a embalagem da **Pintura Impermeabilizante Borracha Líquida**. Por isso, no site, ele aparece com esse nome, na linha Impermeabilizantes.
- Verniz, Resina, Massas, Selador, Texturas e Fundo Preparador ainda não têm foto de balde, então aparecem com um ícone.
- O balde "SUA MARCA AQUI" é uma montagem feita a partir do render da Emborrachada, com o rótulo trocado por um rótulo neutro.
