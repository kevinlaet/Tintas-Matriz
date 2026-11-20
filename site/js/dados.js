/* =====================================================================
   TINTAS MATRIZ — DADOS DO SITE
   Tudo o que muda com frequência fica aqui. Para trocar um contato ou
   um número, é só editar o texto entre aspas e salvar.
   Regra: nada de preço, nada inventado. Onde falta dado: deixe ''.
   ===================================================================== */

export const CONFIG = {
  // Contato (deixe '' enquanto não tiver; o site mostra [A DEFINIR])
  whatsapp: '',        // só números, com DDI e DDD. Ex.: '5511999999999'
  whatsappTexto: 'Olá! Vi o site da Tintas Matriz e quero conversar sobre fabricação.',
  telefone: '',        // como deve aparecer. Ex.: '(11) 4000-0000'
  instagram: '',       // sem @. Ex.: 'tintasmatriz'
  endereco: '',        // Ex.: 'Rua Exemplo, 123 – Cidade/UF'
  // Link do QR code. Vazio = usa o WhatsApp (se tiver) ou o próprio site.
  qrLink: '',
};

/* Contadores da seção "A Fábrica".
   valor: o número (só algarismos). Vazio = mostra [NÚMERO].
   prefixo/sufixo: texto antes/depois do número (ex.: '+', ' mil').
   rotulo: o que o número significa (edite se precisar). */
export const CONTADORES = [
  { valor: '', prefixo: '', sufixo: '', rotulo: 'anos de fábrica' },
  { valor: '', prefixo: '', sufixo: '', rotulo: 'litros produzidos por mês' },
  { valor: '', prefixo: '', sufixo: '', rotulo: 'cores no sistema tintométrico' },
  { valor: '', prefixo: '', sufixo: '', rotulo: 'revendas atendidas' },
];

const B = 'img/baldes/';

/* Linhas e produtos — textos e rendimentos do Catálogo Matriz 2024.
   img: '' = produto sem foto (mostra ícone). */
