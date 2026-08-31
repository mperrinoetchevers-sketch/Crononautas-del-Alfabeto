'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Sparkles, CheckCircle2, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { MazeChallenge } from '@/lib/game-data';
import { audioSynth } from '@/lib/audio-synth';
import { tts } from '@/lib/tts';
import { storage } from '@/lib/storage';

interface ChronosMazeProps {
  challenge: MazeChallenge;
  eraThemeColor?: string;
  onComplete: (stars: number) => void;
}

export default function ChronosMaze({ challenge, onComplete }: ChronosMazeProps) {
  // Find start position 'S' and exit position 'E'
  const findCoordinate = useCallback((char: string): { x: number; y: number } => {
    for (let y = 0; y < challenge.grid.length; y++) {
      const row = challenge.grid[y];
      for (let x = 0; x < row.length; x++) {
        if (row[x] === char) return { x, y };
      }
    }
    return { x: 1, y: 1 };
  }, [challenge]);

  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 1, y: 1 });
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [playerAvatar, setPlayerAvatar] = useState<string>('🤖');

  // Initialize maze state
  useEffect(() => {
    const start = findCoordinate('S');
    setPlayerPos(start);
    setCollectedIds([]);
    setIsSuccess(false);

    // Get active player avatar if available
    const active = storage.getActiveProfile();
    if (active) {
      const avatarMap: Record<string, string> = {
        rex: '🦖',
        scout: '🧭',
        robot: '🤖',
        knight: '🛡️',
        astronaut: '🚀',
        wizard: '🧙‍♂️',
      };
      setPlayerAvatar(avatarMap[active.avatar] || '🤖');
    }

    tts.speak(
      `¡Entraste a ${challenge.title}! Recolecta las letras de la palabra ${challenge.targetWord} y llega al portal de salida.`
    );
  }, [challenge, findCoordinate]);

  const allLettersCollected = collectedIds.length === challenge.collectibles.length;

  const tryMove = useCallback((dx: number, dy: number) => {
    if (isSuccess) return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    // Check bounds
    if (
      newY < 0 ||
      newY >= challenge.grid.length ||
      newX < 0 ||
      newX >= challenge.grid[0].length
    ) {
      return;
    }

    // Check wall collision
    if (challenge.grid[newY][newX] === '#') {
      audioSynth.playError();
      return;
    }

    // Move player
    audioSynth.playStep();
    setPlayerPos({ x: newX, y: newY });

    // Check letter pickup
    const itemOnCell = challenge.collectibles.find(
      (c) => c.x === newX && c.y === newY && !collectedIds.includes(c.id)
    );

    if (itemOnCell) {
      audioSynth.playCollect();
      const updatedCollected = [...collectedIds, itemOnCell.id];
      setCollectedIds(updatedCollected);
      tts.speak(`¡Letra ${itemOnCell.letter}!`, { rate: 1.1 });

      if (updatedCollected.length === challenge.collectibles.length) {
        setTimeout(() => {
          tts.speak(`¡Completaste la palabra ${challenge.targetWord}! Ahora dirígete a la salida del portal.`);
        }, 800);
      }
    }

    // Check exit portal
    if (challenge.grid[newY][newX] === 'E') {
      if (allLettersCollected || (itemOnCell && collectedIds.length + 1 === challenge.collectibles.length)) {
        setIsSuccess(true);
        audioSynth.playCelebration();
        tts.speak(`¡Increíble! Cruzaste el laberinto y descifraste ${challenge.targetWord}.`);
        setTimeout(() => {
          onComplete(3);
        }, 2200);
      } else {
        audioSynth.playError();
        tts.speak(`Aún te faltan letras para completar la palabra ${challenge.targetWord}. ¡Explora los pasillos!`);
      }
    }
  }, [isSuccess, playerPos, challenge, collectedIds, allLettersCollected, onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        tryMove(0, -1);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        tryMove(0, 1);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        tryMove(-1, 0);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        tryMove(1, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tryMove]);

  const handleCellClick = (x: number, y: number) => {
    const dx = x - playerPos.x;
    const dy = y - playerPos.y;
    // Only allow clicking directly adjacent cells
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      tryMove(dx, dy);
    }
  };

  const handleResetPos = () => {
    audioSynth.playClick();
    const start = findCoordinate('S');
    setPlayerPos(start);
  };

  const handleHearMission = () => {
    audioSynth.playClick();
    tts.speak(
      `Objetivo del laberinto: Junta las letras para formar ${challenge.targetWord}. Faltan ${challenge.collectibles.length - collectedIds.length} letras.`
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl animate-pulse">🌀</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-300">
              {challenge.title}
            </h3>
            <p className="text-xs text-slate-400">Recoge las letras y llega al portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleHearMission}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            <Volume2 className="w-4 h-4" /> Misión
          </button>
          <button
            onClick={handleResetPos}
            title="Reiniciar Posición"
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold p-1.5 rounded-xl border border-slate-700 shadow"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Word Collector Bar */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{challenge.wordPictogram}</span>
          <span className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">
            Palabra Clave:
          </span>
        </div>

        {/* Letter Chips */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {challenge.collectibles.map((item) => {
            const isFound = collectedIds.includes(item.id);
            return (
              <span
                key={item.id}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm sm:text-base border-2 transition-all transform ${
                  isFound
                    ? 'bg-gradient-to-t from-amber-500 to-yellow-300 border-amber-200 text-slate-950 scale-105 shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-600 border-dashed'
                }`}
              >
                {isFound ? item.letter : '?'}
              </span>
            );
          })}
        </div>

        <div className="text-xs font-black text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-xl">
          {collectedIds.length} / {challenge.collectibles.length}
        </div>
      </div>

      {/* 2D Maze Grid Visualizer */}
      <div className="relative bg-slate-950 border-4 border-slate-800 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col items-center justify-center overflow-hidden select-none">
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 max-w-[340px] sm:max-w-[400px] w-full aspect-square">
          {challenge.grid.map((rowStr, y) =>
            rowStr.split('').map((cellChar, x) => {
              const isWall = cellChar === '#';
              const isPlayer = playerPos.x === x && playerPos.y === y;
              const isExit = cellChar === 'E';
              const isStart = cellChar === 'S';
              const itemOnCell = challenge.collectibles.find(
                (c) => c.x === x && c.y === y && !collectedIds.includes(c.id)
              );

              return (
                <div
                  key={`${x}-${y}`}
                  onClick={() => handleCellClick(x, y)}
                  className={`relative rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-base transition-all cursor-pointer ${
                    isWall
                      ? 'bg-slate-800/90 border-2 border-slate-700 shadow-inner'
                      : 'bg-slate-900/60 border border-slate-800/50 hover:bg-slate-800/50'
                  }`}
                >
                  {/* Start Point Marker */}
                  {isStart && !isPlayer && (
                    <span className="text-[10px] sm:text-xs font-black text-emerald-400 opacity-60">
                      INICIO
                    </span>
                  )}

                  {/* Exit Portal */}
                  {isExit && (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xl sm:text-2xl animate-spin">🌀</span>
                      {allLettersCollected && (
                        <span className="absolute -top-1 text-[9px] bg-amber-400 text-slate-950 font-black px-1 rounded shadow">
                          ¡ABIERTO!
                        </span>
                      )}
                    </div>
                  )}

                  {/* Collectible Letter */}
                  {itemOnCell && !isPlayer && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg font-black animate-bounce">
                      {itemOnCell.letter}
                    </div>
                  )}

                  {/* Player Avatar */}
                  {isPlayer && (
                    <div className="relative z-10 text-2xl sm:text-3xl animate-pulse transform scale-110 drop-shadow-md">
                      {playerAvatar}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Victory Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 animate-fade-in p-4 text-center z-20">
            <Sparkles className="w-12 h-12 text-amber-400 animate-spin" />
            <h4 className="text-xl font-black text-amber-300">¡Laberinto Superado!</h4>
            <p className="text-xs text-slate-200">
              Descubriste la palabra clave <strong className="text-amber-400">{challenge.targetWord}</strong> y cruzaste el portal.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" /> 3 Estrellas Obtenidas
            </div>
          </div>
        )}
      </div>

      {/* On-Screen D-PAD Controller for Touch & Accessibility */}
      <div className="space-y-2">
        <p className="text-center text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-amber-400" /> Usa las flechas o el teclado (WASD / Flechas) para moverte:
        </p>

        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => tryMove(0, -1)}
            disabled={isSuccess}
            className="w-14 h-12 bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-slate-200 border border-slate-700 rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
          >
            <ArrowUp className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => tryMove(-1, 0)}
              disabled={isSuccess}
              className="w-14 h-12 bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-slate-200 border border-slate-700 rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => tryMove(0, 1)}
              disabled={isSuccess}
              className="w-14 h-12 bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-slate-200 border border-slate-700 rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
            >
              <ArrowDown className="w-6 h-6" />
            </button>

            <button
              onClick={() => tryMove(1, 0)}
              disabled={isSuccess}
              className="w-14 h-12 bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-slate-200 border border-slate-700 rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
