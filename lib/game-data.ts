// Curricular Pedagogical Game Data for Crononautas del Alfabeto

export interface SyllableWord {
  id: string;
  word: string;
  syllables: string[];
  pictogram: string;
  category: string;
  hint: string;
}

export interface IntruderChallenge {
  id: string;
  instruction: string;
  type: 'semantic' | 'orthographic';
  options: {
    text: string;
    pictogram: string;
    isIntruder: boolean;
    reason: string;
  }[];
}

export interface PyramidStep {
  text: string;
  highlightWords?: string[];
}

export interface PyramidChallenge {
  id: string;
  title: string;
  theme: string;
  steps: PyramidStep[];
  secretCodeWord: string;
  rewardArtifactPiece: string;
}

export interface KamishibaiCard {
  id: string;
  sequenceIndex: number; // 1 to 4
  title: string;
  narrativeText: string;
  pictograms: string[];
  soundCue: 'drum' | 'portal' | 'chime' | 'celebration';
}

export interface KamishibaiStory {
  id: string;
  title: string;
  eraId: string;
  cards: KamishibaiCard[];
  moral: string;
}

export interface EscapeRiddle {
  id: string;
  title: string;
  storyPrompt: string;
  targetQuestion: string;
  expectedAnswer: string;
  audioClue: string;
  options?: string[];
}

export interface EraDefinition {
  id: string;
  name: string;
  periodLabel: string;
  icon: string;
  themeColor: string; // Tailwind color class
  bgGradient: string;
  badge: string;
  artifactName: string;
  artifactIcon: string;
  description: string;
  pedagogicalFocus: string;
  syllablesWords: SyllableWord[];
  intruderChallenges: IntruderChallenge[];
  pyramidChallenges: PyramidChallenge[];
  kamishibaiStory: KamishibaiStory;
  escapeRiddle: EscapeRiddle;
}