export const LINHAS = [
  {
    id: 'acrilicas', nome: 'Acrílicas', resumo: 'Da premium à econômica, para paredes internas e externas.',
    produtos: [
      { id: 'premium-completo', nome: 'Premium Completo', img: B + '01-premium-completo.webp', selo: 'Premium',
        curta: 'Fosco, acetinado e semi-brilho.',
        desc: 'Tinta acrílica premium com excelente cobertura, baixo odor, ótimo alastramento e fino acabamento. Disponível na cor branca e em bases para sistema tintométrico. Para paredes externas e internas.',
        rend: ['Balde 18 L: até 130 m²', 'Galão 3,6 L: até 26 m²', 'Base 16 L: até 115 m²', 'Base 3,2 L: até 23 m²', 'Pote 800 ml: até 5,7 m²'],
        obs: 'Rendimento acabado, no acabamento fosco.',
        emb: ['Balde 18 L', 'Galão 3,6 L', 'Bases: balde 16 L, galão 3,2 L e pote 800 ml'] },
      { id: 'anti-bacteria', nome: 'Anti Bactéria Premium', img: B + '03-anti-bacteria-premium.webp', selo: 'Premium',
        curta: 'Previne fungos, mofo e bactérias.',
        desc: 'Fórmula com biocida que age na película seca da tinta, prevenindo a proliferação de fungos, mofo e bactérias. Recomendada para banheiros, cozinhas, saunas, lavanderias, garagens, indústrias, hospitais, hotéis, câmaras frias e restaurantes.',
        rend: ['Balde 16 L: até 115 m²', 'Galão 3,2 L: até 23 m²'], obs: 'Rendimento acabado, no acabamento fosco.',
        emb: ['Balde 16 L', 'Galão 3,2 L'] },
      { id: 'hiper-rendimento', nome: 'Hiper Rendimento', img: B + '04-hiper-rendimento.webp', selo: 'Standard',
        curta: 'Ótima cobertura e alto rendimento.',
        desc: 'Tinta acrílica standard de ótima cobertura, alto rendimento com diluição superior e baixo odor. Para ambientes externos e internos.',
        rend: ['Balde 18 L: até 170 m²', 'Galão 3,6 L: até 34 m²', 'Pote 900 ml: até 8,5 m²', 'Base 16 L: até 151 m²', 'Base 3,2 L: até 30 m²', 'Base 800 ml: até 7,5 m²'],
        obs: 'Rendimento acabado.',
        emb: ['Balde 18 L', 'Galão 3,6 L', 'Pote 900 ml', 'Bases: balde 16 L, galão 3,2 L e pote 800 ml'] },
      { id: 'pisos-fachadas', nome: 'Pisos & Fachadas', img: B + '05-pisos-e-fachadas.webp', selo: 'Premium',
        curta: 'Premium de alta resistência.',
        desc: 'Tinta premium de alta resistência, boa cobertura, baixo odor e excelente alastramento. Para ambientes externos e internos.',
        rend: ['Balde 18 L: até 110 m²', 'Galão 3,6 L: até 22 m²', 'Pote 900 ml: até 5,5 m²'], obs: 'Rendimento acabado.',
        emb: ['Balde 18 L', 'Galão 3,6 L', 'Pote 900 ml'] },
      { id: 'extra-rendimento', nome: 'Extra Rendimento', img: B + '07-extra-rendimento.webp', selo: 'Econômica',
        curta: 'Boa cobertura e ótimo rendimento.',
        desc: 'Tinta econômica com boa cobertura, baixo odor e ótimo rendimento.',
        rend: ['Balde 18 L: até 110 m²', 'Galão 3,6 L: até 21 m²'], obs: 'Rendimento acabado.',
        emb: ['Balde 18 L', 'Galão 3,6 L'] },
      { id: 'profissional', nome: 'Profissional', img: B + '06-profissional.webp', selo: 'Econômica',
        curta: 'Custo-benefício para ambientes internos.',
        desc: 'Tinta econômica ideal para ambientes internos, para quem procura uma boa relação custo-benefício na pintura.',
        rend: ['Balde 18 L: até 90 m²', 'Balde 15 L: até 75 m²', 'Galão 3,6 L: até 18 m²'], obs: 'Rendimento acabado.',
        emb: ['Balde 18 L', 'Balde 15 L', 'Galão 3,6 L'] },
      { id: 'gesso-drywall', nome: 'Gesso & Drywall', img: B + '09-gesso-e-drywall.webp', selo: 'Fundo e acabamento',
        curta: 'Direto sobre gesso e drywall.',
        desc: 'Desenvolvida para aplicação direta sobre gesso, drywall, gesso acartonado e gesso corrido. Pode ser usada como fundo na primeira pintura e como acabamento final. Ótima cobertura e fino acabamento, para ambientes internos.',
        rend: ['Balde 18 L: até 105 m²', 'Galão 3,6 L: até 21 m²'], obs: 'Rendimento acabado.',
        emb: ['Balde 18 L', 'Galão 3,6 L'] },
    ],
  },
  {
    id: 'impermeabilizantes', nome: 'Impermeabilizantes', resumo: 'Proteção contra a água para fachadas, muros, telhados e lajes.',
    produtos: [
      { id: 'protecao-emborrachada', nome: 'Fachadas & Muros Proteção Emborrachada', img: B + '12-protecao-emborrachada.webp', selo: 'Produto principal', destaque: true,
        curta: 'Película elástica que cobre pequenas fissuras.',
        desc: 'Proteção impermeabilizante fundo e acabamento que forma uma película elástica, cobre pequenas fissuras e repele as batidas de água da chuva, protegendo superfícies externas.',
        rend: ['Balde 18 kg: até 90 m²', 'Galão 3,6 kg: até 18 m²'], obs: 'Rendimento acabado.',
        emb: ['Balde 18 kg', 'Galão 3,6 kg'],
        cores: [['Branco', '#FFFFFF'], ['Tabaco', '#9B4B22'], ['Preto', '#231F20'], ['Elefante', '#A09D77'], ['Camurça', '#D4A55D'], ['Concreto', '#868249']] },
      { id: 'borracha-liquida', nome: 'Borracha Líquida', img: B + '02-borracha-liquida-4-estacoes.webp', selo: 'Embalagem 4 Estações',
        curta: 'Pintura impermeabilizante para paredes externas.',
        desc: 'Tinta elastomérica que impermeabiliza paredes externas, protegendo contra infiltrações causadas por microfissuras e contra a ação da chuva, do sereno, da maresia, da umidade do ar, do mofo e das algas. O acabamento semifosco protege contra o sol, a poluição e as intempéries.',
        rend: ['Balde 18 L (24 kg): até 130 m²', '14 L (18 kg): até 101 m²', 'Galão 3,6 L: até 26 m²', 'Base 16 L: até 115 m²', 'Base 3,2 L: até 23 m²'],
        obs: 'Rendimento acabado, no acabamento fosco.',
        emb: ['Balde 18 L', 'Galão 3,6 L', 'Bases: balde 16 L e galão 3,2 L'] },
      { id: 'manta-liquida', nome: 'Manta Líquida Emborrachada Telhados & Lajes', img: B + '08-manta-liquida-telhados-e-lajes.webp', selo: 'Telhados e lajes',
        curta: 'Alta elasticidade contra a infiltração.',
        desc: 'Impermeabilizante para telhas de fibrocimento, lajes, calhas de alvenaria e telhas de zinco. Forma uma película de alta elasticidade que impede a infiltração de água.',
        rend: [], obs: '',
        emb: ['Balde 12 kg', 'Galão 4 kg'],
        cores: [['Branco', '#FFFFFF'], ['Cinza', '#9A958C'], ['Concreto', '#868249']] },
    ],
  },
  {
    id: 'madeiras-metais', nome: 'Madeiras & Metais', resumo: 'Esmaltes base água, de secagem rápida e baixo odor.',
    produtos: [
      { id: 'esmalte-ecologico', nome: 'Esmalte Ecológico Base Água', img: B + '10-esmalte-ecologico.webp', selo: 'Premium',
        curta: 'Secagem rápida e baixo odor.',
        desc: 'Tinta premium para madeiras e metais, de secagem rápida, baixo odor, ótima cobertura e rendimento. Para áreas externas e internas.',
        rend: ['Galão 3,6 L: até 21 m²', 'Pote 900 ml: até 5 m²'], obs: 'Rendimento acabado.',
        emb: ['Galão 3,6 L', 'Pote 900 ml'] },
      { id: 'esmalte-epoxi', nome: 'Esmalte Epóxi Base Água', img: B + '11-esmalte-epoxi.webp', selo: 'Premium',
        curta: 'Sem cheiro e com proteção anti-mofo.',
        desc: 'Tinta de secagem rápida, fácil de aplicar, sem cheiro e com proteção anti-mofo. Forma uma película resistente, fácil de limpar e que repele a água, com filme de alta dureza e excelente aderência em diversos tipos de superfície.',
        rend: ['Galão 3,6 L: até 21 m²', 'Pote 900 ml: até 5 m²'], obs: 'Rendimento acabado.',
        emb: ['Galão 3,6 L', 'Pote 900 ml'] },
    ],
  },
  {
    id: 'brilho-protecao', nome: 'Brilho & Proteção', resumo: 'Verniz e resina para proteger e valorizar superfícies.',
    produtos: [
      { id: 'verniz', nome: 'Verniz Acrílico Liqui-Brilho', img: '', icone: 'brilho', selo: 'Incolor',
        curta: 'Proteção e brilho para a pintura.',
        desc: 'Verniz incolor para proteção e brilho de pintura em paredes internas e em artigos de artesanato e decoração.',
        rend: ['Balde 18 L: até 180 m² por demão', 'Galão 3,6 L: até 36 m² por demão', 'Pote 900 ml: até 9 m² por demão'], obs: 'Rendimento da linha Brilho & Proteção.',
        emb: ['Balde 18 L', 'Galão 3,6 L', 'Pote 900 ml'] },
      { id: 'resina', nome: 'Resina Acrílica Aqua', img: '', icone: 'gota', selo: 'Incolor e colorida',
        curta: 'Embeleza, protege e impermeabiliza.',
        desc: 'Embeleza, protege e impermeabiliza telhas, tijolos, concreto aparente, pedra e paredes internas e externas.',
        rend: ['Balde 18 L: até 180 m² por demão', 'Galão 3,6 L: até 36 m² por demão', 'Pote 900 ml: até 9 m² por demão'], obs: 'Rendimento da linha Brilho & Proteção.',
        emb: ['Balde 18 L', 'Galão 3,6 L', 'Pote 900 ml'],
        cores: [['Incolor', 'transparent'], ['Cerâmica Telha', '#A4492C'], ['Vermelho Óxido', '#7A2E22'], ['Cerâmica Ônix', '#3A3634']] },
    ],
  },
  {
    id: 'complementos', nome: 'Complementos & Revestimentos', resumo: 'Preparação, acabamento e efeitos decorativos.',
    produtos: [
      { id: 'efeitos', nome: 'Efeitos', img: B + '13-efeitos.webp', selo: 'Cimento queimado',
        curta: 'Cimento queimado e efeitos decorativos.',
        desc: 'Cimento Queimado: massa para efeitos de fácil aplicação, excelente alastramento e super leve, com acabamento fino e sofisticado, em diversas cores prontas, para ambientes externos e internos. Base para Efeitos: acabamento fino e versátil para criar efeitos decorativos como cimento queimado e marmorizado, pronta para ser pigmentada na cor desejada.',
        rend: ['Linha pronta 20 kg: até 64 m²', 'Linha pronta 5 kg: até 16 m²', 'Linha pronta 1,2 kg: até 3,8 m²', 'Base 3,7 kg: até 12 m²'], obs: 'Rendimento acabado.',
        emb: ['Balde 20 kg', 'Galão 5 kg', 'Pote 1,2 kg', 'Base: galão 3,7 kg'] },
      { id: 'massa-corrida', nome: 'Massa Corrida', img: '', icone: 'massa', selo: 'Interna',
        curta: 'Nivela e corrige superfícies internas.',
        desc: 'Produto indicado para nivelamento e correção de superfícies internas.',
        rend: ['23 kg: até 50 m² por demão'], obs: '', emb: ['Balde 23 kg', 'Barrica 23 kg', 'Galão 6 kg', 'Pote 1,5 kg'] },
      { id: 'massa-acrilica', nome: 'Massa Acrílica', img: '', icone: 'massa', selo: 'Interna e externa',
        curta: 'Nivela e corrige superfícies internas e externas.',
        desc: 'Produto indicado para nivelamento e correção de superfícies internas e externas.',
        rend: ['23 kg: até 50 m² por demão'], obs: '', emb: ['Balde 23 kg', 'Barrica 23 kg', 'Galão 6 kg', 'Pote 1,5 kg'] },
      { id: 'selador', nome: 'Selador Acrílico', img: '', icone: 'rolo', selo: 'Interno e externo',
        curta: 'Sela e uniformiza a absorção do reboco.',
        desc: 'Produto indicado para selar e uniformizar a absorção de superfícies de reboco internas e externas.',
        rend: ['18 L: até 110 m² por demão'], obs: '', emb: ['Balde 18 L', 'Balde 15 L', 'Barrica 16 L', 'Galão 3,6 L', 'Pote 900 ml'] },
      { id: 'texturas', nome: 'Texturas e Grafiato', img: '', icone: 'textura', selo: 'Revestimentos',
        curta: 'Decoram e revitalizam superfícies.',
        desc: 'Texturas, grafiato e textura projetada, indicados para decorar e revitalizar superfícies internas e externas.',
        rend: ['Grafiato 23 kg: até 7,5 m²', 'Texturas 23 kg: até 10 m²'], obs: 'Rendimento acabado.', emb: ['Balde 23 kg', 'Barrica 23 kg', 'Galão 6 kg'] },
      { id: 'fundo-preparador', nome: 'Fundo Preparador', img: '', icone: 'rolo', selo: 'Base água',
        curta: 'Firma superfícies arenosas e calcinadas.',
        desc: 'Fundo acrílico base água para tratar superfícies arenosas ou calcinadas. Aglutina partículas soltas e melhora a aderência da tinta de acabamento, com baixo odor durante a aplicação.',
        rend: ['18 L: até 180 m² por demão'], obs: '', emb: ['Balde 18 L', 'Balde 15 L', 'Barrica 16 L', 'Galão 3,6 L', 'Pote 900 ml'] },
    ],
  },
];
