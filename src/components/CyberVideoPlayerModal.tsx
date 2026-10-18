import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  Share2,
  Download,
  Bookmark,
  X,
  Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem } from '../data/mediaCatalog';
import { CyberThumbnail } from './CyberThumbnail';

interface CyberVideoPlayerModalProps {
  item: MediaItem | null;
  playlist?: MediaItem[];
  initialFullscreen?: boolean;
  onClose: () => void;
  onSelectItem?: (nextItem: MediaItem) => void;
  onShare: (item: MediaItem) => void;
  onDownload: (item: MediaItem) => void;
  onToggleBookmark: (item: MediaItem) => void;
  onToggleLike?: (item: MediaItem) => void;
}

export const CyberVideoPlayerModal: React.FC<CyberVideoPlayerModalProps> = ({
  item,
  playlist = [],
  onClose,
  onSelectItem,
  onShare,
  onDownload,
  onToggleBookmark,
  onToggleLike,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(14);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });

  // Vertical Swipe State (Pastdan tepaga surish -> keyingi video, Tepadan pastga -> oldingi video)
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const pointerStartRef = useRef<{ y: number; x: number; time: number; active: boolean }>({
    y: 0,
    x: 0,
    time: 0,
    active: false,
  });
  const didSwipeRef = useRef(false);
  const lastWheelTimeRef = useRef(0);

  const effectivePlaylist = playlist.length > 0 ? playlist : item ? [item] : [];
  const currentIndex = item
    ? Math.max(
        0,
        effectivePlaylist.findIndex((m) => m.id === item.id)
      )
    : 0;

  // Determine video's intrinsic aspect ratio:
  // Vertical 9:16 for Shorts, Reels, and TikTok; Horizontal 16:9 for YouTube, Twitch, Hub VODs & Live streams
  const isVerticalMedia =
    item?.type === 'short' ||
    item?.type === 'reel' ||
    item?.platform === 'tiktok';

  const targetAspectRatio = isVerticalMedia ? 9 / 16 : 16 / 9;

  // Compute exact unstretched video frame dimensions (fits inside Phone, Tablet, and Notebook without distortion)
  const computeFittedVideoDimensions = () => {
    const availW = Math.max(240, viewportSize.width);
    const availH = Math.max(240, viewportSize.height);
    const containerRatio = availW / availH;

    if (containerRatio > targetAspectRatio) {
      // Viewport is wider than video (e.g. 9:16 video on Tablet/Notebook, or 16:9 video on wide screen)
      const h = availH;
      const w = Math.round(h * targetAspectRatio);
      return { width: w, height: h };
    } else {
      // Viewport is taller than video (e.g. 16:9 video on Phone portrait or Tablet portrait)
      const w = availW;
      const h = Math.round(w / targetAspectRatio);
      return { width: w, height: h };
    }
  };

  const fittedVideoSize = computeFittedVideoDimensions();

  const goToNextVideo = useCallback(() => {
    if (!item || effectivePlaylist.length <= 1 || !onSelectItem) return;
    setSlideDirection(1);
    const nextIdx = (currentIndex + 1) % effectivePlaylist.length;
    onSelectItem(effectivePlaylist[nextIdx]);
  }, [item, effectivePlaylist, currentIndex, onSelectItem]);

  const goToPrevVideo = useCallback(() => {
    if (!item || effectivePlaylist.length <= 1 || !onSelectItem) return;
    setSlideDirection(-1);
    const prevIdx = (currentIndex - 1 + effectivePlaylist.length) % effectivePlaylist.length;
    onSelectItem(effectivePlaylist[prevIdx]);
  }, [item, effectivePlaylist, currentIndex, onSelectItem]);

  useEffect(() => {
    setIsPlaying(true);
    setProgress(8);
    setDragOffsetY(0);
  }, [item?.id]);

  // Automatically measure Phone, Tablet, or Notebook viewport dimensions in real time
  useEffect(() => {
    if (!item) return;
    const updateSize = () => {
      if (viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setViewportSize({
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      }
    };

    updateSize();
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateSize) : null;
    if (observer && viewportRef.current) {
      observer.observe(viewportRef.current);
    }
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  }, [item]);

  // Keyboard navigation
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToNextVideo();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevVideo();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, goToNextVideo, goToPrevVideo, onClose]);

  // Clean Ambient Visual Motion Layer matching the exact unstretched video frame size
  useEffect(() => {
    if (!item || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const paletteMap: Record<string, { grid: string; glow: string }> = {
      cyberpunk_city: { grid: 'rgba(191, 0, 255, 0.22)', glow: 'rgba(0, 240, 255, 0.18)' },
      valorant_arena: { grid: 'rgba(255, 0, 85, 0.22)', glow: 'rgba(0, 240, 255, 0.16)' },
      cs2_sniper: { grid: 'rgba(0, 240, 255, 0.22)', glow: 'rgba(57, 255, 20, 0.16)' },
      gaming_rig: { grid: 'rgba(224, 102, 255, 0.22)', glow: 'rgba(0, 240, 255, 0.18)' },
      neon_samurai: { grid: 'rgba(255, 0, 128, 0.22)', glow: 'rgba(57, 255, 20, 0.16)' },
      audio_synth: { grid: 'rgba(57, 255, 20, 0.22)', glow: 'rgba(0, 240, 255, 0.18)' },
    };

    const colors = paletteMap[item.artVariant] || paletteMap.cyberpunk_city;

    let animId: number;
    let frame = 0;

    const render = () => {
      if (isPlaying) {
        frame += 1;
      }
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1.2;
      const horizonY = h * 0.58;
      const offset = (frame * 2.2) % 36;

      for (let y = horizonY + offset; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const pulseY = h * 0.45 + Math.sin(frame * 0.04) * 18;
      const radGrad = ctx.createRadialGradient(
        w / 2,
        pulseY,
        10,
        w / 2,
        pulseY,
        Math.max(w, h) * 0.45
      );
      radGrad.addColorStop(0, colors.glow);
      radGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [item, isPlaying, fittedVideoSize.width, fittedVideoSize.height]);

  // Advance progress bar while playing
  useEffect(() => {
    if (!item || !isPlaying) return;
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : +(prev + 0.4).toFixed(1)));
    }, 300);
    return () => clearInterval(timer);
  }, [item, isPlaying]);

  if (!item) return null;

  // Touch & Mouse Vertical Swipe Handlers (Pastdan tepaga surish = Keyingi video)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    pointerStartRef.current = {
      y: e.touches[0].clientY,
      x: e.touches[0].clientX,
      time: Date.now(),
      active: true,
    };
    didSwipeRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pointerStartRef.current.active || e.touches.length !== 1) return;
    const dy = e.touches[0].clientY - pointerStartRef.current.y;
    const dx = e.touches[0].clientX - pointerStartRef.current.x;

    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
      didSwipeRef.current = true;
      const damped = Math.max(-160, Math.min(160, dy * 0.65));
      setDragOffsetY(damped);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!pointerStartRef.current.active) return;
    pointerStartRef.current.active = false;

    const endY = e.changedTouches[0]?.clientY ?? pointerStartRef.current.y;
    const endX = e.changedTouches[0]?.clientX ?? pointerStartRef.current.x;
    const dy = endY - pointerStartRef.current.y;
    const dx = endX - pointerStartRef.current.x;
    const elapsed = Math.max(1, Date.now() - pointerStartRef.current.time);
    const velocityY = Math.abs(dy) / elapsed;

    setDragOffsetY(0);

    if (
      Math.abs(dy) > Math.abs(dx) &&
      (Math.abs(dy) > 40 || (Math.abs(dy) > 20 && velocityY > 0.32))
    ) {
      didSwipeRef.current = true;
      if (dy < 0) {
        goToNextVideo();
      } else {
        goToPrevVideo();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    pointerStartRef.current = {
      y: e.clientY,
      x: e.clientX,
      time: Date.now(),
      active: true,
    };
    didSwipeRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!pointerStartRef.current.active) return;
    const dy = e.clientY - pointerStartRef.current.y;
    const dx = e.clientX - pointerStartRef.current.x;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) {
      didSwipeRef.current = true;
      const damped = Math.max(-160, Math.min(160, dy * 0.65));
      setDragOffsetY(damped);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!pointerStartRef.current.active) return;
    pointerStartRef.current.active = false;
    const dy = e.clientY - pointerStartRef.current.y;
    const dx = e.clientX - pointerStartRef.current.x;
    setDragOffsetY(0);

    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 45) {
      didSwipeRef.current = true;
      if (dy < 0) {
        goToNextVideo();
      } else {
        goToPrevVideo();
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 480) return;
    if (Math.abs(e.deltaY) > 28) {
      lastWheelTimeRef.current = now;
      if (e.deltaY > 0) {
        goToNextVideo();
      } else {
        goToPrevVideo();
      }
    }
  };

  const handleViewportClick = () => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }
    setIsPlaying((prev) => !prev);
  };

  const handleTrueFullscreen = () => {
    if (containerRef.current && document.fullscreenElement !== containerRef.current) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 md:p-4 lg:p-6 select-none"
      role="dialog"
      aria-modal="true"
    >
      {/* Adaptive Outer Shell for Phone, Tablet, and Notebook:
          - Phone (<768px): Full screen 100dvh, video centered inside at its true aspect ratio
          - Tablet (768px-1023px) & Notebook (>=1024px): Sized proportionally to the video type (9:16 vs 16:9) */}
      <div
        ref={containerRef}
        className={`relative bg-[#05000A] md:border md:border-[#3A007A] flex flex-col overflow-hidden w-full h-[100dvh] ${
          isVerticalMedia
            ? 'md:max-w-[440px] lg:max-w-[480px] md:h-[92dvh] md:rounded-2xl'
            : 'md:max-w-3xl lg:max-w-5xl xl:max-w-6xl md:h-[84dvh] lg:h-[88dvh] md:rounded-2xl'
        }`}
      >
        {/* Clean Minimal Top Overlay Bar */}
        <div
          className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-[#BF00FF] text-white font-mono-code text-[11px] font-bold uppercase shrink-0">
              {item.platform.toUpperCase()}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-[#00F0FF] font-mono-code text-[10px] font-bold shrink-0">
              {isVerticalMedia ? '9:16' : '16:9'}
            </span>
            <span className="text-xs font-mono-code text-white/80 truncate">
              {item.author}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTrueFullscreen}
              className="p-2 rounded-full bg-black/55 hover:bg-black/80 text-white/90 border border-white/15 cursor-pointer transition-colors"
              title="To'liq ekran"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 hover:bg-[#FF0055] text-white border border-white/15 cursor-pointer transition-colors"
              aria-label="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Swipeable Video Stage — centers the video at its exact native aspect ratio without stretching */}
        <div
          ref={viewportRef}
          className="relative flex-1 min-h-0 w-full h-full bg-[#05000A] flex items-center justify-center cursor-pointer overflow-hidden touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            pointerStartRef.current.active = false;
            setDragOffsetY(0);
          }}
          onWheel={handleWheel}
          onClick={handleViewportClick}
        >
          <AnimatePresence mode="popLayout" custom={slideDirection}>
            <motion.div
              key={item.id}
              custom={slideDirection}
              initial={{
                y: slideDirection > 0 ? '100%' : '-100%',
                opacity: 0.4,
              }}
              animate={{
                y: dragOffsetY,
                opacity: 1,
              }}
              exit={{
                y: slideDirection > 0 ? '-100%' : '100%',
                opacity: 0.2,
              }}
              transition={{
                type: 'spring',
                stiffness: 340,
                damping: 32,
                mass: 0.85,
              }}
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
            >
              {/* Proportional Video Box:
                  Never stretches on Phone, Tablet, or Notebook — always matches the video's native 16:9 or 9:16 ratio */}
              <div
                style={{
                  width: `${fittedVideoSize.width}px`,
                  height: `${fittedVideoSize.height}px`,
                }}
                className="relative flex items-center justify-center overflow-hidden bg-[#090014] shadow-2xl border border-white/10"
              >
                <div className="absolute inset-0 pointer-events-none">
                  <CyberThumbnail
                    variant={item.artVariant}
                    aspectRatio={isVerticalMedia ? '9:16' : '16:9'}
                    className="w-full h-full"
                  />
                </div>

                <canvas
                  ref={canvasRef}
                  width={fittedVideoSize.width}
                  height={fittedVideoSize.height}
                  className="w-full h-full block mix-blend-screen pointer-events-none"
                />
              </div>

              {/* Clean Bottom-Left Video Title & Info */}
              <div className="absolute inset-x-0 bottom-0 pt-16 pb-6 px-4 pr-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-[#00F0FF]">{item.author}</span>
                  <span className="text-[11px] text-white/60">•</span>
                  <span className="text-[11px] font-mono-code text-[#39FF14]">{item.views}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Neat Right-Side Action Rail (Like, Save, Share, Download, Sound) */}
          <div
            className="absolute right-3 bottom-10 z-20 flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {onToggleLike && (
              <button
                type="button"
                onClick={() => onToggleLike(item)}
                className={`w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
                  item.liked
                    ? 'bg-[#FF0055]/25 border-[#FF0055] text-[#FF0055]'
                    : 'bg-black/55 border-white/15 text-white hover:border-white/40'
                }`}
                title="Yoqtirish"
              >
                <Heart className={`w-5 h-5 ${item.liked ? 'fill-[#FF0055]' : ''}`} />
              </button>
            )}

            <button
              type="button"
              onClick={() => onToggleBookmark(item)}
              className={`w-10 h-10 rounded-full flex items-center justify-center border backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
                item.saved
                  ? 'bg-[#39FF14]/25 border-[#39FF14] text-[#39FF14]'
                  : 'bg-black/55 border-white/15 text-white hover:border-white/40'
              }`}
              title="Saqlash"
            >
              <Bookmark className={`w-5 h-5 ${item.saved ? 'fill-[#39FF14]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => onShare(item)}
              className="w-10 h-10 rounded-full bg-black/55 border border-white/15 hover:border-white/40 text-white flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer"
              title="Ulashish"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => onDownload(item)}
              className="w-10 h-10 rounded-full bg-black/55 border border-white/15 hover:border-white/40 text-white flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer"
              title="Yuklab olish"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className="w-10 h-10 rounded-full bg-black/55 border border-white/15 hover:border-white/40 text-[#00F0FF] flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer"
              title={isMuted ? 'Ovozni yoqish' : "Ovozni o'chirish"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Center Play Indicator (only visible when paused) */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-[#BF00FF]/90 border-2 border-white flex items-center justify-center shadow-lg">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Sleek Minimal Bottom Progress Scrubber */}
        <div
          className="bg-[#090014] px-3 py-2 flex items-center gap-3 z-30 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={progress}
            onChange={(e) => setProgress(parseFloat(e.target.value))}
            className="w-full accent-[#BF00FF] h-1 bg-white/20 rounded-lg cursor-pointer"
          />
          <span className="font-mono-code text-[11px] text-white/75 shrink-0">
            {item.duration}
          </span>
        </div>
      </div>
    </div>
  );
};
