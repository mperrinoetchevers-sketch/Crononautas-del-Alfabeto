'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, Sparkles, CheckCircle2, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Compass, ShieldAlert } from 'lucide-react';
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
    if (!challenge?.grid) return { x: 1, y: 1 };
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
  const [playerAvatar, setPlayerAvatar] = useState<string>('🧑‍🚀');
  
  // Chaser Nemesis State
  const chaserConfig = challenge?.chaser || {
    name: 'Guardián del Tiempo',
    emoji: '⏳',
    startX: 5,
    startY: 5,
    moveIntervalMs: 1400,
    warningMessage: '¡Cuidado con el Guardián que recorre el laberinto!',
  };

  const [chaserPos, setChaserPos] = useState<{ x: number; y: number }>({
    x: chaserConfig.startX,
    y: chaserConfig.startY,
  });
  const [isCaughtAlert, setIsCaughtAlert] = useState(false);
  const [catchCount, setCatchCount] = useState(0);

  // References for interval loop
  const playerPosRef = useRef(playerPos);
  playerPosRef.current = playerPos;
  const isSuccessRef = useRef(isSuccess);
  isSuccessRef.current = isSuccess;

  // Initialize maze state
  useEffect(() => {
    if (!challenge) return;
    const start = findCoordinate('S');
    setPlayerPos(start);
    setChaserPos({ x: chaserConfig.startX, y: chaserConfig.startY });
    setCollectedIds([]);
    setIsSuccess(false);
    setIsCaughtAlert(false);

    // Get active player avatar if available
    const active = storage.getActiveProfile();
    if (active) {
      const avatarMap: Record<string, string> = {
        rex: '🦖',
        scout: '🔍',
        robot: '🤖',
        knight: '🛡️',
        astronaut: '🧑‍🚀',
        wizard: '🧙‍♂️',
      };
      setPlayerAvatar(avatarMap[active.avatar] || '🧑‍🚀');
    }

    tts.speak(
      `¡Entraste a ${challenge.title}! Recolecta las letras de ${challenge.targetWord}, esquiva a ${chaserConfig.name} y llega al portal.`
    );
  }, [challenge, findCoordinate, chaserConfig]);

  // Check Manhattan distance between player and chaser
  const distanceToChaser =
    Math.abs(playerPos.x - chaserPos.x) + Math.abs(playerPos.y - chaserPos.y);
  const isChaserNear = distanceToChaser <= 2;

  // Handle catch collision
  const handleCaughtByChaser = useCallback(() => {
    audioSynth.playError();
    setIsCaughtAlert(true);
    setCatchCount((prev) => prev + 1);

    tts.speak(`¡Cuidado! ¡${chaserConfig.name} te alcanzó! Reubicando en la entrada...`);

    const start = findCoordinate('S');
    setPlayerPos(start);
    setChaserPos({ x: chaserConfig.startX, y: chaserConfig.startY });

    setTimeout(() => {
      setIsCaughtAlert(false);
    }, 2000);
  }, [chaserConfig, findCoordinate]);

  // Chaser AI Pathfinding Loop
  useEffect(() => {
    if (isSuccess || !challenge?.grid) return;

    const interval = setInterval(() => {
      if (isSuccessRef.current) return;

      setChaserPos((prevChaser) => {
        const curPlayer = playerPosRef.current;

        // Check if already on player
        if (prevChaser.x === curPlayer.x && prevChaser.y === curPlayer.y) {
          handleCaughtByChaser();
          return { x: chaserConfig.startX, y: chaserConfig.startY };
        }

        // Possible directional moves: up, down, left, right
        const directions = [
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
        ];

        const validMoves: { x: number; y: number; dist: number }[] = [];

        for (const dir of directions) {
          const nx = prevChaser.x + dir.dx;
          const ny = prevChaser.y + dir.dy;

          if (
            ny >= 0 &&
            ny < challenge.grid.length &&
            nx >= 0 &&
            nx < challenge.grid[0].length &&
            challenge.grid[ny][nx] !== '#' // not a wall
          ) {
            const dist = Math.abs(nx - curPlayer.x) + Math.abs(ny - curPlayer.y);
            validMoves.push({ x: nx, y: ny, dist });
          }
        }

        if (validMoves.length === 0) return prevChaser;

        // Sort by shortest distance to player
        validMoves.sort((a, b) => a.dist - b.dist);
        const bestMove = validMoves[0];

        // Check if new position catches player
        if (bestMove.x === curPlayer.x && bestMove.y === curPlayer.y) {
          setTimeout(() => handleCaughtByChaser(), 50);
        }

        return { x: bestMove.x, y: bestMove.y };
      });
    }, chaserConfig.moveIntervalMs || 1400);

    return () => clearInterval(interval);
  }, [challenge?.grid, chaserConfig, isSuccess, handleCaughtByChaser]);

  const allLettersCollected =
    Boolean(challenge?.collectibles) && collectedIds.length === challenge.collectibles.length;

  const tryMove = useCallback(
    (dx: number, dy: number) => {
      if (isSuccess || !challenge?.grid) return;

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

      // Check if stepped into chaser
      if (newX === chaserPos.x && newY === chaserPos.y) {
        handleCaughtByChaser();
        return;
      }

      // Check letter pickup
      const itemOnCell = challenge.collectibles?.find(
        (c) => c.x === newX && c.y === newY && !collectedIds.includes(c.id)
      );

      if (itemOnCell) {
        audioSynth.playCollect();
        const updatedCollected = [...collectedIds, itemOnCell.id];
        setCollectedIds(updatedCollected);
        tts.speak(`¡Letra ${itemOnCell.letter}!`, { rate: 1.1 });

        if (challenge.collectibles && updatedCollected.length === challenge.collectibles.length) {
          setTimeout(() => {
            tts.speak(`¡Completaste ${challenge.targetWord}! Ahora dirígete al portal.`);
          }, 800);
        }
      }

      // Check exit portal
      if (challenge.grid[newY][newX] === 'E') {
        if (
          allLettersCollected ||
          (itemOnCell && challenge.collectibles && collectedIds.length + 1 === challenge.collectibles.length)
        ) {
          setIsSuccess(true);
          audioSynth.playCelebration();
          tts.speak(
            `¡Increíble! Esquivaste a ${chaserConfig.name}, cruzaste el laberinto y descifraste ${challenge.targetWord}.`
          );
          setTimeout(() => {
            const stars = catchCount === 0 ? 3 : catchCount <= 2 ? 2 : 1;
            onComplete(stars);
          }, 2200);
        } else {
          audioSynth.playError();
          tts.speak(
            `Aún te faltan letras para completar la palabra ${challenge.targetWord}. ¡Explora los pasillos!`
          );
        }
      }
    },
    [isSuccess, playerPos, challenge, collectedIds, allLettersCollected, chaserPos, chaserConfig, catchCount, handleCaughtByChaser, onComplete]
  );

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
    if (!challenge) return;
    audioSynth.playClick();
    const remaining = (challenge.collectibles?.length || 0) - collectedIds.length;
    tts.speak(
      `Objetivo: Junta las letras para formar ${challenge.targetWord} y esquiva a ${chaserConfig.name}. Faltan ${remaining} letras.`
    );
  };

  if (!challenge) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl text-center text-amber-300 font-bold">
        Cargando laberinto...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl animate-pulse">🌀</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-1.5">
              {challenge.title}
            </h3>
            <p className="text-xs text-slate-400">Recoge las letras y esquiva al guardián</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chaser Warning Badge */}
          <div className="bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[11px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1 shadow animate-pulse">
            <span className="text-base">{chaserConfig.emoji}</span>
            <span className="hidden sm:inline">{chaserConfig.name}</span>
          </div>

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
          {challenge.collectibles?.map((item) => {
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
          {collectedIds.length} / {challenge.collectibles?.length || 0}
        </div>
      </div>

      {/* 2D Maze Grid Visualizer */}
      <div
        className={`relative bg-slate-950 border-4 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col items-center justify-center overflow-hidden select-none transition-all duration-300 ${
          isChaserNear
            ? 'border-rose-500 ring-4 ring-rose-500/30 animate-pulse'
            : 'border-slate-800'
        }`}
      >
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 max-w-[340px] sm:max-w-[400px] w-full aspect-square">
          {challenge.grid?.map((rowStr, y) =>
            rowStr.split('').map((cellChar, x) => {
              const isWall = cellChar === '#';
              const isPlayer = playerPos.x === x && playerPos.y === y;
              const isChaser = chaserPos.x === x && chaserPos.y === y;
              const isExit = cellChar === 'E';
              const isStart = cellChar === 'S';
              const itemOnCell = challenge.collectibles?.find(
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
                  {isStart && !isPlayer && !isChaser && (
                    <span className="text-[10px] sm:text-xs font-black text-emerald-400 opacity-60">
                      INICIO
                    </span>
                  )}

                  {/* Exit Portal */}
                  {isExit && !isChaser && (
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
                  {itemOnCell && !isPlayer && !isChaser && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg font-black animate-bounce">
                      {itemOnCell.letter}
                    </div>
                  )}

                  {/* Chaser Enemy Nemesis */}
                  {isChaser && !isPlayer && (
                    <div className="relative z-10 text-2xl sm:text-3xl animate-bounce transform scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">
                      {chaserConfig.emoji}
                    </div>
                  )}

                  {/* Player Avatar */}
                  {isPlayer && (
                    <div className="relative z-20 text-2xl sm:text-3xl animate-pulse transform scale-110 drop-shadow-md">
                      {playerAvatar}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Caught Alert Toast */}
        {isCaughtAlert && (
          <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4 text-center z-30 animate-fade-in">
            <ShieldAlert className="w-12 h-12 text-rose-400 animate-bounce" />
            <h4 className="text-lg font-black text-rose-300">¡{chaserConfig.name} te alcanzó!</h4>
            <p className="text-xs text-slate-200">
              Cronobot te reubicó en la entrada. <strong>¡Tus letras siguen a salvo!</strong>
            </p>
          </div>
        )}

        {/* Victory Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 animate-fade-in p-4 text-center z-30">
            <Sparkles className="w-12 h-12 text-amber-400 animate-spin" />
            <h4 className="text-xl font-black text-amber-300">¡Laberinto Superado!</h4>
            <p className="text-xs text-slate-200">
              Esquivaste a {chaserConfig.name}, descubriste la palabra clave{' '}
              <strong className="text-amber-400">{challenge.targetWord}</strong> y cruzaste el portal.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />{' '}
              {catchCount === 0 ? '¡Sin ser atrapado! 🏆' : '¡Misión Cumplida! 🌟'}
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
            disabled={isSuccess || isCaughtAlert}
            className="w-14 h-12 bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-slate-200 border border-slate-700 rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
          >
            <ArrowUp className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => tryMove(-1, 0)}
              disabled={isSuccess || isCaughtAlert}
              className="w-14 h-12 bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-slate-200 border border-slate-700 rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => tryMove(0, 1)}
              disabled={isSuccess || isCaughtAlert}
              className="w-14 h-12 bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-slate-200 border border-slate-700 rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
            >
              <ArrowDown className="w-6 h-6" />
            </button>

            <button
              onClick={() => tryMove(1, 0)}
              disabled={isSuccess || isCaughtAlert}
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
