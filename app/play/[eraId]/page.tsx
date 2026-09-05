'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { getEraById } from '@/lib/game-data';
import { storage } from '@/lib/storage';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';

import SyllableDrums from '@/components/minigames/SyllableDrums';
import IntruderWords from '@/components/minigames/IntruderWords';
import ChronosMaze from '@/components/minigames/ChronosMaze';
import PyramidReader from '@/components/minigames/PyramidReader';
import WordWriterWorkshop from '@/components/minigames/WordWriterWorkshop';
import KamishibaiTheater from '@/components/minigames/KamishibaiTheater';
import EscapeRoomMission from '@/components/minigames/EscapeRoomMission';

import TimePortalCanvas from '@/components/TimePortalCanvas';
import AudioController from '@/components/AudioController';
import CronobotCompanion from '@/components/CronobotCompanion';
import StarCelebration from '@/components/ui/StarCelebration';

type GameStage = 'drums' | 'intruder' | 'maze' | 'pyramid' | 'writer' | 'kamishibai' | 'escape';

interface PageProps {
  params: Promise<{
    eraId: string;
  }>;
}

export default function EraPlayPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const era = getEraById(resolvedParams.eraId);

  const [currentStage, setCurrentStage] = useState<GameStage>('drums');
  const [completedStages, setCompletedStages] = useState<GameStage[]>([]);
  const [starsAccumulated, setStarsAccumulated] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationDetails, setCelebrationDetails] = useState<{
    title: string;
    message: string;
    stars: number;
    artifact?: { name: string; icon: string };
  }>({
    title: '¡Misión Cumplida!',
    message: '¡Has completado el desafío!',
    stars: 3,
  });

  const nextEraMap: Record<string, string> = {
    prehistory: 'egypt',
    egypt: 'medieval',
    medieval: 'industrial',
    industrial: 'future',
    future: 'ninja',
    ninja: 'ninja',
  };

  const nextEraId = era ? nextEraMap[era.id] : 'prehistory';

  useEffect(() => {
    if (era) {
      tts.speak(`Has llegado a ${era.name}. ¡Comencemos con el ritmo de las sílabas!`);
    }
  }, [era]);

  if (!era) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Época no encontrada</h2>
          <Link href="/map" className="px-4 py-2 bg-indigo-600 rounded-xl font-bold text-sm">
            Volver al Mapa
          </Link>
        </div>
      </div>
    );
  }

  const handleStageComplete = (stageName: GameStage, starsEarned: number) => {
    audioSynth.playCelebration();
    const nextCompleted = [...completedStages, stageName];
    setCompletedStages(nextCompleted);
    setStarsAccumulated((prev) => prev + starsEarned);

    const profile = storage.getActiveProfile();

    if (stageName === 'drums') {
      if (profile) storage.recordLevelCompletion(profile.id, `${era.id}_drums`, starsEarned);
      setCurrentStage('intruder');
    } else if (stageName === 'intruder') {
      if (profile) storage.recordLevelCompletion(profile.id, `${era.id}_intruder`, starsEarned);
      setCurrentStage('maze');
    } else if (stageName === 'maze') {
      if (profile) storage.recordLevelCompletion(profile.id, `${era.id}_maze`, starsEarned);
      setCurrentStage('pyramid');
    } else if (stageName === 'pyramid') {
      if (profile) storage.recordLevelCompletion(profile.id, `${era.id}_pyramid`, starsEarned);
      setCurrentStage('writer');
    } else if (stageName === 'writer') {
      if (profile) storage.recordLevelCompletion(profile.id, `${era.id}_writer`, starsEarned);
      setCurrentStage('kamishibai');
    } else if (stageName === 'kamishibai') {
      if (profile) storage.recordLevelCompletion(profile.id, `${era.id}_kamishibai`, starsEarned);
      setCurrentStage('escape');
    } else if (stageName === 'escape') {
      // Grand Era Finale!
      if (profile) {
        storage.recordLevelCompletion(
          profile.id,
          `${era.id}_escape`,
          starsEarned,
          era.artifactName,
          nextEraId
        );
      }

      setCelebrationDetails({
        title: `¡Dominaste la ${era.name}!`,
        message: `¡Descifraste todos los acertijos de lectura y rescataste la ${era.artifactName}!`,
        stars: starsEarned,
        artifact: {
          name: era.artifactName,
          icon: era.artifactIcon,
        },
      });
      setShowCelebration(true);
    }
  };

  const stagesList: { id: GameStage; label: string; icon: string }[] = [
    { id: 'drums', label: '1. Sílabas & Ritmo', icon: '🥁' },
    { id: 'intruder', label: '2. Palabras Intrusas', icon: '🔍' },
    { id: 'maze', label: '3. Crono-Laberinto', icon: '🌀' },
    { id: 'pyramid', label: '4. Lectura Pirámide', icon: '📐' },
    { id: 'writer', label: '5. Taller Escritura', icon: '✍️' },
    { id: 'kamishibai', label: '6. Gran Teatro', icon: '🎭' },
    { id: 'escape', label: '7. Escape Room', icon: '🗝️' },
  ];

  return (
    <main className="relative min-h-screen flex flex-col justify-between p-3 sm:p-6 overflow-hidden">
      {/* Background Portal Canvas */}
      <div className="absolute inset-0 z-0 opacity-40">
        <TimePortalCanvas eraColor={era.themeColor} speedMultiplier={1.1} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full bg-slate-900/80 border border-slate-700 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/map"
            onClick={() => audioSynth.playClick()}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-700 shadow transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">{era.icon}</span>
            <div>
              <h1 className="text-sm sm:text-lg font-black text-amber-300">{era.name}</h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold">{era.badge}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Machine Part Preview */}
          <div className="flex items-center gap-2 bg-indigo-950/80 border border-indigo-500/40 px-3 py-1.5 rounded-2xl shadow text-xs font-bold text-amber-300">
            <span className="text-lg">{era.artifactIcon}</span>
            <span className="hidden md:inline">{era.artifactName}</span>
          </div>

          <AudioController />
        </div>
      </header>

      {/* Stage Progress Pills */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap py-2">
        {stagesList.map((stg) => {
          const isDone = completedStages.includes(stg.id);
          const isCurrent = currentStage === stg.id;

          return (
            <button
              key={stg.id}
              onClick={() => {
                audioSynth.playClick();
                setCurrentStage(stg.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-amber-400 text-slate-950 shadow-lg scale-105 font-black ring-2 ring-amber-300'
                  : isDone
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800'
              }`}
            >
              <span>{stg.icon}</span>
              <span className="hidden sm:inline">{stg.label}</span>
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Active Minigame Arena */}
      <div className="relative z-10 max-w-4xl mx-auto w-full my-auto py-2">
        {currentStage === 'drums' && (
          <SyllableDrums
            words={era.syllablesWords}
            onComplete={(stars) => handleStageComplete('drums', stars)}
          />
        )}

        {currentStage === 'intruder' && (
          <IntruderWords
            challenges={era.intruderChallenges}
            onComplete={(stars) => handleStageComplete('intruder', stars)}
          />
        )}

        {currentStage === 'maze' && (
          <ChronosMaze
            challenge={era.mazeChallenge}
            eraThemeColor={era.themeColor}
            onComplete={(stars) => handleStageComplete('maze', stars)}
          />
        )}

        {currentStage === 'pyramid' && (
          <PyramidReader
            challenge={era.pyramidChallenges[0]}
            onComplete={(stars) => handleStageComplete('pyramid', stars)}
          />
        )}

        {currentStage === 'writer' && (
          <WordWriterWorkshop
            challenge={era.writingChallenge}
            onComplete={(stars) => handleStageComplete('writer', stars)}
          />
        )}

        {currentStage === 'kamishibai' && (
          <KamishibaiTheater
            story={era.kamishibaiStory}
            onComplete={(stars) => handleStageComplete('kamishibai', stars)}
          />
        )}

        {currentStage === 'escape' && (
          <EscapeRoomMission
            riddle={era.escapeRiddle}
            artifactName={era.artifactName}
            artifactIcon={era.artifactIcon}
            onComplete={(stars) => handleStageComplete('escape', stars)}
          />
        )}
      </div>

      {/* Companion Footer Drawer */}
      <div className="relative z-10 max-w-3xl mx-auto w-full pt-2">
        <CronobotCompanion
          message={`¡Estás en ${era.name}! Supera las 7 misiones ninja para conseguir la ${era.artifactName}. ¡Cowabunga!`}
          expression="happy"
        />
      </div>

      {/* Celebration Modal */}
      <StarCelebration
        isOpen={showCelebration}
        starsEarned={celebrationDetails.stars}
        title={celebrationDetails.title}
        message={celebrationDetails.message}
        artifactUnlocked={celebrationDetails.artifact}
        onContinue={() => {
          setShowCelebration(false);
          router.push('/map');
        }}
      />
    </main>
  );
}
