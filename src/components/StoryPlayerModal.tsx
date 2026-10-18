import React, { useEffect, useRef, useState } from 'react';
import { X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StoryHighlight } from '../data/mediaCatalog';
import { CyberThumbnail } from './CyberThumbnail';

interface StoryPlayerModalProps {
  stories: StoryHighlight[];
  activeIndex: number | null;
  onClose: () => void;
  onSelectIndex: (idx: number) => void;
}

export const StoryPlayerModal: React.FC<StoryPlayerModalProps> = ({
  stories,
  activeIndex,
  onClose,
  onSelectIndex,
}) => {
  const [progress, setProgress] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const touchStartRef = useRef<{ y: number; x: number; active: boolean }>({
    y: 0,
    x: 0,
    active: false,
  });

  useEffect(() => {
    setProgress(0);
    setDragOffsetY(0);
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeIndex < stories.length - 1) {
            setSlideDirection(1);
            onSelectIndex(activeIndex + 1);
          } else {
            onClose();
          }
          return 0;
        }
        return prev + 2.5;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [activeIndex, stories.length, onSelectIndex, onClose]);

  if (activeIndex === null || !stories[activeIndex]) return null;
  const story = stories[activeIndex];

  const goNext = () => {
    setSlideDirection(1);
    const nextIdx = (activeIndex + 1) % stories.length;
    onSelectIndex(nextIdx);
  };

  const goPrev = () => {
    setSlideDirection(-1);
    const prevIdx = (activeIndex - 1 + stories.length) % stories.length;
    onSelectIndex(prevIdx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      y: e.touches[0].clientY,
      x: e.touches[0].clientX,
      active: true,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current.active || e.touches.length !== 1) return;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    setDragOffsetY(Math.max(-140, Math.min(140, dy * 0.65)));
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current.active) return;
    touchStartRef.current.active = false;
    const endY = e.changedTouches[0]?.clientY ?? touchStartRef.current.y;
    const dy = endY - touchStartRef.current.y;
    setDragOffsetY(0);

    if (dy < -40) {
      goNext();
    } else if (dy > 40) {
      goPrev();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartRef.current = {
      y: e.clientY,
      x: e.clientX,
      active: true,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!touchStartRef.current.active) return;
    const dy = e.clientY - touchStartRef.current.y;
    setDragOffsetY(Math.max(-140, Math.min(140, dy * 0.65)));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!touchStartRef.current.active) return;
    touchStartRef.current.active = false;
    const dy = e.clientY - touchStartRef.current.y;
    setDragOffsetY(0);

    if (dy < -40) {
      goNext();
    } else if (dy > 40) {
      goPrev();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full h-[100dvh] sm:h-[90dvh] sm:w-auto sm:aspect-[9/16] max-w-[440px] bg-[#05000A] sm:border sm:border-[#3A007A] sm:rounded-2xl overflow-hidden flex flex-col">
        {/* Top Overlay: Segmented Progress + Minimal Header */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent space-y-2.5">
          <div className="flex gap-1.5">
            {stories.map((s, idx) => (
              <div key={s.id} className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00F0FF] transition-all duration-100"
                  style={{
                    width:
                      idx < activeIndex ? '100%' : idx === activeIndex ? `${progress}%` : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white uppercase">
                {story.label}
              </span>
              <span className="font-mono-code text-[11px] text-white/70">{story.date}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/50 hover:bg-[#FF0055] text-white border border-white/15 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Full-screen Vertical Swipeable Stage */}
        <div
          className="relative flex-1 min-h-0 w-full h-full flex items-center justify-center overflow-hidden touch-none cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            touchStartRef.current.active = false;
            setDragOffsetY(0);
          }}
        >
          <AnimatePresence mode="popLayout" custom={slideDirection}>
            <motion.div
              key={story.id}
              custom={slideDirection}
              initial={{
                y: slideDirection > 0 ? '100%' : '-100%',
                opacity: 0.3,
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
                stiffness: 330,
                damping: 30,
              }}
              className="w-full h-full flex items-center justify-center relative"
            >
              <div className="relative h-full max-w-full aspect-[9/16] overflow-hidden">
                <CyberThumbnail
                  variant={story.artVariant}
                  aspectRatio="9:16"
                  className="w-full h-full"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <p className="text-sm font-bold text-white leading-snug">{story.subtitle}</p>
                <div className="mt-1.5 flex items-center gap-1.5 font-mono-code text-xs text-[#39FF14]">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{story.views}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
