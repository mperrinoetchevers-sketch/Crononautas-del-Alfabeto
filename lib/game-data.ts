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

export interface MazeCollectible {
  id: string;
  letter: string;
  x: number;
  y: number;
  phonemeHint?: string;
}

export interface MazeChallenge {
  id: string;
  title: string;
  theme: string;
  targetWord: string;
  wordPictogram: string;
  grid: string[];
  collectibles: MazeCollectible[];
  hint: string;
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

export interface WritingWord {
  id: string;
  word: string;
  syllables: string[];
  pictogram: string;
  hint: string;
  audioClue: string;
}

export interface WritingChallenge {
  id: string;
  title: string;
  instruction: string;
  words: WritingWord[];
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
  mazeChallenge: MazeChallenge;
  pyramidChallenges: PyramidChallenge[];
  writingChallenge: WritingChallenge;
  kamishibaiStory: KamishibaiStory;
  escapeRiddle: EscapeRiddle;
}

export const GAME_ERAS: EraDefinition[] = [
  {
    "id": "prehistory",
    "name": "Prehistoria & Dinosaurios",
    "periodLabel": "Hace 65 millones de años",
    "icon": "🦖",
    "themeColor": "emerald",
    "bgGradient": "from-emerald-950 via-teal-950 to-slate-950",
    "badge": "Cazador de Sílabas",
    "artifactName": "Cristal Fósil de Ámbar",
    "artifactIcon": "💎",
    "description": "¡Viaja a la era de los dinosaurios! Explora cavernas, supera laberintos de lava, escribe palabras rupestres y rescata el cristal fósil.",
    "pedagogicalFocus": "Conciencia fonológica, segmentación silábica (2 a 4 sílabas), navegación espacial y escritura de palabras clave.",
    "syllablesWords": [
      {
        "id": "p1",
        "word": "fósil",
        "syllables": [
          "fó",
          "sil"
        ],
        "pictogram": "🦴",
        "category": "Prehistoria",
        "hint": "Resto antiguo convertido en roca"
      },
      {
        "id": "p2",
        "word": "volcán",
        "syllables": [
          "vol",
          "cán"
        ],
        "pictogram": "🌋",
        "category": "Prehistoria",
        "hint": "Montaña que expulsa lava y fuego"
      },
      {
        "id": "p3",
        "word": "cueva",
        "syllables": [
          "cue",
          "va"
        ],
        "pictogram": "🛖",
        "category": "Prehistoria",
        "hint": "Refugio de piedra natural"
      },
      {
        "id": "p4",
        "word": "mamut",
        "syllables": [
          "ma",
          "mut"
        ],
        "pictogram": "🦣",
        "category": "Animales",
        "hint": "Elefante lanudo gigante del pasado"
      },
      {
        "id": "p5",
        "word": "fuego",
        "syllables": [
          "fue",
          "go"
        ],
        "pictogram": "🔥",
        "category": "Prehistoria",
        "hint": "Descubrimiento que brinda luz y calor"
      },
      {
        "id": "p6",
        "word": "dinosaurio",
        "syllables": [
          "di",
          "no",
          "sau",
          "rio"
        ],
        "pictogram": "🦕",
        "category": "Dinosaurios",
        "hint": "Gran reptil de la era mesozoica"
      },
      {
        "id": "p7",
        "word": "roca",
        "syllables": [
          "ro",
          "ca"
        ],
        "pictogram": "🪨",
        "category": "Prehistoria",
        "hint": "Piedra sólida y resistente"
      },
      {
        "id": "p8",
        "word": "huevo",
        "syllables": [
          "hue",
          "vo"
        ],
        "pictogram": "🥚",
        "category": "Dinosaurios",
        "hint": "Nido donde nacen los pequeños reptiles"
      },
      {
        "id": "p9",
        "word": "planta",
        "syllables": [
          "plan",
          "ta"
        ],
        "pictogram": "🌿",
        "category": "Prehistoria",
        "hint": "Alimento de dinosaurios herbívoros"
      },
      {
        "id": "p10",
        "word": "huella",
        "syllables": [
          "hue",
          "lla"
        ],
        "pictogram": "🐾",
        "category": "Dinosaurios",
        "hint": "Pisada gigante marcada en el barro"
      }
    ],
    "intruderChallenges": [
      {
        "id": "ic-p1",
        "instruction": "Encuentra el objeto intruso que NO existía en la era de los dinosaurios:",
        "type": "semantic",
        "options": [
          {
            "text": "Mamut",
            "pictogram": "🦣",
            "isIntruder": false,
            "reason": "Animal de la prehistoria"
          },
          {
            "text": "Fósil",
            "pictogram": "🦴",
            "isIntruder": false,
            "reason": "Resto prehistórico"
          },
          {
            "text": "Teléfono",
            "pictogram": "📱",
            "isIntruder": true,
            "reason": "¡Los teléfonos se inventaron millones de años después!"
          },
          {
            "text": "Volcán",
            "pictogram": "🌋",
            "isIntruder": false,
            "reason": "Formación natural prehistórica"
          }
        ]
      },
      {
        "id": "ic-p2",
        "instruction": "Encuentra la palabra intrusa que NO empieza con la letra F:",
        "type": "orthographic",
        "options": [
          {
            "text": "Fósil",
            "pictogram": "🦴",
            "isIntruder": false,
            "reason": "Empieza con F"
          },
          {
            "text": "Fuego",
            "pictogram": "🔥",
            "isIntruder": false,
            "reason": "Empieza con F"
          },
          {
            "text": "Cueva",
            "pictogram": "🛖",
            "isIntruder": true,
            "reason": "¡Cueva empieza con la letra C, no con F!"
          },
          {
            "text": "Fauna",
            "pictogram": "🦖",
            "isIntruder": false,
            "reason": "Empieza con F"
          }
        ]
      }
    ],
    "mazeChallenge": {
      "id": "maze-p1",
      "title": "El Laberinto de la Cueva Fósil",
      "theme": "prehistory",
      "targetWord": "FOSIL",
      "wordPictogram": "🦴",
      "grid": [
        "#######",
        "#S....#",
        "#.###.#",
        "#.....#",
        "#.###.#",
        "#....E#",
        "#######"
      ],
      "collectibles": [
        {
          "id": "col-p1",
          "letter": "F",
          "x": 2,
          "y": 1,
          "phonemeHint": "Sonido /f/"
        },
        {
          "id": "col-p2",
          "letter": "O",
          "x": 5,
          "y": 1,
          "phonemeHint": "Vocal /o/"
        },
        {
          "id": "col-p3",
          "letter": "S",
          "x": 3,
          "y": 3,
          "phonemeHint": "Sonido /s/"
        },
        {
          "id": "col-p4",
          "letter": "I",
          "x": 1,
          "y": 5,
          "phonemeHint": "Vocal /i/"
        },
        {
          "id": "col-p5",
          "letter": "L",
          "x": 4,
          "y": 5,
          "phonemeHint": "Sonido /l/"
        }
      ],
      "hint": "Guía a Cronobot por la cueva, recoge las 5 letras de F-O-S-I-L y llega al portal de salida."
    },
    "pyramidChallenges": [
      {
        "id": "pyr-p1",
        "title": "El Valle de los Grandes Reptiles",
        "theme": "Prehistoria",
        "secretCodeWord": "DINOSAURIO",
        "rewardArtifactPiece": "Ámbar Brillante",
        "steps": [
          {
            "text": "El fósil"
          },
          {
            "text": "El fósil brilla"
          },
          {
            "text": "El fósil brilla en la cueva"
          },
          {
            "text": "El fósil brilla en la cueva del gran dinosaurio."
          }
        ]
      }
    ],
    "writingChallenge": {
      "id": "write-p1",
      "title": "Taller de Escritura Rupestre",
      "instruction": "Escribe las palabras prehistóricas para grabarlas en el gran mural de la cueva:",
      "words": [
        {
          "id": "wp1",
          "word": "FOSIL",
          "syllables": [
            "FO",
            "SIL"
          ],
          "pictogram": "🦴",
          "hint": "Hueso antiguo petrificado",
          "audioClue": "Fó-sil"
        },
        {
          "id": "wp2",
          "word": "MAMUT",
          "syllables": [
            "MA",
            "MUT"
          ],
          "pictogram": "🦣",
          "hint": "Elefante lanudo de la era de hielo",
          "audioClue": "Ma-mut"
        },
        {
          "id": "wp3",
          "word": "FUEGO",
          "syllables": [
            "FUE",
            "GO"
          ],
          "pictogram": "🔥",
          "hint": "Llama que calienta la caverna",
          "audioClue": "Fue-go"
        },
        {
          "id": "wp4",
          "word": "CUEVA",
          "syllables": [
            "CUE",
            "VA"
          ],
          "pictogram": "🛖",
          "hint": "Refugio rocoso de los primeros humanos",
          "audioClue": "Cue-va"
        },
        {
          "id": "wp5",
          "word": "VOLCAN",
          "syllables": [
            "VOL",
            "CAN"
          ],
          "pictogram": "🌋",
          "hint": "Montaña que arroja lava encendida",
          "audioClue": "Vol-cán"
        }
      ]
    },
    "kamishibaiStory": {
      "id": "kami-p1",
      "title": "El Pequeño Rex y el Fósil Perdido",
      "eraId": "prehistory",
      "moral": "La curiosidad y la lectura nos ayudan a resolver grandes misterios.",
      "cards": [
        {
          "id": "kc-p1",
          "sequenceIndex": 1,
          "title": "El amanecer en el valle",
          "narrativeText": "En un valle lleno de volcanes, un pequeño dinosaurio encontró una extraña roca brillante.",
          "pictograms": [
            "🦖",
            "🌋",
            "💎"
          ],
          "soundCue": "chime"
        },
        {
          "id": "kc-p2",
          "sequenceIndex": 2,
          "title": "El misterio de la cueva",
          "narrativeText": "El pequeño Rex llevó la roca a la cueva oscura para examinarla junto al fuego.",
          "pictograms": [
            "🛖",
            "🔥",
            "🦴"
          ],
          "soundCue": "drum"
        },
        {
          "id": "kc-p3",
          "sequenceIndex": 3,
          "title": "La huella en la piedra",
          "narrativeText": "Al frotar la roca, apareció una huella mágica que indicaba el camino secreto.",
          "pictograms": [
            "🐾",
            "✨",
            "🧭"
          ],
          "soundCue": "portal"
        },
        {
          "id": "kc-p4",
          "sequenceIndex": 4,
          "title": "El cristal del tiempo revelado",
          "narrativeText": "¡Era el Cristal Fósil de Ámbar! Todos los dinosaurios celebraron el gran descubrimiento.",
          "pictograms": [
            "🎉",
            "💎",
            "🦖"
          ],
          "soundCue": "celebration"
        }
      ]
    },
    "escapeRiddle": {
      "id": "esc-p1",
      "title": "La Cripta del T-Rex Guardián",
      "storyPrompt": "Para abrir el cofre de piedra y rescatar el Cristal de Ámbar, debes completar el nombre del gran reptil: \"DI - NO - SAU - _____\"",
      "targetQuestion": "¿Qué sílaba completa la palabra \"DINOSAURIO\"?",
      "expectedAnswer": "RIO",
      "audioClue": "Escucha con atención: DI - NO - SAU - RIO. ¡Falta RIO!",
      "options": [
        "RIO",
        "RA",
        "SOL",
        "PAN"
      ]
    }
  },
  {
    "id": "egypt",
    "name": "Antiguo Egipto & Jeroglíficos",
    "periodLabel": "Año 2500 a.C.",
    "icon": "🏛️",
    "themeColor": "amber",
    "bgGradient": "from-amber-950 via-yellow-950 to-slate-950",
    "badge": "Descifrador de Jeroglíficos",
    "artifactName": "Papiro del Tiempo Dorado",
    "artifactIcon": "📜",
    "description": "¡Desembarca junto al río Nilo! Descifra los símbolos de las pirámides, recorre laberintos de arena, escribe palabras sagradas y halla el papiro dorado.",
    "pedagogicalFocus": "Lectura de palabras bisílabas y polisílabas, ortografía de palabras con acentos y comprensión de pistas contextuales.",
    "syllablesWords": [
      {
        "id": "e1",
        "word": "arena",
        "syllables": [
          "a",
          "re",
          "na"
        ],
        "pictogram": "🏜️",
        "category": "Egipto",
        "hint": "Cubre todo el gran desierto"
      },
      {
        "id": "e2",
        "word": "momia",
        "syllables": [
          "mo",
          "mia"
        ],
        "pictogram": "📜",
        "category": "Egipto",
        "hint": "Envuelto en telas antiguas en la tumba"
      },
      {
        "id": "e3",
        "word": "pirámide",
        "syllables": [
          "pi",
          "rá",
          "mi",
          "de"
        ],
        "pictogram": "🏛️",
        "category": "Egipto",
        "hint": "Monumento triangular de piedra colosal"
      },
      {
        "id": "e4",
        "word": "faraón",
        "syllables": [
          "fa",
          "ra",
          "ón"
        ],
        "pictogram": "👑",
        "category": "Egipto",
        "hint": "Rey supremo y gobernante del Nilo"
      },
      {
        "id": "e5",
        "word": "tesoro",
        "syllables": [
          "te",
          "so",
          "ro"
        ],
        "pictogram": "💎",
        "category": "Egipto",
        "hint": "Joyas y cofres dorados escondidos"
      },
      {
        "id": "e6",
        "word": "escarabajo",
        "syllables": [
          "es",
          "ca",
          "ra",
          "ba",
          "jo"
        ],
        "pictogram": "🪲",
        "category": "Egipto",
        "hint": "Amuleto sagrado protector de oro"
      },
      {
        "id": "e7",
        "word": "papiro",
        "syllables": [
          "pa",
          "pi",
          "ro"
        ],
        "pictogram": "📄",
        "category": "Egipto",
        "hint": "Lámina vegetal usada para escribir"
      },
      {
        "id": "e8",
        "word": "esfinge",
        "syllables": [
          "es",
          "fin",
          "ge"
        ],
        "pictogram": "🗿",
        "category": "Egipto",
        "hint": "Estatua gigante con cuerpo de león"
      },
      {
        "id": "e9",
        "word": "templo",
        "syllables": [
          "tem",
          "plo"
        ],
        "pictogram": "⛩️",
        "category": "Egipto",
        "hint": "Lugar sagrado de columnas doradas"
      },
      {
        "id": "e10",
        "word": "oasis",
        "syllables": [
          "o",
          "a",
          "sis"
        ],
        "pictogram": "🌴",
        "category": "Egipto",
        "hint": "Manantial de agua fresca y palmeras"
      }
    ],
    "intruderChallenges": [
      {
        "id": "ic-e1",
        "instruction": "Encuentra la palabra intrusa que NO pertenece al desierto de Egipto:",
        "type": "semantic",
        "options": [
          {
            "text": "Pirámide",
            "pictogram": "🏛️",
            "isIntruder": false,
            "reason": "Monumento egipcio"
          },
          {
            "text": "Faraón",
            "pictogram": "👑",
            "isIntruder": false,
            "reason": "Gobernante egipcio"
          },
          {
            "text": "Pingüino",
            "pictogram": "🐧",
            "isIntruder": true,
            "reason": "¡Los pingüinos viven en el hielo polar, no en el desierto!"
          },
          {
            "text": "Arena",
            "pictogram": "🏜️",
            "isIntruder": false,
            "reason": "Elemento del desierto"
          }
        ]
      },
      {
        "id": "ic-e2",
        "instruction": "Encuentra la palabra intrusa que tiene 4 sílabas (las demás tienen 3):",
        "type": "orthographic",
        "options": [
          {
            "text": "A-re-na",
            "pictogram": "🏜️",
            "isIntruder": false,
            "reason": "Tiene 3 sílabas"
          },
          {
            "text": "Te-so-ro",
            "pictogram": "💎",
            "isIntruder": false,
            "reason": "Tiene 3 sílabas"
          },
          {
            "text": "Pa-pi-ro",
            "pictogram": "📄",
            "isIntruder": false,
            "reason": "Tiene 3 sílabas"
          },
          {
            "text": "Pi-rá-mi-de",
            "pictogram": "🏛️",
            "isIntruder": true,
            "reason": "¡Pirámide tiene 4 sílabas (pi-rá-mi-de)!"
          }
        ]
      }
    ],
    "mazeChallenge": {
      "id": "maze-e1",
      "title": "El Laberinto de los Pasadizos Secretos",
      "theme": "egypt",
      "targetWord": "MOMIA",
      "wordPictogram": "📜",
      "grid": [
        "#######",
        "#S....#",
        "#.###.#",
        "#.....#",
        "#.###.#",
        "#....E#",
        "#######"
      ],
      "collectibles": [
        {
          "id": "col-e1",
          "letter": "M",
          "x": 2,
          "y": 1,
          "phonemeHint": "Sonido /m/"
        },
        {
          "id": "col-e2",
          "letter": "O",
          "x": 5,
          "y": 1,
          "phonemeHint": "Vocal /o/"
        },
        {
          "id": "col-e3",
          "letter": "M",
          "x": 3,
          "y": 3,
          "phonemeHint": "Sonido /m/"
        },
        {
          "id": "col-e4",
          "letter": "I",
          "x": 1,
          "y": 5,
          "phonemeHint": "Vocal /i/"
        },
        {
          "id": "col-e5",
          "letter": "A",
          "x": 4,
          "y": 5,
          "phonemeHint": "Vocal /a/"
        }
      ],
      "hint": "Recorre los pasillos dorados de la pirámide, junta las letras de M-O-M-I-A y cruza el portal."
    },
    "pyramidChallenges": [
      {
        "id": "pyr-e1",
        "title": "El Secreto de la Gran Pirámide",
        "theme": "Egipto",
        "secretCodeWord": "JEROGLIFICO",
        "rewardArtifactPiece": "Sello del Escarabajo",
        "steps": [
          {
            "text": "La arena"
          },
          {
            "text": "La arena cubre"
          },
          {
            "text": "La arena cubre el templo"
          },
          {
            "text": "La arena cubre el templo sagrado del faraón dorado."
          }
        ]
      }
    ],
    "writingChallenge": {
      "id": "write-e1",
      "title": "Taller de Escritura en Papiro Real",
      "instruction": "Escribe las palabras sagradas del Antiguo Egipto usando las letras del escriba:",
      "words": [
        {
          "id": "we1",
          "word": "MOMIA",
          "syllables": [
            "MO",
            "MIA"
          ],
          "pictogram": "📜",
          "hint": "Envuelto en telas milenarias",
          "audioClue": "Mo-mia"
        },
        {
          "id": "we2",
          "word": "ARENA",
          "syllables": [
            "A",
            "RE",
            "NA"
          ],
          "pictogram": "🏜️",
          "hint": "Grano dorado del desierto",
          "audioClue": "A-re-na"
        },
        {
          "id": "we3",
          "word": "FARAON",
          "syllables": [
            "FA",
            "RA",
            "ON"
          ],
          "pictogram": "👑",
          "hint": "Rey poderoso de Egipto",
          "audioClue": "Fa-ra-ón"
        },
        {
          "id": "we4",
          "word": "TESORO",
          "syllables": [
            "TE",
            "SO",
            "RO"
          ],
          "pictogram": "💎",
          "hint": "Cofre repleto de oro y gemas",
          "audioClue": "Te-so-ro"
        },
        {
          "id": "we5",
          "word": "PAPIRO",
          "syllables": [
            "PA",
            "PI",
            "RO"
          ],
          "pictogram": "📄",
          "hint": "Papel antiguo de juncos del Nilo",
          "audioClue": "Pa-pi-ro"
        }
      ]
    },
    "kamishibaiStory": {
      "id": "kami-e1",
      "title": "El Escarabajo de Oro y el Papiro Sagrado",
      "eraId": "egypt",
      "moral": "Descifrar y leer los símbolos antiguos nos llena de sabiduría.",
      "cards": [
        {
          "id": "kc-e1",
          "sequenceIndex": 1,
          "title": "El escriba en el Nilo",
          "narrativeText": "A orillas del río Nilo, el joven escriba leía pergaminos bajo la sombra de las palmeras.",
          "pictograms": [
            "🏜️",
            "🌊",
            "📄"
          ],
          "soundCue": "chime"
        },
        {
          "id": "kc-e2",
          "sequenceIndex": 2,
          "title": "La puerta de la pirámide",
          "narrativeText": "Encontró una puerta secreta custodiada por un escarabajo de ojos de esmeralda.",
          "pictograms": [
            "🏛️",
            "🪲",
            "🔒"
          ],
          "soundCue": "drum"
        },
        {
          "id": "kc-e3",
          "sequenceIndex": 3,
          "title": "La lectura del jeroglífico",
          "narrativeText": "Leyó en voz alta los tres símbolos dorados y la gran piedra de entrada se abrió.",
          "pictograms": [
            "✨",
            "📜",
            "🗝️"
          ],
          "soundCue": "portal"
        },
        {
          "id": "kc-e4",
          "sequenceIndex": 4,
          "title": "El Papiro del Tiempo",
          "narrativeText": "En el centro de la sala brillaba el Papiro del Tiempo Dorado listo para los Crononautas.",
          "pictograms": [
            "🏆",
            "📜",
            "👑"
          ],
          "soundCue": "celebration"
        }
      ]
    },
    "escapeRiddle": {
      "id": "esc-e1",
      "title": "La Puerta Secreta del Faraón",
      "storyPrompt": "Para abrir el sarcófago dorado, descubre la palabra oculta: \"Guardián de piedra con cuerpo de león y cabeza humana\".",
      "targetQuestion": "¿Cómo se llama esta gran estatua egipcia?",
      "expectedAnswer": "Esfinge",
      "audioClue": "Comienza con Es- y termina con -finge: Es-fin-ge.",
      "options": [
        "Esfinge",
        "Pirámide",
        "Momia",
        "Camello"
      ]
    }
  },
  {
    "id": "medieval",
    "name": "Edad Media & Castillos",
    "periodLabel": "Año 1200",
    "icon": "🏰",
    "themeColor": "blue",
    "bgGradient": "from-blue-950 via-indigo-950 to-slate-950",
    "badge": "Caballero Lector",
    "artifactName": "Engranaje de Hierro Real",
    "artifactIcon": "⚙️",
    "description": "¡Adéntrate en la fortaleza medieval! Esquiva dragones, atraviesa el laberinto de la mazmorra, redacta tratados de caballeros y rescata el engranaje real.",
    "pedagogicalFocus": "Lectura expresiva, fluidez lectora, ortografía de palabras complejas y comprensión inferencial.",
    "syllablesWords": [
      {
        "id": "m1",
        "word": "castillo",
        "syllables": [
          "cas",
          "ti",
          "llo"
        ],
        "pictogram": "🏰",
        "category": "Medieval",
        "hint": "Gran fortaleza de piedra con torres y foso"
      },
      {
        "id": "m2",
        "word": "dragón",
        "syllables": [
          "dra",
          "gón"
        ],
        "pictogram": "🐉",
        "category": "Medieval",
        "hint": "Criatura alada que escupe fuego"
      },
      {
        "id": "m3",
        "word": "espada",
        "syllables": [
          "es",
          "pa",
          "da"
        ],
        "pictogram": "⚔️",
        "category": "Medieval",
        "hint": "Arma de metal templado del caballero"
      },
      {
        "id": "m4",
        "word": "escudo",
        "syllables": [
          "es",
          "cu",
          "do"
        ],
        "pictogram": "🛡️",
        "category": "Medieval",
        "hint": "Protección para desviar los golpes"
      },
      {
        "id": "m5",
        "word": "corona",
        "syllables": [
          "co",
          "ro",
          "na"
        ],
        "pictogram": "👑",
        "category": "Medieval",
        "hint": "Aro de oro que corona a los reyes"
      },
      {
        "id": "m6",
        "word": "caballero",
        "syllables": [
          "ca",
          "ba",
          "lle",
          "ro"
        ],
        "pictogram": "🤺",
        "category": "Medieval",
        "hint": "Guerrero valiente con armadura brillante"
      },
      {
        "id": "m7",
        "word": "princesa",
        "syllables": [
          "prin",
          "ce",
          "sa"
        ],
        "pictogram": "👸",
        "category": "Medieval",
        "hint": "Noble valiente del castillo real"
      },
      {
        "id": "m8",
        "word": "caballo",
        "syllables": [
          "ca",
          "ba",
          "llo"
        ],
        "pictogram": "🐎",
        "category": "Medieval",
        "hint": "Fiel amigo veloz del caballero"
      },
      {
        "id": "m9",
        "word": "torre",
        "syllables": [
          "to",
          "rre"
        ],
        "pictogram": "🗼",
        "category": "Medieval",
        "hint": "Construcción alta para vigilar el horizonte"
      },
      {
        "id": "m10",
        "word": "antorcha",
        "syllables": [
          "an",
          "tor",
          "cha"
        ],
        "pictogram": "🕯️",
        "category": "Medieval",
        "hint": "Fuego en vara de madera que alumbra"
      }
    ],
    "intruderChallenges": [
      {
        "id": "ic-m1",
        "instruction": "Encuentra el objeto intruso que NO corresponde al mundo de los caballeros:",
        "type": "semantic",
        "options": [
          {
            "text": "Espada",
            "pictogram": "⚔️",
            "isIntruder": false,
            "reason": "Arma del caballero"
          },
          {
            "text": "Castillo",
            "pictogram": "🏰",
            "isIntruder": false,
            "reason": "Hogar medieval"
          },
          {
            "text": "Computadora",
            "pictogram": "💻",
            "isIntruder": true,
            "reason": "¡En la Edad Media no existían computadoras ni cables!"
          },
          {
            "text": "Escudo",
            "pictogram": "🛡️",
            "isIntruder": false,
            "reason": "Defensa de hierro"
          }
        ]
      },
      {
        "id": "ic-m2",
        "instruction": "Encuentra la palabra intrusa que NO contiene el grupo LL:",
        "type": "orthographic",
        "options": [
          {
            "text": "Cas-ti-llo",
            "pictogram": "🏰",
            "isIntruder": false,
            "reason": "Tiene LL"
          },
          {
            "text": "Ca-ba-lle-ro",
            "pictogram": "🤺",
            "isIntruder": false,
            "reason": "Tiene LL"
          },
          {
            "text": "Ca-ba-llo",
            "pictogram": "🐎",
            "isIntruder": false,
            "reason": "Tiene LL"
          },
          {
            "text": "Es-pa-da",
            "pictogram": "⚔️",
            "isIntruder": true,
            "reason": "¡Espada no tiene doble L!"
          }
        ]
      }
    ],
    "mazeChallenge": {
      "id": "maze-m1",
      "title": "El Laberinto de la Mazmorra del Dragón",
      "theme": "medieval",
      "targetWord": "ESPADA",
      "wordPictogram": "⚔️",
      "grid": [
        "#######",
        "#S....#",
        "#.###.#",
        "#.....#",
        "#.###.#",
        "#....E#",
        "#######"
      ],
      "collectibles": [
        {
          "id": "col-m1",
          "letter": "E",
          "x": 2,
          "y": 1,
          "phonemeHint": "Vocal /e/"
        },
        {
          "id": "col-m2",
          "letter": "S",
          "x": 4,
          "y": 1,
          "phonemeHint": "Sonido /s/"
        },
        {
          "id": "col-m3",
          "letter": "P",
          "x": 5,
          "y": 2,
          "phonemeHint": "Sonido /p/"
        },
        {
          "id": "col-m4",
          "letter": "A",
          "x": 3,
          "y": 3,
          "phonemeHint": "Vocal /a/"
        },
        {
          "id": "col-m5",
          "letter": "D",
          "x": 1,
          "y": 5,
          "phonemeHint": "Sonido /d/"
        },
        {
          "id": "col-m6",
          "letter": "A",
          "x": 4,
          "y": 5,
          "phonemeHint": "Vocal /a/"
        }
      ],
      "hint": "Navega por las piedras del castillo, recolecta las letras de E-S-P-A-D-A y llega a la salida."
    },
    "pyramidChallenges": [
      {
        "id": "pyr-m1",
        "title": "El Vuelo del Dragón Esmeralda",
        "theme": "Medieval",
        "secretCodeWord": "FORTALEZA",
        "rewardArtifactPiece": "Escudo Encantado",
        "steps": [
          {
            "text": "El caballero"
          },
          {
            "text": "El caballero cabalga"
          },
          {
            "text": "El caballero cabalga hacia el castillo"
          },
          {
            "text": "El caballero cabalga hacia el castillo para proteger la corona real."
          }
        ]
      }
    ],
    "writingChallenge": {
      "id": "write-m1",
      "title": "Taller de Escritura del Escriba Real",
      "instruction": "Escribe las palabras del reino para sellar el pergamino oficial con el sello real:",
      "words": [
        {
          "id": "wm1",
          "word": "ESPADA",
          "syllables": [
            "ES",
            "PA",
            "DA"
          ],
          "pictogram": "⚔️",
          "hint": "Hoja de acero del caballero",
          "audioClue": "Es-pa-da"
        },
        {
          "id": "wm2",
          "word": "DRAGON",
          "syllables": [
            "DRA",
            "GON"
          ],
          "pictogram": "🐉",
          "hint": "Gigante con alas que arroja fuego",
          "audioClue": "Dra-gón"
        },
        {
          "id": "wm3",
          "word": "ESCUDO",
          "syllables": [
            "ES",
            "CU",
            "DO"
          ],
          "pictogram": "🛡️",
          "hint": "Protege al guerrero de las flechas",
          "audioClue": "Es-cu-do"
        },
        {
          "id": "wm4",
          "word": "CORONA",
          "syllables": [
            "CO",
            "RO",
            "NA"
          ],
          "pictogram": "👑",
          "hint": "Joya dorada de reyes y reinas",
          "audioClue": "Co-ro-na"
        },
        {
          "id": "wm5",
          "word": "CASTILLO",
          "syllables": [
            "CAS",
            "TI",
            "LLO"
          ],
          "pictogram": "🏰",
          "hint": "Gran fortaleza de piedra y murallas",
          "audioClue": "Cas-ti-llo"
        }
      ]
    },
    "kamishibaiStory": {
      "id": "kami-m1",
      "title": "El Dragón que Amaba los Cuentos",
      "eraId": "medieval",
      "moral": "La lectura y las historias tienen el poder de transformar enemigos en grandes amigos.",
      "cards": [
        {
          "id": "kc-m1",
          "sequenceIndex": 1,
          "title": "El rugido en la montaña",
          "narrativeText": "Un dragón verde vigilaba la torre más alta del castillo sin dejar entrar a nadie.",
          "pictograms": [
            "🏰",
            "🐉",
            "⛰️"
          ],
          "soundCue": "drum"
        },
        {
          "id": "kc-m2",
          "sequenceIndex": 2,
          "title": "El libro del caballero",
          "narrativeText": "El joven caballero no sacó su espada, sino un gran libro ilustrado de aventuras.",
          "pictograms": [
            "🤺",
            "📖",
            "✨"
          ],
          "soundCue": "chime"
        },
        {
          "id": "kc-m3",
          "sequenceIndex": 3,
          "title": "La lectura compartida",
          "narrativeText": "El caballero leyó con voz clara y el dragón se sentó emocionado a escuchar el cuento.",
          "pictograms": [
            "🐉",
            "📖",
            "❤️"
          ],
          "soundCue": "portal"
        },
        {
          "id": "kc-m4",
          "sequenceIndex": 4,
          "title": "El engranaje obsequiado",
          "narrativeText": "Agradecido por la historia, el dragón le entregó el Engranaje de Hierro Real.",
          "pictograms": [
            "🎉",
            "⚙️",
            "🏰"
          ],
          "soundCue": "celebration"
        }
      ]
    },
    "escapeRiddle": {
      "id": "esc-m1",
      "title": "El Puente Levadizo del Castillo",
      "storyPrompt": "Para bajar el puente levadizo de madera, responde al acertijo del guardia: \"Tiene corona pero no es rey, tiene espinas pero no es pez, vive en el castillo y protege al reino.\"",
      "targetQuestion": "¿De qué objeto o personaje se habla?",
      "expectedAnswer": "Castillo",
      "audioClue": "La gran fortaleza de piedra: el Cas-ti-llo.",
      "options": [
        "Castillo",
        "Espada",
        "Dragón",
        "Caballo"
      ]
    }
  },
  {
    "id": "industrial",
    "name": "Era Industrial & Invención",
    "periodLabel": "Año 1880",
    "icon": "🚂",
    "themeColor": "purple",
    "bgGradient": "from-purple-950 via-slate-950 to-zinc-950",
    "badge": "Maestro Mecánico",
    "artifactName": "Manómetro de Presión Cuántica",
    "artifactIcon": "🎛️",
    "description": "¡Súbete al ferrocarril de vapor! Conoce las primeras fábricas, recorre el laberinto de tuberías, escribe patentes mecánicas y rescata el manómetro.",
    "pedagogicalFocus": "Comprensión de oraciones compuestas, vocabulario técnico temprano, discriminación visual y secuenciación lógica.",
    "syllablesWords": [
      {
        "id": "i1",
        "word": "tren",
        "syllables": [
          "tren"
        ],
        "pictogram": "🚂",
        "category": "Industrial",
        "hint": "Vehículo potente que corre sobre vías de acero"
      },
      {
        "id": "i2",
        "word": "vapor",
        "syllables": [
          "va",
          "por"
        ],
        "pictogram": "💨",
        "category": "Industrial",
        "hint": "Gas blanco que impulsa los pistones con calor"
      },
      {
        "id": "i3",
        "word": "máquina",
        "syllables": [
          "má",
          "qui",
          "na"
        ],
        "pictogram": "🏭",
        "category": "Industrial",
        "hint": "Conjunto de piezas mecánicas que realizan trabajo"
      },
      {
        "id": "i4",
        "word": "engranaje",
        "syllables": [
          "en",
          "gra",
          "na",
          "je"
        ],
        "pictogram": "⚙️",
        "category": "Industrial",
        "hint": "Rueda con dientes de metal que transmite movimiento"
      },
      {
        "id": "i5",
        "word": "telégrafo",
        "syllables": [
          "te",
          "lé",
          "gra",
          "fo"
        ],
        "pictogram": "📠",
        "category": "Industrial",
        "hint": "Aparato que envía mensajes eléctricos a distancia"
      },
      {
        "id": "i6",
        "word": "invento",
        "syllables": [
          "in",
          "ven",
          "to"
        ],
        "pictogram": "💡",
        "category": "Industrial",
        "hint": "Nueva creación brillante y útil para la humanidad"
      },
      {
        "id": "i7",
        "word": "carbón",
        "syllables": [
          "car",
          "bón"
        ],
        "pictogram": "🪨",
        "category": "Industrial",
        "hint": "Mineral negro combustible que alimenta la caldera"
      },
      {
        "id": "i8",
        "word": "motor",
        "syllables": [
          "mo",
          "tor"
        ],
        "pictogram": "🏎️",
        "category": "Industrial",
        "hint": "Corazón mecánico que produce la fuerza motriz"
      },
      {
        "id": "i9",
        "word": "fábrica",
        "syllables": [
          "fá",
          "bri",
          "ca"
        ],
        "pictogram": "🏗️",
        "category": "Industrial",
        "hint": "Edificio donde se producen los nuevos inventos"
      },
      {
        "id": "i10",
        "word": "rieles",
        "syllables": [
          "rie",
          "les"
        ],
        "pictogram": "🛤️",
        "category": "Industrial",
        "hint": "Barras paralelas de metal por donde rueda el tren"
      }
    ],
    "intruderChallenges": [
      {
        "id": "ic-i1",
        "instruction": "Encuentra la palabra intrusa que NO tiene que ver con máquinas de vapor:",
        "type": "semantic",
        "options": [
          {
            "text": "Engranaje",
            "pictogram": "⚙️",
            "isIntruder": false,
            "reason": "Pieza de máquina"
          },
          {
            "text": "Vapor",
            "pictogram": "💨",
            "isIntruder": false,
            "reason": "Energía motriz"
          },
          {
            "text": "Manzana",
            "pictogram": "🍎",
            "isIntruder": true,
            "reason": "¡La manzana es una fruta deliciosa, no un mecanismo!"
          },
          {
            "text": "Motor",
            "pictogram": "🏎️",
            "isIntruder": false,
            "reason": "Impulso mecánico"
          }
        ]
      },
      {
        "id": "ic-i2",
        "instruction": "Encuentra la palabra intrusa que es monosílaba (1 sola sílaba):",
        "type": "orthographic",
        "options": [
          {
            "text": "Va-por",
            "pictogram": "💨",
            "isIntruder": false,
            "reason": "Tiene 2 sílabas"
          },
          {
            "text": "Mo-tor",
            "pictogram": "🏎️",
            "isIntruder": false,
            "reason": "Tiene 2 sílabas"
          },
          {
            "text": "Car-bón",
            "pictogram": "🪨",
            "isIntruder": false,
            "reason": "Tiene 2 sílabas"
          },
          {
            "text": "Tren",
            "pictogram": "🚂",
            "isIntruder": true,
            "reason": "¡Tren se pronuncia de un solo golpe (1 sílaba)!"
          }
        ]
      }
    ],
    "mazeChallenge": {
      "id": "maze-i1",
      "title": "El Laberinto del Taller de Engranajes",
      "theme": "industrial",
      "targetWord": "VAPOR",
      "wordPictogram": "💨",
      "grid": [
        "#######",
        "#S....#",
        "#.###.#",
        "#.....#",
        "#.###.#",
        "#....E#",
        "#######"
      ],
      "collectibles": [
        {
          "id": "col-i1",
          "letter": "V",
          "x": 2,
          "y": 1,
          "phonemeHint": "Sonido /v/"
        },
        {
          "id": "col-i2",
          "letter": "A",
          "x": 5,
          "y": 1,
          "phonemeHint": "Vocal /a/"
        },
        {
          "id": "col-i3",
          "letter": "P",
          "x": 3,
          "y": 3,
          "phonemeHint": "Sonido /p/"
        },
        {
          "id": "col-i4",
          "letter": "O",
          "x": 1,
          "y": 5,
          "phonemeHint": "Vocal /o/"
        },
        {
          "id": "col-i5",
          "letter": "R",
          "x": 4,
          "y": 5,
          "phonemeHint": "Sonido /r/"
        }
      ],
      "hint": "Cruza la fábrica de tuberías, junta las letras de V-A-P-O-R y llega a la estación."
    },
    "pyramidChallenges": [
      {
        "id": "pyr-i1",
        "title": "El Expreso a Vapor del Tiempo",
        "theme": "Industrial",
        "secretCodeWord": "ENGRANAJE",
        "rewardArtifactPiece": "Manómetro de Presión",
        "steps": [
          {
            "text": "La locomotora"
          },
          {
            "text": "La locomotora avanza"
          },
          {
            "text": "La locomotora avanza sobre los rieles"
          },
          {
            "text": "La locomotora avanza sobre los rieles impulsada por vapor y engranajes dorados."
          }
        ]
      }
    ],
    "writingChallenge": {
      "id": "write-i1",
      "title": "Taller de Escritura del Gran Inventor",
      "instruction": "Escribe las palabras de las máquinas para registrar la patente de los inventos:",
      "words": [
        {
          "id": "wi1",
          "word": "VAPOR",
          "syllables": [
            "VA",
            "POR"
          ],
          "pictogram": "💨",
          "hint": "Gas blanco que mueve la locomotora",
          "audioClue": "Va-por"
        },
        {
          "id": "wi2",
          "word": "TREN",
          "syllables": [
            "TREN"
          ],
          "pictogram": "🚂",
          "hint": "Máquina que viaja sobre rieles",
          "audioClue": "Tren"
        },
        {
          "id": "wi3",
          "word": "MOTOR",
          "syllables": [
            "MO",
            "TOR"
          ],
          "pictogram": "🏎️",
          "hint": "Mecanismo que produce la fuerza motriz",
          "audioClue": "Mo-tor"
        },
        {
          "id": "wi4",
          "word": "INVENTO",
          "syllables": [
            "IN",
            "VEN",
            "TO"
          ],
          "pictogram": "💡",
          "hint": "Creación nueva e ingeniosa",
          "audioClue": "In-ven-to"
        },
        {
          "id": "wi5",
          "word": "MAQUINA",
          "syllables": [
            "MA",
            "QUI",
            "NA"
          ],
          "pictogram": "🏭",
          "hint": "Aparato compuesto de engranajes y ruedas",
          "audioClue": "Má-qui-na"
        }
      ]
    },
    "kamishibaiStory": {
      "id": "kami-i1",
      "title": "El Telégrafo que Salvó la Estación",
      "eraId": "industrial",
      "moral": "La comunicación clara y la lectura rápida unen a las personas y resuelven problemas.",
      "cards": [
        {
          "id": "kc-i1",
          "sequenceIndex": 1,
          "title": "El inventor en su taller",
          "narrativeText": "El joven inventor Tomás ajustaba las tuercas de su gran telégrafo a vapor.",
          "pictograms": [
            "👨‍🔧",
            "⚙️",
            "💡"
          ],
          "soundCue": "chime"
        },
        {
          "id": "kc-i2",
          "sequenceIndex": 2,
          "title": "El mensaje urgente de la vía",
          "narrativeText": "El telégrafo comenzó a sonar: ¡bip bip bip! Había una rama en la vía del tren.",
          "pictograms": [
            "📠",
            "⚠️",
            "🚂"
          ],
          "soundCue": "drum"
        },
        {
          "id": "kc-i3",
          "sequenceIndex": 3,
          "title": "El mensaje leído a tiempo",
          "narrativeText": "Tomás leyó el mensaje en voz alta y activó la palanca de freno de la estación.",
          "pictograms": [
            "📖",
            "📢",
            "🛑"
          ],
          "soundCue": "portal"
        },
        {
          "id": "kc-i4",
          "sequenceIndex": 4,
          "title": "El tren seguro en su destino",
          "narrativeText": "El tren se detuvo a tiempo y todos los pasajeros aplaudieron la rápida lectura de Tomás.",
          "pictograms": [
            "🎉",
            "🚂",
            "👏"
          ],
          "soundCue": "celebration"
        }
      ]
    },
    "escapeRiddle": {
      "id": "esc-i1",
      "title": "La Válvula de Presión Principal",
      "storyPrompt": "Para liberar la válvula de vapor, lee la oración incompleta: \"El tren viaja rápido por las _______ de hierro.\"",
      "targetQuestion": "¿Qué palabra falta para completar la oración?",
      "expectedAnswer": "Vías",
      "audioClue": "Son los rieles de metal por donde andan los trenes: las ví-as.",
      "options": [
        "Vías",
        "Nubes",
        "Sillas",
        "Cucharas"
      ]
    }
  },
  {
    "id": "future",
    "name": "Era Espacial & Futuro",
    "periodLabel": "Año 3050",
    "icon": "🚀",
    "themeColor": "pink",
    "bgGradient": "from-pink-950 via-purple-950 to-slate-950",
    "badge": "Gran Maestro Crononauta",
    "artifactName": "Batería Crono-Cuántica",
    "artifactIcon": "🔋",
    "description": "¡La estación espacial del futuro! Domina el laberinto cuántico, escribe códigos estelares, comprende historias galácticas y enciende la Máquina del Tiempo.",
    "pedagogicalFocus": "Comprensión lectora profunda, secuenciación narrativa, ortografía de precisión y autonomía lectora total.",
    "syllablesWords": [
      {
        "id": "f1",
        "word": "cohete",
        "syllables": [
          "co",
          "he",
          "te"
        ],
        "pictogram": "🚀",
        "category": "Espacio",
        "hint": "Nave propulsada que viaja a las estrellas"
      },
      {
        "id": "f2",
        "word": "planeta",
        "syllables": [
          "pla",
          "ne",
          "ta"
        ],
        "pictogram": "🪐",
        "category": "Espacio",
        "hint": "Cuerpo celeste esférico que gira en órbita"
      },
      {
        "id": "f3",
        "word": "estrella",
        "syllables": [
          "es",
          "tre",
          "lla"
        ],
        "pictogram": "⭐",
        "category": "Espacio",
        "hint": "Astro brillante que emite luz propia"
      },
      {
        "id": "f4",
        "word": "robot",
        "syllables": [
          "ro",
          "bot"
        ],
        "pictogram": "🤖",
        "category": "Espacio",
        "hint": "Compañero mecánico con mente cuántica"
      },
      {
        "id": "f5",
        "word": "portal",
        "syllables": [
          "por",
          "tal"
        ],
        "pictogram": "🌀",
        "category": "Espacio",
        "hint": "Puerta interdimensional para viajar en el tiempo"
      },
      {
        "id": "f6",
        "word": "galaxia",
        "syllables": [
          "ga",
          "la",
          "xia"
        ],
        "pictogram": "🌌",
        "category": "Espacio",
        "hint": "Remolino gigante de millones de sistemas solares"
      },
      {
        "id": "f7",
        "word": "satélite",
        "syllables": [
          "sa",
          "té",
          "li",
          "te"
        ],
        "pictogram": "🛰️",
        "category": "Espacio",
        "hint": "Dispositivo orbital que transmite señales"
      },
      {
        "id": "f8",
        "word": "astronauta",
        "syllables": [
          "as",
          "tro",
          "nau",
          "ta"
        ],
        "pictogram": "🧑‍🚀",
        "category": "Espacio",
        "hint": "Explorador audaz del cosmos"
      },
      {
        "id": "f9",
        "word": "meteoro",
        "syllables": [
          "me",
          "teo",
          "ro"
        ],
        "pictogram": "☄️",
        "category": "Espacio",
        "hint": "Roca estelar incandescente que cruza el cielo"
      },
      {
        "id": "f10",
        "word": "cometa",
        "syllables": [
          "co",
          "me",
          "ta"
        ],
        "pictogram": "🌠",
        "category": "Espacio",
        "hint": "Cuerpo celeste con una brillante cola luminosa"
      }
    ],
    "intruderChallenges": [
      {
        "id": "ic-f1",
        "instruction": "Encuentra la palabra intrusa que NO pertenece al espacio exterior:",
        "type": "semantic",
        "options": [
          {
            "text": "Asteroide",
            "pictogram": "☄️",
            "isIntruder": false,
            "reason": "Roca espacial"
          },
          {
            "text": "Astronauta",
            "pictogram": "🧑‍🚀",
            "isIntruder": false,
            "reason": "Viajero del espacio"
          },
          {
            "text": "Submarino",
            "pictogram": "🛥️",
            "isIntruder": true,
            "reason": "¡El submarino viaja bajo las aguas del océano, no en el espacio!"
          },
          {
            "text": "Satélite",
            "pictogram": "🛰️",
            "isIntruder": false,
            "reason": "Orbita la Tierra"
          }
        ]
      },
      {
        "id": "ic-f2",
        "instruction": "Encuentra la palabra intrusa que tiene 4 sílabas (las demás tienen 3):",
        "type": "orthographic",
        "options": [
          {
            "text": "Co-he-te",
            "pictogram": "🚀",
            "isIntruder": false,
            "reason": "Tiene 3 sílabas"
          },
          {
            "text": "Pla-ne-ta",
            "pictogram": "🪐",
            "isIntruder": false,
            "reason": "Tiene 3 sílabas"
          },
          {
            "text": "Es-tre-lla",
            "pictogram": "⭐",
            "isIntruder": false,
            "reason": "Tiene 3 sílabas"
          },
          {
            "text": "As-tro-nau-ta",
            "pictogram": "🧑‍🚀",
            "isIntruder": true,
            "reason": "¡Astronauta tiene 4 sílabas (as-tro-nau-ta)!"
          }
        ]
      }
    ],
    "mazeChallenge": {
      "id": "maze-f1",
      "title": "El Laberinto de la Red Cibernética Cuántica",
      "theme": "future",
      "targetWord": "ROBOT",
      "wordPictogram": "🤖",
      "grid": [
        "#######",
        "#S....#",
        "#.###.#",
        "#.....#",
        "#.###.#",
        "#....E#",
        "#######"
      ],
      "collectibles": [
        {
          "id": "col-f1",
          "letter": "R",
          "x": 2,
          "y": 1,
          "phonemeHint": "Sonido /r/"
        },
        {
          "id": "col-f2",
          "letter": "O",
          "x": 5,
          "y": 1,
          "phonemeHint": "Vocal /o/"
        },
        {
          "id": "col-f3",
          "letter": "B",
          "x": 3,
          "y": 3,
          "phonemeHint": "Sonido /b/"
        },
        {
          "id": "col-f4",
          "letter": "O",
          "x": 1,
          "y": 5,
          "phonemeHint": "Vocal /o/"
        },
        {
          "id": "col-f5",
          "letter": "T",
          "x": 4,
          "y": 5,
          "phonemeHint": "Sonido /t/"
        }
      ],
      "hint": "Conecta los circuitos cibernéticos, recolecta las letras de R-O-B-O-T y activa el portal."
    },
    "pyramidChallenges": [
      {
        "id": "pyr-f1",
        "title": "El Despegue Interestelar",
        "theme": "Futuro",
        "secretCodeWord": "GALAXIA",
        "rewardArtifactPiece": "Chip Cuántico de Navegación",
        "steps": [
          {
            "text": "El cohete"
          },
          {
            "text": "El cohete vuela"
          },
          {
            "text": "El cohete vuela hacia las estrellas"
          },
          {
            "text": "El cohete vuela hacia las estrellas para cruzar el gran portal del tiempo."
          }
        ]
      }
    ],
    "writingChallenge": {
      "id": "write-f1",
      "title": "Taller de Escritura de la Estación Espacial",
      "instruction": "Escribe los códigos estelares para encender la computadora de salto temporal:",
      "words": [
        {
          "id": "wf1",
          "word": "ROBOT",
          "syllables": [
            "RO",
            "BOT"
          ],
          "pictogram": "🤖",
          "hint": "Compañero cibernético inteligente",
          "audioClue": "Ro-bot"
        },
        {
          "id": "wf2",
          "word": "COHETE",
          "syllables": [
            "CO",
            "HE",
            "TE"
          ],
          "pictogram": "🚀",
          "hint": "Nave espacial de propulsión estelar",
          "audioClue": "Co-he-te"
        },
        {
          "id": "wf3",
          "word": "PLANETA",
          "syllables": [
            "PLA",
            "NE",
            "TA"
          ],
          "pictogram": "🪐",
          "hint": "Mundo esférico en el cosmos",
          "audioClue": "Pla-ne-ta"
        },
        {
          "id": "wf4",
          "word": "PORTAL",
          "syllables": [
            "POR",
            "TAL"
          ],
          "pictogram": "🌀",
          "hint": "Vórtice para saltar en el hiperespacio",
          "audioClue": "Por-tal"
        },
        {
          "id": "wf5",
          "word": "GALAXIA",
          "syllables": [
            "GA",
            "LA",
            "XIA"
          ],
          "pictogram": "🌌",
          "hint": "Millones de mundos y estrellas juntos",
          "audioClue": "Ga-la-xia"
        }
      ]
    },
    "kamishibaiStory": {
      "id": "kami-f1",
      "title": "El Regreso Triunfal de los Crononautas",
      "eraId": "future",
      "moral": "Aprender a leer abre las puertas de todos los mundos y tiempos del universo.",
      "cards": [
        {
          "id": "kc-f1",
          "sequenceIndex": 1,
          "title": "La tormenta temporal superada",
          "narrativeText": "Los exploradores reunieron los 5 artefactos legendarios a través de todas las épocas de la historia.",
          "pictograms": [
            "⭐",
            "💎",
            "🧭"
          ],
          "soundCue": "chime"
        },
        {
          "id": "kc-f2",
          "sequenceIndex": 2,
          "title": "El encendido de la máquina",
          "narrativeText": "Cronobot colocó la Batería Cuántica y el portal del tiempo brilló con luces multicolores.",
          "pictograms": [
            "🤖",
            "🔋",
            "🌀"
          ],
          "soundCue": "portal"
        },
        {
          "id": "kc-f3",
          "sequenceIndex": 3,
          "title": "El viaje de regreso a casa",
          "narrativeText": "Viajaron a la velocidad de las palabras cruzando galaxias y constelaciones infinitas.",
          "pictograms": [
            "🚀",
            "🌌",
            "✨"
          ],
          "soundCue": "drum"
        },
        {
          "id": "kc-f4",
          "sequenceIndex": 4,
          "title": "La medalla del gran lector",
          "narrativeText": "Llegaron sanos y salvos a su hogar coronados como Maestros Crononautas del Alfabeto.",
          "pictograms": [
            "🏆",
            "👑",
            "🎉"
          ],
          "soundCue": "celebration"
        }
      ]
    },
    "escapeRiddle": {
      "id": "esc-f1",
      "title": "El Código Final del Hiperimpulsor",
      "storyPrompt": "Para iniciar la secuencia de salto temporal de regreso a casa, completa la palabra clave: \"CO - HE - _______\"",
      "targetQuestion": "¿Qué sílaba completa la palabra \"COHETE\"?",
      "expectedAnswer": "TE",
      "audioClue": "CO (1) - HE (2) - TE (3). ¡Falta la sílaba TE!",
      "options": [
        "TE",
        "TO",
        "TA",
        "TU"
      ]
    }
  }
];

export function getEraById(id: string): EraDefinition | undefined {
  return GAME_ERAS.find(e => e.id === id);
}

export function getAllEras(): EraDefinition[] {
  return GAME_ERAS;
}
