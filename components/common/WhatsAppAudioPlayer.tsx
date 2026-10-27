'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Mic } from 'lucide-react';

interface WhatsAppAudioPlayerProps {
  audioUrl: string;
  senderName?: string;
  durationLabel?: string;
  className?: string;
}

export function WhatsAppAudioPlayer({
  audioUrl,
  senderName,
  durationLabel,
  className = '',
}: WhatsAppAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn('Audio play prevented:', err);
      });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = newProgress * audio.duration;
    setProgress(newProgress * 100);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div
      className={`bg-[#E7F8EE] border border-[#BCE8CD] rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 shadow-2xs ${className}`}
      dir="ltr"
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* WhatsApp Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className="w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-all cursor-pointer"
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Progress & Waveform Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between text-[10.5px]">
          <span className="font-bold text-[#14793B] flex items-center gap-1">
            <Mic className="w-3 h-3 text-[#25D366]" />
            <span>Note Vocale WhatsApp</span>
          </span>
          <span className="text-[#0D5B2C] font-mono font-semibold">
            {isPlaying ? formatTime(currentTime) : (durationLabel || formatTime(duration) || '0:15')}
          </span>
        </div>

        {/* Clickable Progress Bar */}
        <div
          onClick={handleSeek}
          className="h-2 bg-[#CCEBD7] rounded-full overflow-hidden cursor-pointer relative"
          title="Avancer / Reculer"
        >
          <div
            className="h-full bg-[#25D366] transition-all duration-100 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
