import React from 'react';
import { MediaItem } from '../data/mediaCatalog';

interface CyberThumbnailProps {
  variant: MediaItem['artVariant'];
  className?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export const CyberThumbnail: React.FC<CyberThumbnailProps> = ({
  variant,
  className = '',
  aspectRatio = '16:9',
}) => {
  // All artwork is authored around center (320, 180) in 640x360 space.
  // Using centered viewBoxes for 9:16 and 1:1 preserves 1:1 pixel aspect ratio without stretching.
  const viewBox =
    aspectRatio === '9:16'
      ? '190 0 260 360'
      : aspectRatio === '1:1'
      ? '140 0 360 360'
      : '0 0 640 360';

  return (
    <div className={`relative overflow-hidden bg-[#120024] select-none ${className}`}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full block"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`bg_${variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#090014" />
            <stop offset="50%" stopColor="#1E0538" />
            <stop offset="100%" stopColor="#081C2E" />
          </linearGradient>
          <linearGradient id="neonPurpleCyan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#BF00FF" />
            <stop offset="100%" stopColor="#00F0FF" />
          </linearGradient>
          <linearGradient id="neonRedPurple" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF0055" />
            <stop offset="100%" stopColor="#BF00FF" />
          </linearGradient>
          <radialGradient id="glowCyan" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glowPurple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#BF00FF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#BF00FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base backdrop */}
        <rect width="100%" height="100%" fill={`url(#bg_${variant})`} />

        {/* Perspective Cyber Grid Floor */}
        <g stroke="#BF00FF" strokeOpacity="0.22" strokeWidth="1">
          <line x1="0" y1="260" x2="640" y2="260" />
          <line x1="0" y1="285" x2="640" y2="285" />
          <line x1="0" y1="315" x2="640" y2="315" />
          <line x1="0" y1="350" x2="640" y2="350" />
          <line x1="320" y1="200" x2="40" y2="360" />
          <line x1="320" y1="200" x2="180" y2="360" />
          <line x1="320" y1="200" x2="320" y2="360" />
          <line x1="320" y1="200" x2="460" y2="360" />
          <line x1="320" y1="200" x2="600" y2="360" />
        </g>

        {variant === 'cyberpunk_city' && (
          <g>
            <circle cx="480" cy="110" r="90" fill="url(#glowPurple)" />
            <circle cx="180" cy="160" r="110" fill="url(#glowCyan)" />
            {/* Skyscrapers */}
            <rect x="60" y="70" width="75" height="220" fill="#130426" stroke="#00F0FF" strokeWidth="1.5" />
            <rect x="150" y="40" width="95" height="250" fill="#1A0633" stroke="#BF00FF" strokeWidth="1.5" />
            <rect x="265" y="85" width="80" height="205" fill="#110322" stroke="#00F0FF" strokeWidth="1.2" />
            <rect x="370" y="30" width="110" height="260" fill="#1E083A" stroke="#E066FF" strokeWidth="1.5" />
            <rect x="500" y="90" width="85" height="200" fill="#100420" stroke="#00F0FF" strokeWidth="1.5" />
            {/* Neon Billboards */}
            <rect x="165" y="70" width="65" height="36" fill="#BF00FF" fillOpacity="0.3" stroke="#E066FF" strokeWidth="1.5" />
            <rect x="385" y="65" width="80" height="45" fill="#00F0FF" fillOpacity="0.25" stroke="#00F0FF" strokeWidth="1.5" />
            <text x="172" y="93" fill="#FFFFFF" fontSize="12" fontFamily="monospace" fontWeight="bold">NIGHT CITY</text>
            <text x="394" y="92" fill="#00F0FF" fontSize="13" fontFamily="monospace" fontWeight="bold">4K RAYTRACE</text>
          </g>
        )}

        {variant === 'valorant_arena' && (
          <g>
            <circle cx="320" cy="160" r="130" fill="url(#glowPurple)" />
            {/* Tactical stage geometry */}
            <polygon points="80,280 200,90 440,90 560,280" fill="#21063E" stroke="#BF00FF" strokeWidth="2" />
            <polygon points="160,250 240,120 400,120 480,250" fill="#120224" stroke="#00F0FF" strokeWidth="1.5" />
            {/* Energy Spike / Reticle */}
            <polygon points="320,75 355,175 320,225 285,175" fill="url(#neonPurpleCyan)" opacity="0.85" />
            <circle cx="320" cy="160" r="58" fill="none" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="6 4" />
            {/* Webcam corner frame */}
            <rect x="24" y="240" width="110" height="76" fill="#1A0033" stroke="#39FF14" strokeWidth="1.5" />
            <circle cx="79" cy="272" r="18" fill="#BF00FF" fillOpacity="0.5" stroke="#00F0FF" strokeWidth="1.5" />
          </g>
        )}

        {variant === 'battlestation_rig' && (
          <g>
            <circle cx="320" cy="150" r="140" fill="url(#glowCyan)" />
            {/* Triple Curved Monitors */}
            <polygon points="60,110 190,95 190,210 60,225" fill="#0A1228" stroke="#00F0FF" strokeWidth="2" />
            <rect x="200" y="90" width="220" height="125" fill="#14042D" stroke="#BF00FF" strokeWidth="2.5" />
            <polygon points="430,95 570,110 570,225 430,210" fill="#091929" stroke="#39FF14" strokeWidth="2" />
            {/* PC Watercooled Tower */}
            <rect x="485" y="135" width="75" height="130" fill="#1A0033" stroke="#00F0FF" strokeWidth="2" />
            <circle cx="522" cy="175" r="18" fill="none" stroke="#BF00FF" strokeWidth="3" />
            <circle cx="522" cy="220" r="18" fill="none" stroke="#00F0FF" strokeWidth="3" />
            {/* RGB Desk strip */}
            <rect x="40" y="265" width="560" height="6" fill="url(#neonPurpleCyan)" />
          </g>
        )}

        {(variant === 'headshot_laser' || variant === 'clutch_pro') && (
          <g>
            <circle cx="240" cy="170" r="130" fill="url(#glowPurple)" />
            {/* Laser beam diagonal */}
            <line x1="20" y1="60" x2="580" y2="300" stroke="#FF0055" strokeWidth="8" strokeOpacity="0.4" />
            <line x1="20" y1="60" x2="580" y2="300" stroke="#00F0FF" strokeWidth="2.5" />
            {/* Crosshair reticle */}
            <circle cx="320" cy="180" r="46" fill="none" stroke="#39FF14" strokeWidth="2" />
            <circle cx="320" cy="180" r="6" fill="#FF0055" />
            <line x1="260" y1="180" x2="380" y2="180" stroke="#39FF14" strokeWidth="1.5" />
            <line x1="320" y1="120" x2="320" y2="240" stroke="#39FF14" strokeWidth="1.5" />
          </g>
        )}

        {(variant === 'cs2_stage' || variant === 'smoke_tactic') && (
          <g>
            <circle cx="320" cy="175" r="120" fill="url(#glowCyan)" />
            <circle cx="260" cy="190" r="65" fill="#00F0FF" fillOpacity="0.18" />
            <circle cx="365" cy="175" r="75" fill="#BF00FF" fillOpacity="0.22" />
            <rect x="110" y="80" width="420" height="190" fill="none" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="8 4" />
            <polygon points="320,105 375,215 265,215" fill="#1A0033" stroke="#39FF14" strokeWidth="2" />
          </g>
        )}

        {(variant === 'apex_drop' || variant === 'warzone_drop') && (
          <g>
            <circle cx="320" cy="180" r="140" fill="url(#glowPurple)" />
            {/* Supply Drop Beam from Sky */}
            <rect x="295" y="0" width="50" height="270" fill="url(#neonPurpleCyan)" opacity="0.35" />
            <polygon points="320,140 375,255 265,255" fill="#26004D" stroke="#00F0FF" strokeWidth="2.5" />
            <circle cx="320" cy="215" r="22" fill="#39FF14" fillOpacity="0.3" stroke="#39FF14" strokeWidth="2" />
          </g>
        )}

        {(variant === 'streamer_fail' || variant === 'rage_neon') && (
          <g>
            <circle cx="320" cy="170" r="135" fill="url(#glowPurple)" />
            <polygon points="180,60 460,60 510,270 130,270" fill="#240038" stroke="#FF0055" strokeWidth="2.5" />
            {/* Cyber Visor Eyes with Laser Flare */}
            <polygon points="220,145 295,165 230,180" fill="#00F0FF" />
            <polygon points="420,145 345,165 410,180" fill="#FF0055" />
            <line x1="255" y1="162" x2="620" y2="230" stroke="#00F0FF" strokeWidth="4" />
            <line x1="385" y1="162" x2="620" y2="195" stroke="#FF0055" strokeWidth="5" />
          </g>
        )}

        {(variant === 'samurai_teaser' || variant === 'dota_marathon' || variant === 'gta_chase' || variant === 'ig_podcast') && (
          <g>
            <circle cx="320" cy="160" r="125" fill="url(#glowCyan)" />
            {/* Cyber Helmet / Studio Mic Silhouette */}
            <polygon points="320,65 410,135 380,255 260,255 230,135" fill="#18042E" stroke="#00F0FF" strokeWidth="2" />
            <line x1="210" y1="165" x2="430" y2="145" stroke="#BF00FF" strokeWidth="3.5" />
            <circle cx="320" cy="160" r="34" fill="none" stroke="#39FF14" strokeWidth="1.5" />
          </g>
        )}
      </svg>
      <div className="absolute inset-0 vox-scanlines pointer-events-none" />
    </div>
  );
};

export const MOOD_AVATAR_THEMES: Record<
  string,
  {
    frame: string;
    bg: string;
    suit: string;
    visor: string;
    labelUz: string;
    labelRu: string;
    labelEn: string;
  }
> = {
  cyber_streamer_1: {
    frame: '#00F0FF',
    bg: '#04293A',
    suit: '#065A82',
    visor: '#39FF14',
    labelUz: 'Moviy Energiya',
    labelRu: 'Голубая Энергия',
    labelEn: 'Cyan Energy',
  },
  cyber_streamer_2: {
    frame: '#39FF14',
    bg: '#063318',
    suit: '#0F6E34',
    visor: '#FFD700',
    labelUz: 'Yashil Tetiklik',
    labelRu: 'Зеленая Бодрость',
    labelEn: 'Fresh Green',
  },
  cyber_streamer_3: {
    frame: '#FFD700',
    bg: '#3B2304',
    suit: '#8A4F06',
    visor: '#00F0FF',
    labelUz: 'Oltin Quvonch',
    labelRu: 'Золотая Радость',
    labelEn: 'Golden Joy',
  },
  cyber_skull_vox: {
    frame: '#FF2A85',
    bg: '#380724',
    suit: '#800F52',
    visor: '#00F0FF',
    labelUz: 'Pushti Draiv',
    labelRu: 'Розовый Драйв',
    labelEn: 'Pink Drive',
  },
};

export const CyberAvatar: React.FC<{
  avatarId?: string;
  frameColor?: string;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}> = ({ avatarId = 'cyber_streamer_1', frameColor, size = 'md', rounded = true }) => {
  const dim = size === 'lg' ? 'w-28 h-28' : size === 'md' ? 'w-11 h-11' : 'w-9 h-9';
  const borderThickness = size === 'lg' ? 'p-[2px]' : size === 'md' ? 'p-[1.5px]' : 'p-[1.5px]';
  const isCustomImage =
    avatarId.startsWith('data:image/') ||
    avatarId.startsWith('blob:') ||
    avatarId.startsWith('http');

  const storedFrameColor =
    typeof window !== 'undefined' ? localStorage.getItem('vox_hub_frame_color') || '' : '';

  const theme = MOOD_AVATAR_THEMES[avatarId] || MOOD_AVATAR_THEMES.cyber_streamer_1;
  const activeFrameColor = frameColor || storedFrameColor || theme.frame;

  const isRainbow = activeFrameColor === 'rainbow';
  const accent =
    activeFrameColor && activeFrameColor !== 'rainbow' ? activeFrameColor : theme.frame;

  const frameStyle: React.CSSProperties = isRainbow
    ? {
        background:
          'conic-gradient(from 0deg, #FF0055, #BF00FF, #00F0FF, #39FF14, #FFD700, #FF0055)',
        boxShadow: '0 0 12px rgba(0, 240, 255, 0.55), 0 0 20px rgba(191, 0, 255, 0.4)',
      }
    : {
        background: accent,
        boxShadow: `0 0 10px ${accent}88, 0 0 3px ${accent}`,
      };

  return (
    <div
      className={`${dim} ${borderThickness} ${
        rounded ? 'rounded-full' : ''
      } relative shrink-0 transition-all duration-200`}
      style={frameStyle}
    >
      <div
        className={`w-full h-full ${
          rounded ? 'rounded-full' : ''
        } relative overflow-hidden bg-[#1A0033]`}
      >
        {isCustomImage ? (
          <img
            src={avatarId}
            alt="User profile avatar"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover block"
          />
        ) : (
          <svg viewBox="0 0 120 120" className="w-full h-full block">
            {/* Mood-boosting vibrant background */}
            <rect width="120" height="120" fill={theme.bg} />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={theme.frame}
              strokeOpacity="0.35"
              strokeWidth="2"
              strokeDasharray="5 3"
            />
            {/* Head */}
            <circle cx="60" cy="44" r="22" fill={theme.suit} stroke={theme.frame} strokeWidth="3" />
            {/* Cyber Visor */}
            <rect x="43" y="35" width="34" height="9" rx="3" fill={theme.visor} />
            {/* Cheerful Smile */}
            <path
              d="M 52 51 Q 60 58 68 51"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            {/* Jacket / Shoulders */}
            <path
              d="M20,115 L34,74 L60,88 L86,74 L100,115 Z"
              fill={theme.suit}
              stroke={theme.frame}
              strokeWidth="3"
            />
            {/* Studio Headset / Mic */}
            <rect
              x="26"
              y="62"
              width="22"
              height="10"
              rx="3"
              fill={theme.bg}
              stroke={theme.visor}
              strokeWidth="2"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export const VoxBotMascot: React.FC = () => (
  <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
    {/* Neon outer frame matching Image 3 & Image 18 */}
    <div
      className="w-40 h-40 bg-[#140526] border-2 border-[#00F0FF] flex flex-col items-center justify-center relative"
      style={{
        boxShadow:
          '0 0 24px rgba(191, 0, 255, 0.55), inset 0 0 18px rgba(0, 240, 255, 0.25)',
      }}
    >
      {/* Corner pixel squares */}
      <span className="absolute top-2 left-2 w-2.5 h-2.5 bg-[#D3FBFF]" />
      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#D3FBFF]" />
      <span className="absolute bottom-2 left-2 w-2.5 h-2.5 bg-[#D3FBFF]" />
      <span className="absolute bottom-2 right-2 w-2.5 h-2.5 bg-[#D3FBFF]" />

      {/* Cute Pixel Bot Face */}
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        <line x1="36" y1="22" x2="36" y2="12" stroke="#BF00FF" strokeWidth="3" />
        <circle cx="36" cy="10" r="3.5" fill="#00F0FF" />
        <line x1="64" y1="22" x2="64" y2="12" stroke="#BF00FF" strokeWidth="3" />
        <circle cx="64" cy="10" r="3.5" fill="#00F0FF" />
        <rect
          x="22"
          y="22"
          width="56"
          height="46"
          fill="#0D001A"
          stroke="#BF00FF"
          strokeWidth="3"
        />
        {/* Happy Pixel Arc Eyes */}
        <path
          d="M 33 42 Q 39 34 45 42"
          fill="none"
          stroke="#00F0FF"
          strokeWidth="3.5"
          strokeLinecap="square"
        />
        <path
          d="M 55 42 Q 61 34 67 42"
          fill="none"
          stroke="#00F0FF"
          strokeWidth="3.5"
          strokeLinecap="square"
        />
        {/* Smile */}
        <path
          d="M 42 52 Q 50 60 58 52"
          fill="none"
          stroke="#39FF14"
          strokeWidth="3.5"
          strokeLinecap="square"
        />
        {/* Cheeks */}
        <rect x="28" y="47" width="5" height="5" fill="#FF0055" />
        <rect x="67" y="47" width="5" height="5" fill="#FF0055" />
      </svg>

      {/* VOX:BOT v2 Tag */}
      <div className="absolute -bottom-3 px-3 py-0.5 bg-[#BF00FF] text-white font-mono-code text-xs font-bold tracking-wider uppercase border border-[#E066FF]">
        VOX:BOT v2
      </div>
    </div>
  </div>
);
