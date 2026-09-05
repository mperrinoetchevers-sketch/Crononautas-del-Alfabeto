import { NextResponse } from 'next/server';

interface GenerateRequest {
  topic?: string;
  targetPhonemes?: string[];
  age?: number;
  count?: number;
  excludeWords?: string[];
}

interface GeneratedWordItem {
  id: string;
  word: string;
  syllables: string[];
  pictogram: string;
  hint: string;
  sentence: string;
  curiosity: string;
  category: string;
  targetPhoneme?: string;
}

// Procedural curated dictionary with rich phonemes and categories for offline fallback
const CURATED_PROCEDURAL_DICTIONARY: GeneratedWordItem[] = [
  // TRABADAS 'TR'
  {
    id: 'p-tr1',
    word: 'TRICERATOPS',
    syllables: ['TRI', 'CE', 'RA', 'TOPS'],
    pictogram: '🦖',
    hint: 'Dinosaurio pacífico con tres cuernos y gran escudo.',
    sentence: 'El triceratops busca hojas tiernas en el bosque.',
    curiosity: '¡Su cabeza con escudo medía más de dos metros de largo!',
    category: 'Dinosaurios',
    targetPhoneme: 'TR',
  },
  {
    id: 'p-tr2',
    word: 'TRONCO',
    syllables: ['TRON', 'CO'],
    pictogram: '🪵',
    hint: 'Tallo fuerte y leñoso de un gran árbol.',
    sentence: 'La ardilla saltó sobre el tronco del pino.',
    curiosity: 'Los anillos dentro del tronco indican cuántos años tiene el árbol.',
    category: 'Naturaleza',
    targetPhoneme: 'TR',
  },
  {
    id: 'p-tr3',
    word: 'TROFEO',
    syllables: ['TRO', 'FE', 'O'],
    pictogram: '🏆',
    hint: 'Premio dorado que se entrega a los campeones.',
    sentence: 'El crononauta ganó un trofeo brillante por su lectura.',
    curiosity: 'Los antiguos griegos regalaban vasijas de aceite sagrado como trofeos.',
    category: 'Ninjas',
    targetPhoneme: 'TR',
  },
  // TRABADAS 'BL' / 'BR'
  {
    id: 'p-bl1',
    word: 'BLINDAJE',
    syllables: ['BLIN', 'DA', 'JE'],
    pictogram: '🛡️',
    hint: 'Capa metálica muy resistente que protege la máquina del tiempo.',
    sentence: 'El blindaje de la nave resiste la lluvia de meteoritos.',
    curiosity: 'El caparazón de las tortugas funciona como un blindaje biológico.',
    category: 'Espacio',
    targetPhoneme: 'BL',
  },
  {
    id: 'p-br1',
    word: 'BRÚJULA',
    syllables: ['BRÚ', 'JU', 'LA'],
    pictogram: '🧭',
    hint: 'Instrumento mágico con aguja imantada que señala el norte.',
    sentence: 'Con la brújula nunca perderemos el camino a la base.',
    curiosity: 'Fue inventada en China hace más de dos mil años usando imanes naturales.',
    category: 'Exploración',
    targetPhoneme: 'BR',
  },
  {
    id: 'p-br2',
    word: 'BRAQUIOSAURIO',
    syllables: ['BRA', 'QUI', 'O', 'SAU', 'RIO'],
    pictogram: '🦕',
    hint: 'Dinosaurio gigante con cuello tan largo como un edificio.',
    sentence: 'El braquiosaurio alcanza las hojas más altas de los árboles.',
    curiosity: '¡Su corazón pesaba tanto como un auto pequeño para bombear sangre a su cabeza!',
    category: 'Dinosaurios',
    targetPhoneme: 'BR',
  },
  // TRABADAS 'PL' / 'PR'
  {
    id: 'p-pl1',
    word: 'PLANETA',
    syllables: ['PLA', 'NE', 'TA'],
    pictogram: '🪐',
    hint: 'Cuerpo celeste redondo que viaja alrededor del Sol.',
    sentence: 'Saturno es un planeta con anillos de hielo y polvo.',
    curiosity: '¡En Júpiter cabrían más de 1.300 planetas como la Tierra!',
    category: 'Espacio',
    targetPhoneme: 'PL',
  },
  {
    id: 'p-pr1',
    word: 'PRISMÁTICOS',
    syllables: ['PRIS', 'MÁ', 'TI', 'COS'],
    pictogram: '🔭',
    hint: 'Lentes dobles que permiten ver objetos muy lejanos.',
    sentence: 'Miré las estrellas con los prismáticos desde el telescopio.',
    curiosity: 'Permiten ver cráteres en la Luna con gran detalle.',
    category: 'Espacio',
    targetPhoneme: 'PR',
  },
  // TRABADAS 'CL' / 'CR'
  {
    id: 'p-cl1',
    word: 'CLAN',
    syllables: ['CLAN'],
    pictogram: '🥷',
    hint: 'Grupo de guerreros ninja y amigos muy unidos.',
    sentence: 'El clan de las cuatro tortugas defiende la ciudad.',
    curiosity: 'En Japón antiguo, los clanes ninja guardaban técnicas secretas de agilidad.',
    category: 'Ninjas',
    targetPhoneme: 'CL',
  },
  {
    id: 'p-cr1',
    word: 'CRÁTER',
    syllables: ['CRÁ', 'TER'],
    pictogram: '🌋',
    hint: 'Boca profunda de un volcán o marca dejada por un meteorito.',
    sentence: 'El robot explorador bajó al cráter del volcán apagado.',
    curiosity: 'La Luna está cubierta de miles de cráteres porque no tiene atmósfera que la proteja.',
    category: 'Espacio',
    targetPhoneme: 'CR',
  },
  // TRABADAS 'DR' / 'FL' / 'GL'
  {
    id: 'p-dr1',
    word: 'DRAGÓN',
    syllables: ['DRA', 'GÓN'],
    pictogram: '🐉',
    hint: 'Criatura mística y alada que cuida castillos medievales.',
    sentence: 'El dragón dorado vuela sobre las montañas nevadas.',
    curiosity: 'En muchas leyendas antiguas, los dragones eran sabios protectores de bibliotecas.',
    category: 'Medieval',
    targetPhoneme: 'DR',
  },
  {
    id: 'p-fl1',
    word: 'FLECHA',
    syllables: ['FLE', 'CHA'],
    pictogram: '🏹',
    hint: 'Proyectil con punta y plumas lanzado con un arco.',
    sentence: 'La flecha voló directo al centro del blanco.',
    curiosity: 'Las plumas traseras hacen que la flecha gire como un trompo en el aire para no desviarse.',
    category: 'Medieval',
    targetPhoneme: 'FL',
  },
  {
    id: 'p-gl1',
    word: 'GLOBO',
    syllables: ['GLO', 'BO'],
    pictogram: '🎈',
    hint: 'Esfera ligera llena de aire caliente o gas que flota.',
    sentence: 'El globo aerostático subió hasta tocar las nubes.',
    curiosity: 'Los primeros pasajeros de un globo aerostático fueron una oveja, un pato y un gallo.',
    category: 'Inventos',
    targetPhoneme: 'GL',
  },
  // DÍGRAFOS 'CH', 'LL', 'RR', 'Ñ'
  {
    id: 'p-ch1',
    word: 'CHOPPER',
    syllables: ['CHOP', 'PER'],
    pictogram: '🚁',
    hint: 'Vehículo aéreo con hélices giratorias rápidas.',
    sentence: 'El helicóptero vuela sobre los rascacielos.',
    curiosity: 'Puede quedarse completamente quieto en el aire flotando.',
    category: 'Futuro',
    targetPhoneme: 'CH',
  },
  {
    id: 'p-ll1',
    word: 'LLAVE',
    syllables: ['LLA', 'VE'],
    pictogram: '🗝️',
    hint: 'Pieza de metal tallada que abre cerraduras y cofres.',
    sentence: 'La llave dorada abrió la puerta secreta del templo.',
    curiosity: 'Las cerraduras más antiguas conocidas fueron creadas en el Antiguo Egipto.',
    category: 'Egipto',
    targetPhoneme: 'LL',
  },
  {
    id: 'p-rr1',
    word: 'ROBOT',
    syllables: ['RO', 'BOT'],
    pictogram: '🤖',
    hint: 'Máquina inteligente que ayuda en tareas complejas.',
    sentence: 'Cronobot repara los circuitos de la máquina del tiempo.',
    curiosity: 'La palabra "robot" viene de una obra de teatro y significa trabajo colaborativo.',
    category: 'Futuro',
    targetPhoneme: 'RR',
  },
  {
    id: 'p-n1',
    word: 'PIZZA',
    syllables: ['PIZ', 'ZA'],
    pictogram: '🍕',
    hint: 'Comida italiana favorita de las cuatro tortugas ninja.',
    sentence: 'Comimos una pizza caliente con queso y salsa.',
    curiosity: '¡La pizza moderna nació en Nápoles, Italia, hace más de doscientos años!',
    category: 'Ninjas',
    targetPhoneme: 'Z',
  }
];

