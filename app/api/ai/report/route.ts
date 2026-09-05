import { NextResponse } from 'next/server';

interface ReportRequest {
  profileName?: string;
  age?: number;
  phonemeStats?: Record<string, any>;
  readingSpeedWpm?: number;
  accuracyRate?: number;
  totalWordsPracticed?: number;
  discoveredVocabularyCount?: number;
  recentErrors?: any[];
}

export async function POST(req: Request) {
  try {
    const body: ReportRequest = await req.json().catch(() => ({}));
    const {
      profileName = 'Crononauta',
      age = 7,
      phonemeStats = {},
      readingSpeedWpm = 45,
      accuracyRate = 90,
      totalWordsPracticed = 15,
      discoveredVocabularyCount = 5,
      recentErrors = [],
    } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `Actúa como un psicopedagogo y maestro experto en alfabetización infantil.
Analiza las siguientes métricas de juego y lectoescritura de un niño de ${age} años llamado ${profileName}:
- Palabras practicadas: ${totalWordsPracticed}
- Palabras nuevas desbloqueadas: ${discoveredVocabularyCount}
- Precisión global: ${accuracyRate}%
- Velocidad lectora estimada: ${readingSpeedWpm} palabras por minuto
- Grupos fonéticos practicados: ${JSON.stringify(phonemeStats)}
- Errores recientes registrados: ${JSON.stringify(recentErrors.slice(0, 5))}

Genera un informe pedagógico constructivo, motivador y claro para sus padres o maestros.
Devuelve ÚNICAMENTE un JSON con esta estructura exacta:
{
  "summary": "Resumen empático de 2 o 3 oraciones sobre el avance y la fluidez del niño.",
  "readingLevel": "Nivel lector (ej: 'Explorador Inicial', 'Navegante Silábico', 'Crononauta Lector' o 'Maestro del Alfabeto')",
  "strengths": [
    "Fortaleza 1 detectada",
    "Fortaleza 2 detectada",
    "Fortaleza 3 detectada"
  ],
  "focusAreas": [
    "Área de refuerzo 1 (ej: sílabas trabadas específicas, atención a detalles ortográficos)",
    "Área de refuerzo 2"
  ],
  "recommendedActivities": [
    "Actividad divertida recomendada para hacer en familia sin pantallas 1",
    "Actividad divertida recomendada 2"
  ]
}`;

        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const aiResponse = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.6,
            },
          }),
        });

        if (aiResponse.ok) {
          const result = await aiResponse.json();
          const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({
              report: {
                ...parsed,
                generatedAt: new Date().toISOString(),
                source: 'ai_gemini',
              },
            });
          }
        }
      } catch (aiErr) {
        console.warn('Gemini report generation fallback:', aiErr);
      }
    }

    // Rule-Based Pedagogical Expert Fallback (Instant, 100% offline-ready)
    let readingLevel = 'Navegante Silábico';
    if (accuracyRate >= 95 && totalWordsPracticed > 20) {
      readingLevel = 'Maestro del Alfabeto';
    } else if (accuracyRate >= 85) {
      readingLevel = 'Crononauta Lector';
    } else {
      readingLevel = 'Explorador Inicial';
    }

    // Determine weak phonemes
    const weakList: string[] = [];
    for (const ph in phonemeStats) {
      const item = phonemeStats[ph];
      if (item.attempts > 1 && item.successes / item.attempts < 0.75) {
        weakList.push(ph);
      }
    }

    const strengths: string[] = [
      `Gran motivación en la lectura de misiones con ${totalWordsPracticed} palabras trabajadas.`,
      `Excelente ritmo de lectura estimado en ${readingSpeedWpm} palabras por minuto.`,
      `Precisión global muy destacada del ${accuracyRate}%.`,
    ];

    const focusAreas: string[] = weakList.length > 0
      ? [
          `Reforzar palabras con las sílabas: ${weakList.join(', ')}.`,
          'Fomentar la pausa y respiración al leer oraciones compuestas en voz alta.',
        ]
      : [
          'Continuar expandiendo el vocabulario con palabras de más de tres sílabas.',
          'Practicar la lectura expresiva y entonación en signos de exclamación.',
        ];

    const recommendedActivities: string[] = [
      'Juego del Detective de Palabras: buscar objetos en casa que comiencen con las letras practicadas.',
      'Lectura en Dúo Nocturna: leer 5 minutos juntos antes de dormir turnando una oración cada uno.',
      'Crea tu propio Pergamino: dibujar una historieta con 3 palabras nuevas del Códice.',
    ];

    const summary = `${profileName} está demostrando un progreso sobresaliente en su viaje de alfabetización. Su precisión del ${accuracyRate}% refleja una sólida conciencia fonológica y un gran entusiasmo por descubrir nuevas épocas y palabras.`;

    return NextResponse.json({
      report: {
        summary,
        readingLevel,
        strengths,
        focusAreas,
        recommendedActivities,
        generatedAt: new Date().toISOString(),
        source: 'pedagogical_rules',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error generating report' },
      { status: 500 }
    );
  }
}
