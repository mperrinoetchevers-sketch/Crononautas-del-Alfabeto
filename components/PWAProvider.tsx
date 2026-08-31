'use client';

import React, { useEffect, useState } from 'react';
import { Download, Sparkles, X } from 'lucide-react';
import { audioSynth } from '@/lib/audio-synth';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });
    }

    // 2. Check if already running in standalone mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }

    // 3. Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    audioSynth.playClick();
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {children}

      {/* Floating PWA Install Banner */}
      {showInstallBanner && !isInstalled && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-bounce-slow bg-slate-900/95 border-2 border-amber-400 p-4 rounded-3xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📲</span>
            <div>
              <h4 className="text-xs font-black text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> ¡Instalar Crononautas!
              </h4>
              <p className="text-[11px] text-slate-300">
                Juega a pantalla completa y sin internet en tu dispositivo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleInstallClick}
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow active:scale-95 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Instalar
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