export const GAME_ERAS: EraDefinition[] = [
  // 1. PREHISTORIA
  {
    id: 'prehistory',
    name: 'Prehistoria & Dinosaurios',
    periodLabel: 'Hace 65 millones de años',
    icon: '🦖',
    themeColor: 'emerald',
    bgGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    badge: 'Cazador de Sílabas',
    artifactName: 'Cristal Fósil de Ámbar',
    artifactIcon: '💎',
    description: '¡Viaja a la era de los dinosaurios! Sigue el ritmo de los tambores prehistóricos y alimenta a los grandes reptiles separando palabras en sílabas.',
    pedagogicalFocus: 'Conciencia fonológica, métrica rítmica y segmentación silábica (2 a 4 sílabas).',
    syllablesWords: [
      { id: 'p1', word: 'fósil', syllables: ['fó', 'sil'], pictogram: '🦴', category: 'Prehistoria', hint: 'Resto antiguo de roca' },
      { id: 'p2', word: 'volcán', syllables: ['vol', 'cán'], pictogram: '🌋', category: 'Prehistoria', hint: 'Montaña que expulsa lava' },
      { id: 'p3', word: 'cueva', syllables: ['cue', 'va'], pictogram: '🛖', category: 'Prehistoria', hint: 'Refugio de piedra' },
      { id: 'p4', word: 'mamut', syllables: ['ma', 'mut'], pictogram: '🦣', category: 'Animales', hint: 'Elefante lanudo prehistórico' },
      { id: 'p5', word: 'fuego', syllables: ['fue', 'go'], pictogram: '🔥', category: 'Prehistoria', hint: 'Brinda luz y calor' },
      { id: 'p6', word: 'dinosaurio', syllables: ['di', 'no', 'sau', 'rio'], pictogram: '🦕', category: 'Dinosaurios', hint: 'Gran reptil del pasado' },
    ],
    intruderChallenges: [
      {
        id: 'ic-p1',
        instruction: 'Toca la palabra que NO existía en la prehistoria:',
        type: 'semantic',
        options: [
          { text: 'Mamut', pictogram: '🦣', isIntruder: false, reason: 'Es un animal prehistórico' },
          { text: 'T-Rex', pictogram: '🦖', isIntruder: false, reason: 'Es un dinosaurio' },
          { text: 'Auto', pictogram: '🚗', isIntruder: true, reason: '¡Los autos se inventaron mucho después!' },
          { text: 'Volcán', pictogram: '🌋', isIntruder: false, reason: 'Había muchos volcanes activos' },
        ]
      }
    ],
    pyramidChallenges: [
      {
        id: 'pyr-p1',
        title: 'El Despertar del Fósil',
        theme: 'Prehistoria',
        secretCodeWord: 'VOLCAN',
        rewardArtifactPiece: 'Fragmento de Ámbar',
        steps: [
          { text: 'El fósil' },
          { text: 'El fósil brilla' },
          { text: 'El fósil brilla en la cueva' },
          { text: 'El fósil brilla en la cueva junto al gran volcán.' }
        ]
      }
    ],
    kamishibaiStory: {
      id: 'kami-p1',
      title: 'El Pequeño Rex y las Rocas Rítmicas',
      eraId: 'prehistory',
      moral: 'Escuchar el ritmo y cooperar nos ayuda a encontrar el camino a casa.',
      cards: [
        {
          id: 'kc-p1',
          sequenceIndex: 1,
          title: 'El pequeño T-Rex perdido',
          narrativeText: 'El pequeño dinosaurio Rex buscaba a su familia en el bosque prehistórico.',
          pictograms: ['🦖', '🌲', '🐾'],
          soundCue: 'drum'
        },
        {
          id: 'kc-p2',
          sequenceIndex: 2,
          title: 'Los tambores de la montaña',
          narrativeText: 'Escuchó el ritmo de los tambores que sonaban desde el gran volcán de lava.',
          pictograms: ['🌋', '🥁', '🔥'],
          soundCue: 'drum'
        },
        {
          id: 'kc-p3',
          sequenceIndex: 3,
          title: 'El puente de rocas mágicas',
          narrativeText: 'Saltó sobre las rocas diciendo cada sílaba con fuerza y valentía.',
          pictograms: ['🪨', '⭐', '✨'],
          soundCue: 'chime'
        },
        {
          id: 'kc-p4',
          sequenceIndex: 4,
          title: 'El gran abrazo familiar',
          narrativeText: 'Llegó a su cueva y celebró con su familia alrededor del fuego brillante.',
          pictograms: ['🦕', '❤️', '💎'],
          soundCue: 'celebration'
        }
      ]
    },
    escapeRiddle: {
      id: 'esc-p1',
      title: 'El Candado de la Caverna Primitiva',
      storyPrompt: 'Para abrir el portal de piedra y obtener el Cristal Fósil, cuenta las sílabas de la palabra DI-NO-SAU-RIO.',
      targetQuestion: '¿Cuántas sílabas tiene la palabra "dinosaurio"?',
      expectedAnswer: '4',
      audioClue: 'Cuenta con tus palmas: DI (1), NO (2), SAU (3), RIO (4). ¡Son 4 sílabas!',
      options: ['2', '3', '4', '5']
    }
  },

  // 2. ANTIGUO EGIPTO
  {
    id: 'egypt',
    name: 'Antiguo Egipto & Faraones',
    periodLabel: 'Hace 4.500 años',
    icon: '🏛️',
    themeColor: 'amber',
    bgGradient: 'from-amber-950 via-yellow-950 to-slate-950',
    badge: 'Descifrador de Jeroglíficos',
    artifactName: 'Escarabajo Dorado Sagrado',
    artifactIcon: '🪲',
    description: '¡Entra al templo de las pirámides! Convierte jeroglíficos en palabras y caza las palabras intrusas con trampas ortográficas.',
    pedagogicalFocus: 'Decodificación con pictogramas, discriminación léxica y ortografía visual.',
    syllablesWords: [
      { id: 'e1', word: 'arena', syllables: ['a', 're', 'na'], pictogram: '🏜️', category: 'Egipto', hint: 'Cubre todo el desierto' },
      { id: 'e2', word: 'momia', syllables: ['mo', 'mia'], pictogram: '📜', category: 'Egipto', hint: 'Envuelto en telas antiguas' },
      { id: 'e3', word: 'pirámide', syllables: ['pi', 'rá', 'mi', 'de'], pictogram: '🏛️', category: 'Egipto', hint: 'Monumento triangular de piedra' },
      { id: 'e4', word: 'faraón', syllables: ['fa', 'ra', 'ón'], pictogram: '👑', category: 'Egipto', hint: 'Gobernante del antiguo Egipto' },
      { id: 'e5', word: 'tesoro', syllables: ['te', 'so', 'ro'], pictogram: '💎', category: 'Egipto', hint: 'Joyas y oro escondidos' },
      { id: 'e6', word: 'escarabajo', syllables: ['es', 'ca', 'ra', 'ba', 'jo'], pictogram: '🪲', category: 'Egipto', hint: 'Amuleto protector de oro' },
    ],
    intruderChallenges: [
      {
        id: 'ic-e1',
        instruction: 'Encuentra la palabra que está MAL escrita (error ortográfico):',
        type: 'orthographic',
        options: [
          { text: 'Barco', pictogram: '⛵', isIntruder: false, reason: 'Barco se escribe con B correcta' },
          { text: 'Varco', pictogram: '❌', isIntruder: true, reason: '¡Varco con V es incorrecto!' },
          { text: 'Arena', pictogram: '🏜️', isIntruder: false, reason: 'Está escrita correctamente' },
          { text: 'Sol', pictogram: '☀️', isIntruder: false, reason: 'Está escrita correctamente' },
        ]
      },
      {
        id: 'ic-e2',
        instruction: 'Toca el elemento que NO pertenece al desierto de Egipto:',
        type: 'semantic',
        options: [
          { text: 'Camello', pictogram: '🐪', isIntruder: false, reason: 'Animal del desierto' },
          { text: 'Pirámide', pictogram: '🏛️', isIntruder: false, reason: 'Monumento egipcio' },
          { text: 'Pingüino', pictogram: '🐧', isIntruder: true, reason: '¡Los pingüinos viven en el hielo frío!' },
          { text: 'Faraón', pictogram: '👑', isIntruder: false, reason: 'Rey de Egipto' },
        ]
      }
    ],
    pyramidChallenges: [
      {
        id: 'pyr-e1',
        title: 'El Secreto de la Esfinge',
        theme: 'Egipto',
        secretCodeWord: 'ESCARABAJO',
        rewardArtifactPiece: 'Ojo de Horus Tallado',
        steps: [
          { text: 'El sol' },
          { text: 'El sol ilumina' },
          { text: 'El sol ilumina la pirámide' },
          { text: 'El sol ilumina la pirámide y despierta al escarabajo dorado.' }
        ]
      }
    ],
    kamishibaiStory: {
      id: 'kami-e1',
      title: 'El Papiro Perdido del Nilo',
      eraId: 'egypt',
      moral: 'La lectura y el conocimiento son los verdaderos tesoros.',
      cards: [
        {
          id: 'kc-e1',
          sequenceIndex: 1,
          title: 'El escriba y su papiro',
          narrativeText: 'El joven escriba Nefer escribía historias mágicas junto a las orillas del río Nilo.',
          pictograms: ['📜', '🌊', '🏛️'],
          soundCue: 'chime'
        },
        {
          id: 'kc-e2',
          sequenceIndex: 2,
          title: 'El viento del desierto',
          narrativeText: 'Un viento travieso llevó las hojas del papiro hasta lo alto de la pirámide.',
          pictograms: ['💨', '🏜️', '🔺'],
          soundCue: 'portal'
        },
        {
          id: 'kc-e3',
          sequenceIndex: 3,
          title: 'El amuleto del escarabajo',
          narrativeText: 'Siguiendo las huellas del escarabajo dorado, Nefer resolvió los acertijos en la piedra.',
          pictograms: ['🪲', '🔍', '✨'],
          soundCue: 'drum'
        },
        {
          id: 'kc-e4',
          sequenceIndex: 4,
          title: 'La biblioteca del templo',
          narrativeText: 'Recuperó todas las palabras y las guardó en el cofre sagrado de la biblioteca.',
          pictograms: ['📚', '👑', '🎉'],
          soundCue: 'celebration'
        }
      ]
    },
    escapeRiddle: {
      id: 'esc-e1',
      title: 'La Puerta Secreta del Sarcófago',
      storyPrompt: 'Para abrir la puerta de piedra maciza, lee el acertijo: "Soy dorado, tengo 6 patas y protejo la tumba del rey."',
      targetQuestion: '¿Qué amuleto sagrado abre la puerta?',
      expectedAnswer: 'Escarabajo',
      audioClue: 'Es un insecto brillante de oro que adoran los faraones: el es-ca-ra-ba-jo.',
      options: ['Escarabajo', 'Camello', 'Momia', 'Papiro']
    }
  },

  // 3. EDAD MEDIA
  {
    id: 'medieval',
    name: 'Edad Media & Castillos',
    periodLabel: 'Año 1200',
    icon: '🏰',
    themeColor: 'purple',
    bgGradient: 'from-purple-950 via-indigo-950 to-slate-950',
    badge: 'Caballero de las Palabras',
    artifactName: 'Pluma del Dragón Sabio',
    artifactIcon: '🪶',
    description: '¡Cruza el puente levadizo del castillo! Lee oraciones en pirámide para abrir las cerraduras secretas y rescata la pluma mágica del dragón.',
    pedagogicalFocus: 'Lectura en pirámide, fluidez lectora, lectura en duplas y sintaxis básica.',
    syllablesWords: [
      { id: 'm1', word: 'castillo', syllables: ['cas', 'ti', 'llo'], pictogram: '🏰', category: 'Medieval', hint: 'Fortaleza con torres' },
      { id: 'm2', word: 'dragón', syllables: ['dra', 'gón'], pictogram: '🐉', category: 'Medieval', hint: 'Criatura que vuela y respira fuego' },
      { id: 'm3', word: 'espada', syllables: ['es', 'pa', 'da'], pictogram: '⚔️', category: 'Medieval', hint: 'Arma de metal del caballero' },
      { id: 'm4', word: 'escudo', syllables: ['es', 'cu', 'do'], pictogram: '🛡️', category: 'Medieval', hint: 'Protección para la armadura' },
      { id: 'm5', word: 'corona', syllables: ['co', 'ro', 'na'], pictogram: '👑', category: 'Medieval', hint: 'Joyel del rey o la reina' },
      { id: 'm6', word: 'caballero', syllables: ['ca', 'ba', 'lle', 'ro'], pictogram: '🤺', category: 'Medieval', hint: 'Guerrero valiente con armadura' },
    ],
    intruderChallenges: [
      {
        id: 'ic-m1',
        instruction: 'Encuentra la palabra que NO pertenece al equipo del caballero:',
        type: 'semantic',
        options: [
          { text: 'Espada', pictogram: '⚔️', isIntruder: false, reason: 'Equipo del caballero' },
          { text: 'Escudo', pictogram: '🛡️', isIntruder: false, reason: 'Protege al caballero' },
          { text: 'Casco', pictogram: '🪖', isIntruder: false, reason: 'Cubre su cabeza' },
          { text: 'Teléfono', pictogram: '📱', isIntruder: true, reason: '¡En la edad media no había teléfonos!' },
        ]
      }
    ],
    pyramidChallenges: [
      {
        id: 'pyr-m1',
        title: 'El Puente Levadizo del Castillo',
        theme: 'Edad Media',
        secretCodeWord: 'DRAGON',
        rewardArtifactPiece: 'Sello Real de Cera',
        steps: [
          { text: 'El caballero' },
          { text: 'El caballero valiente' },
          { text: 'El caballero valiente cruza el puente' },
          { text: 'El caballero valiente cruza el puente para hablar con el dragón sabio.' }
        ]
      }
    ],
    kamishibaiStory: {
      id: 'kami-m1',
      title: 'El Dragón que Quería Leer Cuentos',
      eraId: 'medieval',
      moral: 'Las palabras tienen más poder que la fuerza bruta.',
      cards: [
        {
          id: 'kc-m1',
          sequenceIndex: 1,
          title: 'El dragón triste en la torre',
          narrativeText: 'En la torre más alta del castillo vivía un dragón verde que no quería pelear.',
          pictograms: ['🏰', '🐉', '😢'],
          soundCue: 'drum'
        },
        {
          id: 'kc-m2',
          sequenceIndex: 2,
          title: 'El regalo de la caballera',
          narrativeText: 'Una valiente caballera subió la escalera y le regaló un gran libro de cuentos ilustrados.',
          pictograms: ['🤺', '📖', '✨'],
          soundCue: 'chime'
        },
        {
          id: 'kc-m3',
          sequenceIndex: 3,
          title: 'Leyendo juntos bajo las estrellas',
          narrativeText: 'Juntos leyeron historias de magos y reinos lejanos con la luz suave de una vela.',
          pictograms: ['⭐', '🕯️', '🗣️'],
          soundCue: 'portal'
        },
        {
          id: 'kc-m4',
          sequenceIndex: 4,
          title: 'La gran fiesta del reino',
          narrativeText: 'El rey nombró al dragón como el bibliotecario oficial de todo el castillo.',
          pictograms: ['👑', '📚', '🎉'],
          soundCue: 'celebration'
        }
      ]
    },
    escapeRiddle: {
      id: 'esc-m1',
      title: 'El Enigma del Candado del Torreón',
      storyPrompt: 'Para abrir el cofre de la torre, completa la frase: "El caballero usa su espada y su _______ para defender el castillo."',
      targetQuestion: '¿Qué palabra completa la oración?',
      expectedAnswer: 'Escudo',
      audioClue: 'Es un objeto de metal que protege al caballero: el es-cu-do.',
      options: ['Escudo', 'Pastel', 'Carreta', 'Zapatilla']
    }
  },

  // 4. ERA INDUSTRIAL
  {
    id: 'industrial',
    name: 'Era Industrial & Inventos',
    periodLabel: 'Año 1880',
    icon: '🚂',
    themeColor: 'cyan',
    bgGradient: 'from-cyan-950 via-slate-900 to-slate-950',
    badge: 'Maquinista de Oraciones',
    artifactName: 'Núcleo de Vapor Infinito',
    artifactIcon: '⚙️',
    description: '¡Enciende los motores a vapor! Conecta las palabras como engranajes para construir oraciones y hacer funcionar la locomotora del tiempo.',
    pedagogicalFocus: 'Estructuración de oraciones (sujeto + verbo + predicado), conectores temporales y fluidez.',
    syllablesWords: [
      { id: 'i1', word: 'tren', syllables: ['tren'], pictogram: '🚂', category: 'Industrial', hint: 'Vehículo que viaja sobre rieles' },
      { id: 'i2', word: 'vapor', syllables: ['va', 'por'], pictogram: '💨', category: 'Industrial', hint: 'Humo blanco de agua caliente' },
      { id: 'i3', word: 'máquina', syllables: ['má', 'qui', 'na'], pictogram: '🏭', category: 'Industrial', hint: 'Aparato con piezas mecánicas' },
      { id: 'i4', word: 'engranaje', syllables: ['en', 'gra', 'na', 'je'], pictogram: '⚙️', category: 'Industrial', hint: 'Rueda con dientes de metal' },
      { id: 'i5', word: 'telégrafo', syllables: ['te', 'lé', 'gra', 'fo'], pictogram: '📠', category: 'Industrial', hint: 'Envía mensajes a larga distancia' },
      { id: 'i6', word: 'invento', syllables: ['in', 'ven', 'to'], pictogram: '💡', category: 'Industrial', hint: 'Nueva creación útil' },
    ],
    intruderChallenges: [
      {
        id: 'ic-i1',
        instruction: 'Encuentra la palabra intrusa que NO tiene que ver con máquinas:',
        type: 'semantic',
        options: [
          { text: 'Engranaje', pictogram: '⚙️', isIntruder: false, reason: 'Pieza de máquina' },
          { text: 'Vapor', pictogram: '💨', isIntruder: false, reason: 'Energía de vapor' },
          { text: 'Manzana', pictogram: '🍎', isIntruder: true, reason: '¡La manzana es una fruta, no una máquina!' },
          { text: 'Motor', pictogram: '🔋', isIntruder: false, reason: 'Impulsa las máquinas' },
        ]
      }
    ],
    pyramidChallenges: [
      {
        id: 'pyr-i1',
        title: 'El Expreso a Vapor del Tiempo',
        theme: 'Industrial',
        secretCodeWord: 'ENGRANAJE',
        rewardArtifactPiece: 'Manómetro de Presión',
        steps: [
          { text: 'La locomotora' },
          { text: 'La locomotora avanza' },
          { text: 'La locomotora avanza sobre los rieles' },
          { text: 'La locomotora avanza sobre los rieles impulsada por vapor y engranajes dorados.' }
        ]
      }
    ],
    kamishibaiStory: {
      id: 'kami-i1',
      title: 'El Telégrafo que Salvó la Estación',
      eraId: 'industrial',
      moral: 'La comunicación clara une a las personas y resuelve problemas.',
      cards: [
        {
          id: 'kc-i1',
          sequenceIndex: 1,
          title: 'El inventor en su taller',
          narrativeText: 'El joven inventor Tomás ajustaba las tuercas de su gran telégrafo a vapor.',
          pictograms: ['⚙️', '💡', '👨‍🔧'],
          soundCue: 'chime'
        },
        {
          id: 'kc-i2',
          sequenceIndex: 2,
          title: 'El mensaje urgente de la vía',
          narrativeText: 'El telégrafo comenzó a sonar: ¡bip bip bip! Había una rama en la vía del tren.',
          pictograms: ['📠', '🚂', '⚠️'],
          soundCue: 'drum'
        },
        {
          id: 'kc-i3',
          sequenceIndex: 3,
          title: 'El mensaje leído a tiempo',
          narrativeText: 'Tomás leyó el mensaje en voz alta y activó la palanca de freno de la estación.',
          pictograms: ['📜', '🗣️', '🛑'],
          soundCue: 'portal'
        },
        {
          id: 'kc-i4',
          sequenceIndex: 4,
          title: 'El tren seguro en su destino',
          narrativeText: 'El tren se detuvo a tiempo y todos los pasajeros aplaudieron la rápida lectura de Tomás.',
          pictograms: ['🚂', '👏', '🏆'],
          soundCue: 'celebration'
        }
      ]
    },
    escapeRiddle: {
      id: 'esc-i1',
      title: 'La Válvula de Presión Principal',
      storyPrompt: 'Para liberar la válvula de vapor, lee la oración incompleta: "El tren viaja rápido por las _______ de hierro."',
      targetQuestion: '¿Qué palabra falta para completar la oración?',
      expectedAnswer: 'Vías',
      audioClue: 'Son los rieles de metal por donde andan los trenes: las ví-as.',
      options: ['Vías', 'Nubes', 'Sillas', 'Cucharas']
    }
  },

  // 5. ERA ESPACIAL Y FUTURO
  {
    id: 'future',
    name: 'Era Espacial & Futuro',
    periodLabel: 'Año 3050',
    icon: '🚀',
    themeColor: 'pink',
    bgGradient: 'from-pink-950 via-purple-950 to-slate-950',
    badge: 'Gran Maestro Crononauta',
    artifactName: 'Batería Crono-Cuántica',
    artifactIcon: '🔋',
    description: '¡La estación espacial del futuro! Domina el Gran Teatro Kamishibai, comprende historias completas y enciende la Máquina del Tiempo para regresar triunfante.',
    pedagogicalFocus: 'Comprensión lectora profunda, secuenciación narrativa, expresión oral y autonomía lectora.',
    syllablesWords: [
      { id: 'f1', word: 'cohete', syllables: ['co', 'he', 'te'], pictogram: '🚀', category: 'Espacio', hint: 'Nave que viaja a las estrellas' },
      { id: 'f2', word: 'planeta', syllables: ['pla', 'ne', 'ta'], pictogram: '🪐', category: 'Espacio', hint: 'Cuerpo celeste que gira en el espacio' },
      { id: 'f3', word: 'estrella', syllables: ['es', 'tre', 'lla'], pictogram: '⭐', category: 'Espacio', hint: 'Astro que brilla con luz propia' },
      { id: 'f4', word: 'robot', syllables: ['ro', 'bot'], pictogram: '🤖', category: 'Espacio', hint: 'Amigo mecánico inteligente' },
      { id: 'f5', word: 'portal', syllables: ['por', 'tal'], pictogram: '🌀', category: 'Espacio', hint: 'Puerta interdimensional del tiempo' },
      { id: 'f6', word: 'galaxia', syllables: ['ga', 'la', 'xia'], pictogram: '🌌', category: 'Espacio', hint: 'Millones de estrellas juntas' },
    ],
    intruderChallenges: [
      {
        id: 'ic-f1',
        instruction: 'Encuentra la palabra intrusa que NO pertenece al espacio exterior:',
        type: 'semantic',
        options: [
          { text: 'Asteroide', pictogram: '☄️', isIntruder: false, reason: 'Roca espacial' },
          { text: 'Astronauta', pictogram: '👨‍🚀', isIntruder: false, reason: 'Viajero del espacio' },
          { text: 'Submarino', pictogram: '🛥️', isIntruder: true, reason: '¡El submarino viaja bajo el agua del océano!' },
          { text: 'Satélite', pictogram: '🛰️', isIntruder: false, reason: 'Orbita la Tierra' },
        ]
      }
    ],
    pyramidChallenges: [
      {
        id: 'pyr-f1',
        title: 'El Despegue Interestelar',
        theme: 'Futuro',
        secretCodeWord: 'GALAXIA',
        rewardArtifactPiece: 'Chip Cuántico de Navegación',
        steps: [
          { text: 'El cohete' },
          { text: 'El cohete vuela' },
          { text: 'El cohete vuela hacia las estrellas' },
          { text: 'El cohete vuela hacia las estrellas para cruzar el gran portal del tiempo.' }
        ]
      }
    ],
    kamishibaiStory: {
      id: 'kami-f1',
      title: 'El Regreso Triunfal de los Crononautas',
      eraId: 'future',
      moral: 'Aprender a leer abre las puertas de todos los mundos y tiempos.',
      cards: [
        {
          id: 'kc-f1',
          sequenceIndex: 1,
          title: 'La tormenta temporal superada',
          narrativeText: 'Los exploradores reunieron los 5 artefactos legendarios a través de todas las épocas de la historia.',
          pictograms: ['⏳', '💎', '🪲'],
          soundCue: 'chime'
        },
        {
          id: 'kc-f2',
          sequenceIndex: 2,
          title: 'El encendido de la máquina',
          narrativeText: 'Cronobot colocó la Batería Cuántica y el portal del tiempo brilló con luces multicolores.',
          pictograms: ['🤖', '🔋', '🌀'],
          soundCue: 'portal'
        },
        {
          id: 'kc-f3',
          sequenceIndex: 3,
          title: 'El viaje de regreso a casa',
          narrativeText: 'Viajaron a la velocidad de las palabras cruzando galaxias y constelaciones infinitas.',
          pictograms: ['🚀', '🌌', '✨'],
          soundCue: 'drum'
        },
        {
          id: 'kc-f4',
          sequenceIndex: 4,
          title: 'La medalla del gran lector',
          narrativeText: 'Llegaron sanos y salvos a su hogar coronados como Maestros Crononautas del Alfabeto.',
          pictograms: ['🌍', '🏅', '🎉'],
          soundCue: 'celebration'
        }
      ]
    },
    escapeRiddle: {
      id: 'esc-f1',
      title: 'El Código Final del Hiperimpulsor',
      storyPrompt: 'Para iniciar la secuencia de salto temporal de regreso a casa, completa la palabra clave: "CO - HE - _______"',
      targetQuestion: '¿Qué sílaba completa la palabra "COHETE"?',
      expectedAnswer: 'TE',
      audioClue: 'CO (1) - HE (2) - TE (3). ¡Falta la sílaba TE!',
      options: ['TE', 'TO', 'TA', 'TU']
    }
  }
];

export function getEraById(id: string): EraDefinition | undefined {
  return GAME_ERAS.find(e => e.id === id);
}

export function getAllEras(): EraDefinition[] {
  return GAME_ERAS;
}
