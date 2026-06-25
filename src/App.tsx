/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CharacterConfig, AppConfig, VideoConfig } from './types';
import CharacterSelector from './components/CharacterSelector';
import VideoPlayer from './components/VideoPlayer';

export default function App() {
  const [data, setData] = useState<AppConfig | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterConfig | null>(null);
  const [currentVideo, setCurrentVideo] = useState<VideoConfig | null>(null);
  const [recognizedKeyword, setRecognizedKeyword] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!currentVideo) {
        window.location.reload();
      }
    }, 20 * 60 * 1000); // 20 minutes

    return () => clearInterval(timer);
  }, [currentVideo]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    }
  };

  useEffect(() => {
    fetch('/data.json')
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  useEffect(() => {
    if (!selectedCharacter) return;

    const scheduleTeaser = () => {
      const delay = Math.floor(Math.random() * (5 - 1 + 1) + 1) * 60 * 1000;
      return setTimeout(() => {
        const teasers = selectedCharacter.teaserVideoUrls;
        if (teasers && teasers.length > 0) {
          const randomTeaser = teasers[Math.floor(Math.random() * teasers.length)];
          setCurrentVideo({ id: 'teaser', url: randomTeaser, keywords: [] });
        }
        scheduleTeaser();
      }, delay);
    };

    const timer = scheduleTeaser();
    return () => clearTimeout(timer);
  }, [selectedCharacter]);

  useEffect(() => {
    if (!selectedCharacter) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'de-DE';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      
      for (const video of selectedCharacter.videos) {
        if (video.keywords.some(keyword => transcript.includes(keyword))) {
          setCurrentVideo(video);
          setRecognizedKeyword(video.keywords[0]);
          break;
        }
      }
    };

    recognition.start();

    return () => recognition.stop();
  }, [selectedCharacter]);

  if (!data) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="bg-white h-screen w-full flex flex-col p-4 sm:p-10 font-sans text-slate-900 antialiased overflow-hidden">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-12 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">VideoLink <span className="text-blue-600">AI</span></h1>
          <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">Sprachgesteuerte Video-Interaktion</p>
        </div>
        <div className="flex items-center gap-6">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-bold shadow-lg hover:bg-blue-700 transition-colors"
            >
              Install App
            </button>
          )}
          {selectedCharacter && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600">Speech Ready</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex-grow overflow-y-auto">
        {!selectedCharacter ? (
          <CharacterSelector characters={data.characters} onSelect={setSelectedCharacter} />
        ) : (
          <div className="fixed inset-0 z-50 w-screen h-screen bg-black">
            <button
              onClick={() => { setSelectedCharacter(null); setCurrentVideo(null); setRecognizedKeyword(null); }}
              className="absolute top-4 left-4 z-50 p-2 bg-white/50 backdrop-blur rounded-full shadow hover:bg-white transition-colors"
            >
              Back
            </button>
            <VideoPlayer 
                currentVideo={currentVideo} 
                defaultVideoUrl={selectedCharacter.defaultVideoUrl}
                onVideoEnd={() => { setCurrentVideo(null); setRecognizedKeyword(null); }}
            />
          </div>
        )}
      </div>

      {selectedCharacter && (
        <div className="mt-4 sm:mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-slate-50 border border-slate-100 rounded-[32px] p-4 sm:p-6">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200">
              <span className="font-semibold text-slate-700 tracking-tight text-sm">Höre zu...</span>
            </div>
          </div>
          <div className="flex-grow flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Zuletzt erkannt</span>
              <div className="h-[1px] flex-grow bg-slate-200"></div>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ${recognizedKeyword ? "bg-blue-100 text-blue-700 ring-blue-200" : "bg-slate-200 text-slate-600"}`}>
                  {recognizedKeyword || "Warte auf Input..."}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
