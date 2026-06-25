import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoConfig } from '../types';

interface VideoPlayerProps {
  currentVideo: VideoConfig | null;
  defaultVideoUrl: string;
  onVideoEnd: () => void;
}

export default function VideoPlayer({ currentVideo, defaultVideoUrl, onVideoEnd }: VideoPlayerProps) {
  const [activeUrl, setActiveUrl] = useState<string>(defaultVideoUrl);
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<'A' | 'B'>('A');

  useEffect(() => {
    const nextUrl = currentVideo ? currentVideo.url : defaultVideoUrl;
    setActiveUrl(nextUrl);
    setActiveVideo(prev => prev === 'A' ? 'B' : 'A');
  }, [currentVideo, defaultVideoUrl]);

  useEffect(() => {
    const video = activeVideo === 'A' ? videoRefA.current : videoRefB.current;
    if (video) {
      video.src = activeUrl;
      video.load();
      video.play().catch(error => {
        console.warn('Playback interrupted or failed:', error);
      });
    }
  }, [activeUrl, activeVideo]);

  const handleVideoEnd = () => {
    if (currentVideo) {
      onVideoEnd();
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video
        ref={videoRefA}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${activeVideo === 'A' ? 'opacity-100' : 'opacity-0'}`}
        onEnded={handleVideoEnd}
        loop={!currentVideo}
        muted
      />
      <video
        ref={videoRefB}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${activeVideo === 'B' ? 'opacity-100' : 'opacity-0'}`}
        onEnded={handleVideoEnd}
        loop={!currentVideo}
        muted
      />
    </div>
  );
}
