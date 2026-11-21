/* =====================================================================
   TINTAS MATRIZ — DADOS DO SITE (única fonte de dados)
   Para mudar algo, troque o texto entre aspas e salve.
   Regras: sem preço, nada inventado. Onde faltar dado, deixe ''.
   ===================================================================== */

export const CONFIG = {
  /* Modo reunião: com true, nada de [A DEFINIR] ou [NÚMERO] aparece na tela.
     Tudo que estiver vazio simplesmente some. Use false para revisar o que falta. */
  modoReuniao: true,

  /* Marca do cliente pré-carregada na seção "Sua marca".
     nome: como aparece no rótulo. logo: caminho de um PNG/SVG na pasta img/clientes/.
     cor: cor do rótulo (hex). Deixe nome '' para o visitante digitar. */
  marcaCliente: { nome: '', logo: '', cor: '#C8102E' },

  // Contatos tirados do rodapé do Catálogo 2024
  whatsapp: '5511962842432',   // CONFIRMAR COM O KEVIN — (11) 96284-2432
  whatsappTexto: 'Olá! Vi o site da Tintas Matriz e quero conversar sobre fabricar a minha marca.',
  instagram: 'tintasmatriz',   // CONFIRMAR COM O KEVIN — @tintasmatriz
  telefone: '',                // Ex.: '(11) 4000-0000'
  endereco: '',                // Ex.: 'Rua Exemplo, 123 – Cidade/UF'
  qrLink: '',                  // vazio = QR abre o WhatsApp
  // Som: começa desligado; aparece um botão para ligar
  somLigado: false,
  // Modo vitrine (TV): depois de X segundos sem ninguém mexer, o site se apresenta sozinho
  vitrine: { ativo: true, segundos: 30 },
};

/* Condições da fabricação com marca própria. Vazio = não aparece. */
export const SUA_MARCA = { pedidoMinimo: '', prazoProducao: '' };

/* Números da fábrica. valor só com algarismos; vazio = some da tela. */
export const CONTADORES = [
  { valor: '', prefixo: '', sufixo: '', rotulo: 'anos de fábrica' },
  { valor: '', prefixo: '', sufixo: '', rotulo: 'litros produzidos por mês' },
  { valor: '', prefixo: '', sufixo: '', rotulo: 'cores no sistema tintométrico' },
  { valor: '', prefixo: '', sufixo: '', rotulo: 'revendas atendidas' },
];

/* Cartelas: cores aproximadas, tiradas das amostras do Catálogo 2024. */
const C = {
  hiper: [['Branco', '#FFFFFF'], ['Palha', '#F1F09D'], ['Areia', '#FFEA9A'], ['Crômio', '#CFCB97'], ['Gelo', '#ECEDC5'], ['Algodão Egípcio', '#E1DD8E'], ['Tangerina', '#F6891E'], ['Verde Limão', '#AAD037'], ['Turquesa', '#41C4DC'], ['Camurça', '#D4A55D'], ['Vermelho Cardinal', '#ED1C24'], ['Amarelo Sol', '#FFF200'], ['Elefante', '#9C9D9F']],
  pisos: [['Branco', '#FFFFFF'], ['Cinza', '#938E7F'], ['Cinza Chumbo', '#565145'], ['Concreto', '#868249'], ['Amarelo Dem.', '#F5D53E'], ['Azul', '#3F579D'], ['Verde', '#376631'], ['Vermelho Seg.', '#C23326'], ['Preto', '#231F20'], ['Marrom', '#6C3A16']],
  extra: [['Branco', '#FFFFFF'], ['Palha', '#F1F09D'], ['Areia', '#FFEA9A'], ['Crômio', '#CFCB97'], ['Gelo', '#ECEDC5'], ['Algodão Egípcio', '#E1DD8E'], ['Tangerina', '#F6891E'], ['Verde Limão', '#AAD037'], ['Pavão', '#23AE9B'], ['Rubi', '#BB3526'], ['Amarelo Frevo', '#FFF200'], ['Preto', '#1A1A1A']],
  profissional: [['Branco', '#FFFFFF'], ['Palha', '#F1F09D'], ['Areia', '#FFEA9A'], ['Gelo', '#ECEDC5'], ['Algodão Egípcio', '#E1DD8E'], ['Crômio', '#CFCB97']],
  ecologico: [['Branco', '#FFFFFF'], ['Azul Del Rey', '#04154D'], ['Amarelo', '#F9CB0E'], ['Vermelho', '#DF1E26'], ['Tabaco', '#9B4B22'], ['Verde Folha', '#3D7036'], ['Preto', '#231F20'], ['Platina', '#A09D77'], ['Preto Fosco', '#2B2B2A']],
  emborrachada: [['Branco', '#FFFFFF'], ['Tabaco', '#9B4B22'], ['Preto', '#231F20'], ['Elefante', '#A09D77'], ['Camurça', '#D4A55D'], ['Concreto', '#868249']],
  manta: [['Branco', '#FFFFFF'], ['Cinza', '#938E7F'], ['Concreto', '#868249']],
  resina: [['Incolor', 'transparent'], ['Cerâmica Telha', '#D65426'], ['Vermelho Óxido', '#9E3021'], ['Cerâmica Ônix', '#B43F24']],
  cimento: [['Dia de Chuva', '#B4B0B1'], ['Avenida Expressa', '#9B9B9D'], ['Túnel de Concreto', '#7D7B7D'], ['Algodão Cinzento', '#B5B5B6'], ['Rose Gold', '#DB9F84'], ['Travertino', '#BAA7A0'], ['Terracota', '#D48E5D'], ['Safira', '#1F66B6'], ['Maldivas', '#3A9F74'], ['Ouro Bruto', '#E9A015']],
};
export const NOTA_CORES = 'Cores aproximadas, consulte a cartela.';