export async function POST(req: Request) {
  try {
    const body: GenerateRequest = await req.json().catch(() => ({}));
    const { topic = 'General', targetPhonemes = [], count = 3, excludeWords = [] } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.OPENAI_API_KEY;

    // If Gemini API is configured, request dynamic AI generation
    if (apiKey) {
      try {
        const prompt = `Eres Cronobot, un tutor pedagógico infantil experto en alfabetización y lectoescritura en español (método fonético y silábico).
Genera exactamente ${count} palabras NUEVAS en español adaptadas para niños de 6 a 9 años.
Temática preferida: "${topic}".
Grupos fonéticos a reforzar: ${targetPhonemes.length > 0 ? targetPhonemes.join(', ') : 'sílabas trabadas (tr, bl, pl, cr) y dígrafos (ch, ll, rr)'}.
Evita estas palabras ya conocidas: ${excludeWords.join(', ')}.

Devuelve ÚNICAMENTE un JSON válido con este formato:
{
  "words": [
    {
      "id": "ai-1",
      "word": "PALABRA",
      "syllables": ["PA", "LA", "BRA"],
      "pictogram": "Emoji representativo único",
      "hint": "Definición o pista sencilla en una frase para niños",
      "sentence": "Oración breve y divertida con la palabra",
      "curiosity": "¿Sabías que...? Dato curioso educativo",
      "category": "${topic}",
      "targetPhoneme": "BR"
    }
  ]
}`;

        // Gemini REST call
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const aiResponse = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          }),
        });

        if (aiResponse.ok) {
          const result = await aiResponse.json();
          const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed.words) && parsed.words.length > 0) {
              return NextResponse.json({
                words: parsed.words.map((w: any, idx: number) => ({
                  id: `ai-${Date.now()}-${idx}`,
                  word: String(w.word || '').toUpperCase().trim(),
                  syllables: Array.isArray(w.syllables) ? w.syllables.map((s: string) => String(s).toUpperCase().trim()) : [w.word],
                  pictogram: w.pictogram || '🌟',
                  hint: w.hint || 'Palabra mágica descubierta en el tiempo.',
                  sentence: w.sentence || `La palabra ${w.word} es genial.`,
                  curiosity: w.curiosity || '¡Una palabra muy valiosa para tu vocabulario!',
                  category: w.category || topic,
                  targetPhoneme: w.targetPhoneme || targetPhonemes[0] || 'GENERAL',
                })),
                source: 'ai_gemini',
              });
            }
          }
        }
      } catch (aiErr) {
        console.warn('Gemini API dynamic generation fallback to procedural dictionary:', aiErr);
      }
    }

    // Procedural Fallback Engine (Rich, instantaneous, offline-ready)
    let filtered = CURATED_PROCEDURAL_DICTIONARY.filter(
      (item) => !excludeWords.includes(item.word.toUpperCase())
    );

    // Prioritize by target phoneme if requested
    if (targetPhonemes.length > 0) {
      const phonemeMatches = filtered.filter((item) =>
        targetPhonemes.some((ph) => item.word.toUpperCase().includes(ph.toUpperCase()))
      );
      if (phonemeMatches.length > 0) {
        filtered = phonemeMatches;
      }
    }

    // Prioritize by category topic if requested
    if (topic && topic !== 'General') {
      const topicMatches = filtered.filter(
        (item) => item.category.toLowerCase() === topic.toLowerCase()
      );
      if (topicMatches.length > 0) {
        filtered = topicMatches;
      }
    }

    // Shuffle and pick
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    // If needed, fill with remaining dictionary
    if (selected.length < count) {
      const remaining = CURATED_PROCEDURAL_DICTIONARY.filter(
        (item) => !selected.some((s) => s.id === item.id)
      ).slice(0, count - selected.length);
      selected.push(...remaining);
    }

    return NextResponse.json({
      words: selected,
      source: 'procedural_offline',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error generating vocabulary words' },
      { status: 500 }
    );
  }
}
