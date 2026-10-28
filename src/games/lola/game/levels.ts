import { LevelData } from './types';

export const LEVELS: LevelData[] = [
  // FASE 1: O Portal de Entrada
  {
    id: 1,
    title: 'Fase 1: O Portal de Entrada',
    subtitle: 'Primeiros passos nas ruínas sagradas',
    parTurns: 4,
    startNodeId: 'n1',
    exitNodeId: 'n5',
    nodes: [
      { id: 'n1', x: 0, z: 0, type: 'start', connections: ['n2'] },
      { id: 'n2', x: 1, z: 0, type: 'normal', connections: ['n1', 'n3'] },
      { id: 'n3', x: 2, z: 0, type: 'normal', connections: ['n2', 'n4', 'r1'] },
      { id: 'r1', x: 2, z: -1, type: 'normal', connections: ['n3'] },
      { id: 'n4', x: 3, z: 0, type: 'normal', connections: ['n3', 'n5'] },
      { id: 'n5', x: 4, z: 0, type: 'exit', connections: ['n4'] },
    ],
    enemies: [],
    relics: [
      {
        id: 'relic_1',
        name: 'Olho Dourado do Sol',
        chapter: 1,
        nodeId: 'r1',
        icon: '◈',
        description: 'Amuleto dourado entalhado em lápis-lazúli pelos antigos sacerdotes.',
      },
    ],
    hint: 'Mova a exploradora pelos caminhos de pedra até o portal de luz.',
  },

  // FASE 2: O Despertar da Serpente
  {
    id: 2,
    title: 'Fase 2: O Despertar da Serpente',
    subtitle: 'Aproxime-se pelas costas ou pelos flancos',
    parTurns: 6,
    startNodeId: 'n1',
    exitNodeId: 'n6',
    nodes: [
      { id: 'n1', x: 0, z: 0, type: 'start', connections: ['n2'] },
      { id: 'n2', x: 1, z: 0, type: 'normal', connections: ['n1', 'n3', 'n2_b'] },
      // Flank route to defeat snake from behind or bypass
      { id: 'n2_b', x: 1, z: -1, type: 'normal', connections: ['n2', 'n3_b'] },
      { id: 'n3_b', x: 2, z: -1, type: 'normal', connections: ['n2_b', 'n4_b'] },
      { id: 'n4_b', x: 3, z: -1, type: 'normal', connections: ['n3_b', 'n4', 'n5'] },
      // Main path with snake at n4 (one position back)
      { id: 'n3', x: 2, z: 0, type: 'normal', connections: ['n2', 'n4'] },
      { id: 'n4', x: 3, z: 0, type: 'normal', connections: ['n3', 'n4_b', 'n5'] },
      { id: 'n5', x: 4, z: 0, type: 'normal', connections: ['n4', 'n4_b', 'n6'] },
      { id: 'n6', x: 5, z: 0, type: 'exit', connections: ['n5'] },
    ],
    enemies: [
      {
        id: 'snake_1',
        type: 'snake',
        nodeId: 'n4', // Snake is one position back at n4
        facing: 'west', // Snake strikes forward towards n3
      },
    ],
    hint: 'Serpentes dão o bote se você entrar na frente delas. Contorne pelo flanco para pegá-las de lado ou por trás!',
  },

  // FASE 3: Corredor de Duas Serpentes
  {
    id: 3,
    title: 'Fase 3: O Ninho das Víboras',
    subtitle: 'Navegação tática entre guardiões rastejantes',
    parTurns: 8,
    startNodeId: 'n1',
    exitNodeId: 'n8',
    nodes: [
      { id: 'n1', x: 0, z: 0, type: 'start', connections: ['n2'] },
      { id: 'n2', x: 1, z: 0, type: 'normal', connections: ['n1', 'n3', 'n2_up'] },
      { id: 'n2_up', x: 1, z: -1, type: 'normal', connections: ['n2', 'n3_up'] },
      { id: 'n3_up', x: 2, z: -1, type: 'normal', connections: ['n2_up', 'n4_up', 'r2'] },
      { id: 'r2', x: 2, z: -2, type: 'normal', connections: ['n3_up'] },
      { id: 'n4_up', x: 3, z: -1, type: 'normal', connections: ['n3_up', 'n4'] },
      { id: 'n3', x: 2, z: 0, type: 'normal', connections: ['n2', 'n4'] },
      { id: 'n4', x: 3, z: 0, type: 'normal', connections: ['n3', 'n4_up', 'n5'] },
      { id: 'n5', x: 4, z: 0, type: 'normal', connections: ['n4', 'n6', 'n5_down'] },
      { id: 'n5_down', x: 4, z: 1, type: 'normal', connections: ['n5', 'n6_down'] },
      { id: 'n6_down', x: 5, z: 1, type: 'normal', connections: ['n5_down', 'n7'] },
      { id: 'n6', x: 5, z: 0, type: 'normal', connections: ['n5', 'n7'] },
      { id: 'n7', x: 6, z: 0, type: 'normal', connections: ['n5_down', 'n6', 'n6_down', 'n8'] },
      { id: 'n8', x: 7, z: 0, type: 'exit', connections: ['n7'] },
    ],
    enemies: [
      { id: 'snake_1', type: 'snake', nodeId: 'n4', facing: 'west' },
      { id: 'snake_2', type: 'snake', nodeId: 'n6', facing: 'south' },
    ],
    relics: [
      {
        id: 'relic_2',
        name: 'Chave de Escaravelho',
        chapter: 3,
        nodeId: 'r2',
        icon: '❖',
        description: 'Chave esculpida em jade verde usada para abrir a cripta imperial.',
      },
    ],
    hint: 'Observe a direção para onde cada cobra olha antes de avançar.',
  },

  // FASE 4: Patrulha da Aranha Tecelã
  // "a fase 4 precisa ser melhorada de modo que a aranha sempre ande em linha reta ate o final da linha em que esta.
  // a aranha deve matar a personagem quando atingir a personagem de frente, mas a aranha morre quando atingida de lado ou por tras."
  {
    id: 4,
    title: 'Fase 4: A Aranha da Cripta',
    subtitle: 'Ataque a aranha pelos lados ou por trás para eliminá-la',
    parTurns: 9,
    startNodeId: 'n1',
    exitNodeId: 'n_exit',
    nodes: [
      { id: 'n1', x: 0, z: 0, type: 'start', connections: ['n2'] },
      { id: 'n2', x: 1, z: 0, type: 'normal', connections: ['n1', 'n3', 'loop_wait'] },
      { id: 'loop_wait', x: 1, z: 1, type: 'normal', connections: ['n2', 'loop_wait2'] },
      { id: 'loop_wait2', x: 2, z: 1, type: 'normal', connections: ['loop_wait', 'n3'] },
      { id: 'n3', x: 2, z: 0, type: 'normal', connections: ['n2', 'loop_wait2', 'cross', 'n3_top'] },
      // Flank route to access the top of the spider patrol line
      { id: 'n3_top', x: 2, z: -2, type: 'normal', connections: ['n3', 'sp_1'] },

      // SPIDER PATROL LINE: straight continuous line from z = -2 to z = 2 at x = 3
      { id: 'sp_1', x: 3, z: -2, type: 'normal', connections: ['n3_top', 'sp_2'] },
      { id: 'sp_2', x: 3, z: -1, type: 'normal', connections: ['sp_1', 'cross'] },
      { id: 'cross', x: 3, z: 0, type: 'normal', connections: ['n3', 'sp_2', 'sp_3', 'n4'] },
      { id: 'sp_3', x: 3, z: 1, type: 'normal', connections: ['cross', 'sp_4'] },
      { id: 'sp_4', x: 3, z: 2, type: 'normal', connections: ['sp_3', 'r4'] },
      { id: 'r4', x: 4, z: 2, type: 'normal', connections: ['sp_4'] },

      // Exit corridor
      { id: 'n4', x: 4, z: 0, type: 'normal', connections: ['cross', 'n5'] },
      { id: 'n5', x: 5, z: 0, type: 'normal', connections: ['n4', 'n_exit'] },
      { id: 'n_exit', x: 6, z: 0, type: 'exit', connections: ['n5'] },
    ],
    enemies: [
      {
        id: 'spider_1',
        type: 'spider',
        nodeId: 'sp_1',
        facing: 'south',
        patrolPath: ['sp_1', 'sp_2', 'cross', 'sp_3', 'sp_4'],
        patrolIndex: 0,
        patrolDirection: 1,
      },
    ],
    relics: [
      {
        id: 'relic_4',
        name: 'Broche da Viúva Negra',
        chapter: 4,
        nodeId: 'r4',
        icon: '🕷',
        description: 'Antiga joia esculpida em ônix e rubi encontrada no ninho da aranha.',
      },
    ],
    hint: 'A aranha anda em linha reta de ponta a ponta. Ataque-a de lado ou por trás para derrotá-la!',
  },

  // FASE 5: Travessia do Abismo
  {
    id: 5,
    title: 'Fase 5: Travessia do Abismo',
    subtitle: 'Cuidado com os pisos que desmoronam',
    parTurns: 8,
    startNodeId: 'n1',
    exitNodeId: 'n7',
    nodes: [
      { id: 'n1', x: 0, z: 0, type: 'start', connections: ['n2'] },
      { id: 'n2', x: 1, z: 0, type: 'normal', connections: ['n1', 'n3', 'side1'] },
      { id: 'side1', x: 1, z: -1, type: 'normal', connections: ['n2', 'r5'] },
      { id: 'r5', x: 2, z: -1, type: 'normal', connections: ['side1'] },
      // Cracked floor tile: can only be stepped on once!
      { id: 'n3', x: 2, z: 0, type: 'cracked', connections: ['n2', 'n4'] },
      { id: 'n4', x: 3, z: 0, type: 'normal', connections: ['n3', 'n5'] },
      { id: 'n5', x: 4, z: 0, type: 'cracked', connections: ['n4', 'n6'] },
      { id: 'n6', x: 5, z: 0, type: 'normal', connections: ['n5', 'n7'] },
      { id: 'n7', x: 6, z: 0, type: 'exit', connections: ['n6'] },
    ],
    enemies: [
      { id: 'snake_1', type: 'snake', nodeId: 'n4', facing: 'north' },
    ],
    relics: [
      {
        id: 'relic_5',
        name: 'Fragmento de Obsidiana',
        chapter: 5,
        nodeId: 'r5',
        icon: '◆',
        description: 'Lâmina cerimonial negra de brilho espelhado.',
      },
    ],
    hint: 'Pisos rachados suportam apenas uma passagem. Ao sair deles, eles caem no vazio!',
  },

  // FASE 6: Dança das Serpentes e Aranhas
  {
    id: 6,
    title: 'Fase 6: O Claustro Proibido',
    subtitle: 'Sincronia entre predadores rastejantes e patrulheiros',
    parTurns: 10,
    startNodeId: 'n1',
    exitNodeId: 'n8',
    nodes: [
      { id: 'n1', x: 0, z: 0, type: 'start', connections: ['n2'] },
      { id: 'n2', x: 1, z: 0, type: 'normal', connections: ['n1', 'n3', 'n2_up'] },
      { id: 'n2_up', x: 1, z: -1, type: 'normal', connections: ['n2', 'n3_up'] },
      { id: 'n3_up', x: 2, z: -1, type: 'normal', connections: ['n2_up', 'n4_up'] },
      { id: 'n4_up', x: 3, z: -1, type: 'normal', connections: ['n3_up', 'n4'] },
      { id: 'n3', x: 2, z: 0, type: 'normal', connections: ['n2', 'n4'] },
      { id: 'n4', x: 3, z: 0, type: 'normal', connections: ['n3', 'n4_up', 'n5'] },
      { id: 'n5', x: 4, z: 0, type: 'normal', connections: ['n4', 'n6', 'sp_p1'] },
      { id: 'sp_p1', x: 4, z: 1, type: 'normal', connections: ['n5', 'sp_p2'] },
      { id: 'sp_p2', x: 4, z: 2, type: 'normal', connections: ['sp_p1'] },
      { id: 'n6', x: 5, z: 0, type: 'normal', connections: ['n5', 'n7'] },
      { id: 'n7', x: 6, z: 0, type: 'normal', connections: ['n6', 'n8'] },
      { id: 'n8', x: 7, z: 0, type: 'exit', connections: ['n7'] },
    ],
    enemies: [
      { id: 'snake_1', type: 'snake', nodeId: 'n4', facing: 'west' },
      {
        id: 'spider_1',
        type: 'spider',
        nodeId: 'sp_p2',
        patrolPath: ['sp_p2', 'sp_p1', 'n5'],
        patrolIndex: 0,
        patrolDirection: 1,
      },
    ],
    hint: 'Espere a aranha recuar para cruzar o nó n5 com segurança.',
  },

  // FASE 7: Labirinto dos Antigos
  // Note: user specifically fixed Phase 7: no bogus ambush check before portal!
  {
    id: 7,
    title: 'Fase 7: O Labirinto dos Antigos',
    subtitle: 'Navegação segura até o portal dourado',
    parTurns: 11,
    startNodeId: 'n1',
    exitNodeId: 'n_exit',
    nodes: [
      { id: 'n1', x: 0, z: 0, type: 'start', connections: ['n2', 'side_a'] },
      { id: 'side_a', x: 0, z: 1, type: 'normal', connections: ['n1', 'side_b'] },
      { id: 'side_b', x: 1, z: 1, type: 'normal', connections: ['side_a', 'r7'] },
      { id: 'r7', x: 1, z: 2, type: 'normal', connections: ['side_b'] },
      { id: 'n2', x: 1, z: 0, type: 'normal', connections: ['n1', 'n3'] },
      { id: 'n3', x: 2, z: 0, type: 'normal', connections: ['n2', 'n4', 'sp_a1'] },
      // Spider patrol is contained in upper branch only, completely away from portal
      { id: 'sp_a1', x: 2, z: -1, type: 'normal', connections: ['n3', 'sp_a2'] },
      { id: 'sp_a2', x: 2, z: -2, type: 'normal', connections: ['sp_a1'] },
      { id: 'n4', x: 3, z: 0, type: 'normal', connections: ['n3', 'n5'] },
      { id: 'n5', x: 4, z: 0, type: 'normal', connections: ['n4', 'n6'] },
      { id: 'n6', x: 5, z: 0, type: 'normal', connections: ['n5', 'n_exit'] },
      // n6 is one step before exit. It is safe and free of any ambush or trap!
      { id: 'n_exit', x: 6, z: 0, type: 'exit', connections: ['n6'] },
    ],
    enemies: [
      {
        id: 'spider_patrol',
        type: 'spider',
        nodeId: 'sp_a2',
        patrolPath: ['sp_a2', 'sp_a1', 'n3'],
        patrolIndex: 0,
        patrolDirection: 1,
      },
      { id: 'snake_flank', type: 'snake', nodeId: 'n5', facing: 'north' },
    ],
    relics: [
      {
        id: 'relic_7',
        name: 'Urna de Rubi Imperial',
        chapter: 7,
        nodeId: 'r7',
        icon: '⚜',
        description: 'Vaso cerimonial incrustado de rubis puríssimos da dinastia solar.',
      },
    ],
    hint: 'O caminho até o portal está desimpedido após passar pelas sentinelas.',
  },

  // FASE 8: Ruínas Desmoronantes
  // User: "nas fases 8 e 10 os pontos onde não posso passar mais de uma vez são representandos com pontos com textura de rachadura, e viram buraco mais preto ao quebrar"
  {
    id: 8,
    title: 'Fase 8: As Pontes Frágeis',
    subtitle: 'Pisos rachados que caem no abismo sem volta',
    parTurns: 9,
    startNodeId: 'n1',
    exitNodeId: 'n8',
    nodes: [
      { id: 'n1', x: 0, z: 0, type: 'start', connections: ['n2'] },
      { id: 'n2', x: 1, z: 0, type: 'normal', connections: ['n1', 'c1', 'loop1'] },
      { id: 'loop1', x: 1, z: 1, type: 'normal', connections: ['n2', 'loop2'] },
      { id: 'loop2', x: 2, z: 1, type: 'normal', connections: ['loop1', 'n4'] },
      // First cracked tile
      { id: 'c1', x: 2, z: 0, type: 'cracked', connections: ['n2', 'c2'] },
      // Second cracked tile
      { id: 'c2', x: 3, z: 0, type: 'cracked', connections: ['c1', 'n4'] },
      { id: 'n4', x: 4, z: 0, type: 'normal', connections: ['c2', 'loop2', 'c3'] },
      // Third cracked tile leading to safe node
      { id: 'c3', x: 5, z: 0, type: 'cracked', connections: ['n4', 'n6'] },
      { id: 'n6', x: 6, z: 0, type: 'normal', connections: ['c3', 'n7'] },
      { id: 'n7', x: 7, z: 0, type: 'normal', connections: ['n6', 'n8'] },
      { id: 'n8', x: 8, z: 0, type: 'exit', connections: ['n7'] },
    ],
    enemies: [
      { id: 'snake_guard', type: 'snake', nodeId: 'n6', facing: 'north' },
    ],
    hint: 'Planeje sua rota com precisão: cada piso rachado só permite pisar uma única vez antes de despencar!',
  },

  // FASE 9: A Câmara das Sombras
  {
    id: 9,
    title: 'Fase 9: A Câmara das Sombras',
    subtitle: 'Vigias cruzados nos salões subterrâneos',
    parTurns: 12,
    startNodeId: 'n1',
    exitNodeId: 'n9',
    nodes: [
      { id: 'n1', x: 0, z: 0, type: 'start', connections: ['n2'] },
      { id: 'n2', x: 1, z: 0, type: 'normal', connections: ['n1', 'n3', 'side_up'] },
      { id: 'side_up', x: 1, z: -1, type: 'normal', connections: ['n2', 'r9'] },
      { id: 'r9', x: 2, z: -1, type: 'normal', connections: ['side_up', 'n4'] },
      { id: 'n3', x: 2, z: 0, type: 'normal', connections: ['n2', 'n4'] },
      { id: 'n4', x: 3, z: 0, type: 'normal', connections: ['n3', 'r9', 'n5'] },
      { id: 'n5', x: 4, z: 0, type: 'normal', connections: ['n4', 'n6', 'sp_y1'] },
      // Spider patrol
      { id: 'sp_y1', x: 4, z: 1, type: 'normal', connections: ['n5', 'sp_y2'] },
      { id: 'sp_y2', x: 4, z: 2, type: 'normal', connections: ['sp_y1'] },
      { id: 'n6', x: 5, z: 0, type: 'cracked', connections: ['n5', 'n7'] },
      { id: 'n7', x: 6, z: 0, type: 'normal', connections: ['n6', 'n8'] },
      { id: 'n8', x: 7, z: 0, type: 'normal', connections: ['n7', 'n9'] },
      { id: 'n9', x: 8, z: 0, type: 'exit', connections: ['n8'] },
    ],
    enemies: [
      { id: 'snake_front', type: 'snake', nodeId: 'n4', facing: 'west' },
      {
        id: 'spider_deep',
        type: 'spider',
        nodeId: 'sp_y2',
        patrolPath: ['sp_y2', 'sp_y1', 'n5'],
        patrolIndex: 0,
        patrolDirection: 1,
      },
    ],
    relics: [
      {
        id: 'relic_9',
        name: 'Disco Estelar de Ouro',
        chapter: 9,
        nodeId: 'r9',
        icon: '★',
        description: 'Astrolábio pré-colombiano em puro ouro com alinhamento das constelações.',
      },
    ],
    hint: 'Use a rota superior para eliminar a primeira serpente pelas costas.',
  },

  // FASE 10: O Templo Final da Cidade Perdida
  // User specifications:
  // 1. "vamos colocar a aranha de um jeito que ela atravesse o caminho da personagem fazendo com que o movimento de andar pra frente precise ser pensando. retire o bloco amarelo."
  // 2. "aranha precisa de 4 casas para andar e dar tempo da personagem atravessar a fase. na reta da aranha, cruzando a fase, devem existir 4 casas."
  // 3. "nas fases 8 e 10 os pontos onde não posso passar mais de uma vez são representandos com pontos com textura de rachadura, e viram buraco mais preto ao quebrar"
  // 4. "ao concluir a ultima fase, a fase 10, com sucesso voce deve exibir uma mensagem legal"
  {
    id: 10,
    title: 'Fase 10: O Altar da Cidade Perdida',
    subtitle: 'O enigma final: a aranha patrulheira de 4 casas e pisos rachados',
    parTurns: 10,
    startNodeId: 'p1',
    exitNodeId: 'p_exit',
    nodes: [
      // Start & initial approach
      { id: 'p1', x: 0, z: 0, type: 'start', connections: ['p2'] },
      { id: 'p2', x: 1, z: 0, type: 'normal', connections: ['p1', 'p3_crack', 'loop_wait'] },
      // Optional wait step for player to time the spider
      { id: 'loop_wait', x: 1, z: 1, type: 'normal', connections: ['p2'] },
      // Cracked tile requiring committed forward step
      { id: 'p3_crack', x: 2, z: 0, type: 'cracked', connections: ['p2', 'cross_node'] },
      
      // THE SPIDER PATROL LINE: exactly 4 tiles in a line crossing the player's path (z = -1, 0, 1, 2 at x = 3)
      // Tile 1: s_node1 (x=3, z=-1)
      // Tile 2: cross_node (x=3, z=0) -> where player intersects!
      // Tile 3: s_node3 (x=3, z=1)
      // Tile 4: s_node4 (x=3, z=2)
      { id: 's_node1', x: 3, z: -1, type: 'normal', connections: ['cross_node'] },
      { id: 'cross_node', x: 3, z: 0, type: 'normal', connections: ['p3_crack', 's_node1', 's_node3', 'p4_crack'] },
      { id: 's_node3', x: 3, z: 1, type: 'normal', connections: ['cross_node', 's_node4'] },
      { id: 's_node4', x: 3, z: 2, type: 'normal', connections: ['s_node3', 'r10'] },
      { id: 'r10', x: 4, z: 2, type: 'normal', connections: ['s_node4'] },

      // Second cracked tile beyond the intersection
      { id: 'p4_crack', x: 4, z: 0, type: 'cracked', connections: ['cross_node', 'p5'] },
      { id: 'p5', x: 5, z: 0, type: 'normal', connections: ['p4_crack', 'p_exit'] },
      // Final exit portal
      { id: 'p_exit', x: 6, z: 0, type: 'exit', connections: ['p5'] },
    ],
    enemies: [
      {
        id: 'spider_patrol_4',
        type: 'spider',
        nodeId: 's_node4', // Starts at the far end of the 4-tile line
        patrolPath: ['s_node4', 's_node3', 'cross_node', 's_node1'],
        patrolIndex: 0,
        patrolDirection: 1,
      },
    ],
    relics: [
      {
        id: 'relic_10',
        name: 'Coração da Cidade Perdida',
        chapter: 10,
        nodeId: 'r10',
        icon: '👑',
        description: 'A joia sagrada primordial selada no coração do altar dourado.',
      },
    ],
    hint: 'A aranha patrulha as 4 casas cruzando seu caminho. Calcule o tempo e atravesse sem hesitar!',
  },
];