const B = 'img/baldes/';
const R = 'img/rotulos/';

/* Cada produto:
   foto: render do balde (sem fundo). rotulo: textura 360° do rótulo para o balde 3D.
   gerado: produtos sem foto ganham rótulo no padrão Matriz (cor do rótulo).
   faixa: 'premium' | 'standard' | 'economica' (só quando o catálogo diz).
   ambientes: onde o simulador pode pintar ('fachada', 'sala', 'portao'), conforme o uso do catálogo. */
export const LINHAS = [
  {
    id: 'acrilicas', nome: 'Acrílicas', resumo: 'Da premium à econômica, para paredes internas e externas.',
    produtos: [
      { id: 'premium-completo', nome: 'Premium Completo', foto: B + '01-premium-completo', rotulo: R + '01', selo: 'Premium', faixa: 'premium', rend18: 130,
        curta: 'Fosco, acetinado e semibrilho.',
        desc: 'Tinta acrílica premium com excelente cobertura, baixo odor, ótimo alastramento e fino acabamento. Disponível na cor branca e em bases para sistema tintométrico. Para paredes externas e internas.',
        rend: ['Balde 18 L: até 130 m²', 'Galão 3,6 L: até 26 m²', 'Base 16 L: até 115 m²', 'Base 3,2 L: até 23 m²', 'Pote 800 ml: até 5,7 m²'],
        obs: 'Rendimento acabado, no acabamento fosco.', odor: 'Baixo odor',
        emb: ['Balde 18 L', 'Galão 3,6 L', 'Bases: balde 16 L, galão 3,2 L e pote 800 ml'] },
      { id: 'anti-bacteria', nome: 'Anti Bactéria Premium', foto: B + '03-anti-bacteria-premium', rotulo: R + '03', selo: 'Premium', faixa: 'premium',
        curta: 'Previne fungos, mofo e bactérias.',
        desc: 'Fórmula com biocida que age na película seca da tinta, prevenindo a proliferação de fungos, mofo e bactérias. Recomendada para banheiros, cozinhas, saunas, lavanderias, garagens, indústrias, hospitais, hotéis, câmaras frias e restaurantes.',
        rend: ['Balde 16 L: até 115 m²', 'Galão 3,2 L: até 23 m²'], obs: 'Rendimento acabado, no acabamento fosco.',
        emb: ['Balde 16 L', 'Galão 3,2 L'] },
      { id: 'hiper-rendimento', nome: 'Hiper Rendimento', foto: B + '04-hiper-rendimento', rotulo: R + '04', selo: 'Standard', faixa: 'standard', rend18: 170,
        curta: 'Ótima cobertura e alto rendimento.',
        desc: 'Tinta acrílica standard de ótima cobertura, alto rendimento com diluição superior e baixo odor. Para ambientes externos e internos.',
        rend: ['Balde 18 L: até 170 m²', 'Galão 3,6 L: até 34 m²', 'Pote 900 ml: até 8,5 m²', 'Base 16 L: até 151 m²', 'Base 3,2 L: até 30 m²', 'Base 800 ml: até 7,5 m²'],
        obs: 'Rendimento acabado.', odor: 'Baixo odor', cores: C.hiper, ambientes: ['fachada', 'sala'],
        emb: ['Balde 18 L', 'Galão 3,6 L', 'Pote 900 ml', 'Bases: balde 16 L, galão 3,2 L e pote 800 ml'] },
      { id: 'pisos-fachadas', nome: 'Pisos & Fachadas', foto: B + '05-pisos-e-fachadas', rotulo: R + '05', selo: 'Premium', faixa: 'premium', rend18: 110,
        curta: 'Premium de alta resistência.',
        desc: 'Tinta premium de alta resistência, boa cobertura, baixo odor e excelente alastramento. Para ambientes externos e internos.',
        rend: ['Balde 18 L: até 110 m²', 'Galão 3,6 L: até 22 m²', 'Pote 900 ml: até 5,5 m²'], obs: 'Rendimento acabado.', odor: 'Baixo odor',
        cores: C.pisos, ambientes: ['fachada', 'sala'], emb: ['Balde 18 L', 'Galão 3,6 L', 'Pote 900 ml'] },
      { id: 'extra-rendimento', nome: 'Extra Rendimento', foto: B + '07-extra-rendimento', rotulo: R + '07', selo: 'Econômica', faixa: 'economica', rend18: 110,
        curta: 'Boa cobertura e ótimo rendimento.',
        desc: 'Tinta econômica com boa cobertura, baixo odor e ótimo rendimento.',
        rend: ['Balde 18 L: até 110 m²', 'Galão 3,6 L: até 21 m²'], obs: 'Rendimento acabado.', odor: 'Baixo odor',
        cores: C.extra, ambientes: ['sala'], emb: ['Balde 18 L', 'Galão 3,6 L'] },
      { id: 'profissional', nome: 'Profissional', foto: B + '06-profissional', rotulo: R + '06', selo: 'Econômica', faixa: 'economica', rend18: 90,
        curta: 'Custo-benefício para ambientes internos.',
        desc: 'Tinta econômica ideal para ambientes internos, para quem procura uma boa relação custo-benefício na pintura.',
        rend: ['Balde 18 L: até 90 m²', 'Balde 15 L: até 75 m²', 'Galão 3,6 L: até 18 m²'], obs: 'Rendimento acabado.',
        cores: C.profissional, ambientes: ['sala'], emb: ['Balde 18 L', 'Balde 15 L', 'Galão 3,6 L'] },
      { id: 'gesso-drywall', nome: 'Gesso & Drywall', foto: B + '09-gesso-e-drywall', rotulo: R + '09', selo: 'Fundo e acabamento', rend18: 105,
        curta: 'Direto sobre gesso e drywall.',
        desc: 'Desenvolvida para aplicação direta sobre gesso, drywall, gesso acartonado e gesso corrido. Pode ser usada como fundo na primeira pintura e como acabamento final. Ótima cobertura e fino acabamento, para ambientes internos.',
        rend: ['Balde 18 L: até 105 m²', 'Galão 3,6 L: até 21 m²'], obs: 'Rendimento acabado.',
        emb: ['Balde 18 L', 'Galão 3,6 L'] },
    ],
  },
  {
    id: 'impermeabilizantes', nome: 'Impermeabilizantes', resumo: 'Proteção contra a água para fachadas, muros, telhados e lajes.',
    produtos: [
      { id: 'protecao-emborrachada', nome: 'Fachadas & Muros Proteção Emborrachada', curto: 'Proteção Emborrachada', foto: B + '12-protecao-emborrachada', rotulo: R + '12', selo: 'Produto principal', destaque: true,
        curta: 'Película elástica que cobre pequenas fissuras.',
        desc: 'Proteção impermeabilizante de fundo e acabamento que forma uma película elástica, cobre pequenas fissuras e repele as batidas de água da chuva, protegendo superfícies externas.',
        rend: ['Balde 18 kg: até 90 m²', 'Galão 3,6 kg: até 18 m²'], obs: 'Rendimento acabado.',
        emb: ['Balde 18 kg', 'Galão 3,6 kg'], cores: C.emborrachada, ambientes: ['fachada'] },
      { id: 'borracha-liquida', nome: 'Borracha Líquida', foto: B + '02-borracha-liquida-4-estacoes', rotulo: R + '02', selo: 'Elastomérica',
        curta: 'Pintura impermeabilizante para paredes externas.',
        desc: 'Tinta elastomérica que impermeabiliza paredes externas, protegendo contra infiltrações causadas por microfissuras e contra a ação da chuva, do sereno, da maresia, da umidade do ar, do mofo e das algas. O acabamento semifosco protege contra o sol, a poluição e as intempéries.',
        rend: ['Balde 18 L (24 kg): até 130 m²', '14 L (18 kg): até 101 m²', 'Galão 3,6 L: até 26 m²', 'Base 16 L: até 115 m²', 'Base 3,2 L: até 23 m²'],
        obs: 'Rendimento acabado, no acabamento fosco.',
        emb: ['Balde 18 L', 'Galão 3,6 L', 'Bases: balde 16 L e galão 3,2 L'] },
      { id: 'manta-liquida', nome: 'Manta Líquida Emborrachada Telhados & Lajes', curto: 'Manta Líquida', foto: B + '08-manta-liquida-telhados-e-lajes', rotulo: R + '08', selo: 'Telhados e lajes',
        curta: 'Alta elasticidade contra a infiltração.',
        desc: 'Impermeabilizante para telhas de fibrocimento, lajes, calhas de alvenaria e telhas de zinco. Forma uma película de alta elasticidade que impede a infiltração de água.',
        rend: [], obs: '', emb: ['Balde 12 kg', 'Galão 4 kg'], cores: C.manta },
    ],
  },
  {
    id: 'madeiras-metais', nome: 'Madeiras & Metais', resumo: 'Esmaltes base água, de secagem rápida.',
    produtos: [
      { id: 'esmalte-ecologico', nome: 'Esmalte Ecológico Base Água', foto: B + '10-esmalte-ecologico', rotulo: R + '10', selo: 'Premium', faixa: 'premium',
        curta: 'Secagem rápida e baixo odor.',
        desc: 'Tinta premium para madeiras e metais, de secagem rápida, baixo odor, ótima cobertura e rendimento. Para áreas externas e internas.',
        rend: ['Galão 3,6 L: até 21 m²', 'Pote 900 ml: até 5 m²'], obs: 'Rendimento acabado.', odor: 'Baixo odor',
        cores: C.ecologico, ambientes: ['portao'], emb: ['Galão 3,6 L', 'Pote 900 ml'] },
      { id: 'esmalte-epoxi', nome: 'Esmalte Epóxi Base Água', foto: B + '11-esmalte-epoxi', rotulo: R + '11', selo: 'Base água',
        curta: 'Sem cheiro e com proteção antimofo.',
        desc: 'Tinta de secagem rápida, fácil de aplicar, sem cheiro e com proteção antimofo. Forma uma película resistente, fácil de limpar e que repele a água, com filme de alta dureza e excelente aderência em diversos tipos de superfície.',
        rend: ['Galão 3,6 L: até 21 m²', 'Pote 900 ml: até 5 m²'], obs: 'Rendimento acabado.', odor: 'Sem cheiro',
        emb: ['Galão 3,6 L', 'Pote 900 ml'], cores: [['Branco Acetinado', '#F4F4F0']] },
    ],
  },
  {
    id: 'brilho-protecao', nome: 'Brilho & Proteção', resumo: 'Verniz e resina para proteger e valorizar superfícies.',
    produtos: [
      { id: 'verniz', nome: 'Verniz Acrílico Liqui-Brilho', curto: 'Verniz Liqui-Brilho', gerado: { cor: '#1C3B57', destaque: '#8FD3FF', tipo: 'VERNIZ ACRÍLICO' }, selo: 'Incolor',
        curta: 'Proteção e brilho para a pintura.',
        desc: 'Verniz incolor para proteção e brilho de pintura em paredes internas e em artigos de artesanato e decoração.',
        rend: ['Balde 18 L: até 180 m² por demão', 'Galão 3,6 L: até 36 m² por demão', 'Pote 900 ml: até 9 m² por demão'], obs: 'Rendimento da linha Brilho & Proteção.',
        emb: ['Balde 18 L', 'Galão 3,6 L', 'Pote 900 ml'] },
      { id: 'resina', nome: 'Resina Acrílica Aqua', gerado: { cor: '#7A2B1C', destaque: '#FFB08A', tipo: 'RESINA ACRÍLICA' }, selo: 'Incolor e colorida',
        curta: 'Embeleza, protege e impermeabiliza.',
        desc: 'Embeleza, protege e impermeabiliza telhas, tijolos, concreto aparente, pedra e paredes internas e externas.',
        rend: ['Balde 18 L: até 180 m² por demão', 'Galão 3,6 L: até 36 m² por demão', 'Pote 900 ml: até 9 m² por demão'], obs: 'Rendimento da linha Brilho & Proteção.',
        emb: ['Balde 18 L', 'Galão 3,6 L', 'Pote 900 ml'], cores: C.resina },
    ],
  },
  {
    id: 'complementos', nome: 'Complementos, Revestimentos & Efeitos', curto: 'Complementos & Efeitos', resumo: 'Preparação, acabamento e efeitos decorativos.',
    produtos: [
      { id: 'efeitos', nome: 'Efeitos: Cimento Queimado e Base', curto: 'Efeitos', foto: B + '13-efeitos', rotulo: R + '13', selo: 'Cimento queimado',
        curta: 'Cimento queimado e efeitos decorativos.',
        desc: 'Cimento Queimado: massa para efeitos de fácil aplicação, excelente alastramento e super leve, com acabamento fino e sofisticado, em diversas cores prontas, para ambientes externos e internos. Base para Efeitos: acabamento fino e versátil para criar efeitos decorativos como cimento queimado e marmorizado, pronta para ser pigmentada na cor desejada.',
        rend: ['Linha pronta 20 kg: até 64 m²', 'Linha pronta 5 kg: até 16 m²', 'Linha pronta 1,2 kg: até 3,8 m²', 'Base 3,7 kg: até 12 m²'], obs: 'Rendimento acabado.',
        emb: ['Balde 20 kg', 'Galão 5 kg', 'Pote 1,2 kg', 'Base: galão 3,7 kg'], cores: C.cimento, ambientes: ['sala', 'fachada'], efeito: true },
      { id: 'massa-corrida', nome: 'Massa Corrida', gerado: { cor: '#E9E4DA', destaque: '#C8102E', tipo: 'MASSA', texto: '#2A2420' }, selo: 'Interna',
        curta: 'Nivela e corrige superfícies internas.',
        desc: 'Produto indicado para nivelamento e correção de superfícies internas.',
        rend: ['23 kg: até 50 m² por demão'], obs: '', emb: ['Balde 23 kg', 'Barrica 23 kg', 'Galão 6 kg', 'Pote 1,5 kg'] },
      { id: 'massa-acrilica', nome: 'Massa Acrílica', gerado: { cor: '#3B4A57', destaque: '#F7A600', tipo: 'MASSA' }, selo: 'Interna e externa',
        curta: 'Nivela e corrige superfícies internas e externas.',
        desc: 'Produto indicado para nivelamento e correção de superfícies internas e externas.',
        rend: ['23 kg: até 50 m² por demão'], obs: '', emb: ['Balde 23 kg', 'Barrica 23 kg', 'Galão 6 kg', 'Pote 1,5 kg'] },
      { id: 'selador', nome: 'Selador Acrílico', gerado: { cor: '#5A1E2A', destaque: '#FFB703', tipo: 'SELADOR' }, selo: 'Interno e externo',
        curta: 'Sela e uniformiza a absorção do reboco.',
        desc: 'Produto indicado para selar e uniformizar a absorção de superfícies de reboco internas e externas.',
        rend: ['18 L: até 110 m² por demão'], obs: '', emb: ['Balde 18 L', 'Balde 15 L', 'Barrica 16 L', 'Galão 3,6 L', 'Pote 900 ml'] },
      { id: 'texturas', nome: 'Texturas e Grafiato', gerado: { cor: '#8A5A3C', destaque: '#FFD9A0', tipo: 'REVESTIMENTO' }, selo: 'Revestimentos',
        curta: 'Decoram e revitalizam superfícies.',
        desc: 'Texturas, grafiato e textura projetada, indicados para decorar e revitalizar superfícies internas e externas.',
        rend: ['Grafiato 23 kg: até 7,5 m²', 'Texturas 23 kg: até 10 m²'], obs: 'Rendimento acabado.', emb: ['Balde 23 kg', 'Barrica 23 kg', 'Galão 6 kg'] },
      { id: 'fundo-preparador', nome: 'Fundo Preparador', gerado: { cor: '#2E4D3A', destaque: '#B8F28A', tipo: 'FUNDO' }, selo: 'Base água',
        curta: 'Firma superfícies arenosas e calcinadas.',
        desc: 'Fundo acrílico base água para tratar superfícies arenosas ou calcinadas. Aglutina partículas soltas e melhora a aderência da tinta de acabamento, com baixo odor durante a aplicação.',
        rend: ['18 L: até 180 m² por demão'], obs: '', odor: 'Baixo odor na aplicação', emb: ['Balde 18 L', 'Balde 15 L', 'Barrica 16 L', 'Galão 3,6 L', 'Pote 900 ml'] },
    ],
  },
];

/* Lista plana, com a linha de cada produto (usada por várias seções). */
export const PRODUTOS = LINHAS.flatMap((l) => l.produtos.map((p) => ({ ...p, linha: l.nome, linhaId: l.id })));
