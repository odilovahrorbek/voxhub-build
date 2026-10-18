import React, { useState } from 'react';
import { ArrowRight, Globe, LogIn, RotateCw, Users, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n, LanguageCode } from '../i18n/i18n';
import { VoxBotMascot } from './CyberThumbnail';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  userName: string;
  onEnterApp: () => Promise<void> | void;
  onSimulateOffline?: () => void;
}

/**
 * 1. Har safar ilovaga kirganda yoqimli animatsiya bilan ochiladigan Salomlashish oynasi
 *    (Matches first image.png: Neon gradient square robot + "Assalomu alaykum! ✨" + "Davom etish →")
 */
export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  userName,
  onEnterApp,
  onSimulateOffline,
}) => {
  const { lang, setLang, t } = useI18n();
  const [verifyingNetwork, setVerifyingNetwork] = useState(false);
  const firstName = userName.split(' ')[0] || 'Temur';

  const handleEnterClick = async () => {
    if (verifyingNetwork) return;
    setVerifyingNetwork(true);
    try {
      await onEnterApp();
    } finally {
      setVerifyingNetwork(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="vox-welcome-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-[#0E021A] vox-cyber-grid flex flex-col justify-between p-5 sm:p-8 overflow-y-auto select-none"
          role="dialog"
          aria-modal="true"
        >
          {/* Ambient radial glow backdrop */}
          <div
            className="pointer-events-none fixed inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 38%, rgba(191, 0, 255, 0.16) 0%, rgba(0, 240, 255, 0.06) 35%, transparent 70%)',
            }}
          />

          {/* Top Bar */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between pt-1"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl bg-[#1A052E] border-2 border-[#BF00FF] flex items-center justify-center"
                style={{ boxShadow: '0 0 14px rgba(191, 0, 255, 0.5)' }}
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path
                    d="M6 5h2v2H6V5zm10 0h2v2h-2V5zM4 9h16v6H4V9zm3 2v2h2v-2H7zm8 0v2h2v-2h-2zM6 17h3v2H6v-2zm9 0h3v2h-3v-2z"
                    fill="#E066FF"
                  />
                </svg>
              </div>
              <div className="font-mono-code font-bold text-sm leading-tight tracking-widest text-[#BF00FF] uppercase">
                <div>VOX</div>
                <div>HUB</div>
              </div>
            </div>

            {/* Language Switcher (UZ / RU / EN) + Quick Offline Test Trigger */}
            <div className="flex items-center gap-2">
              {onSimulateOffline && (
                <button
                  type="button"
                  onClick={onSimulateOffline}
                  className="p-2 rounded-lg bg-[#1A052E]/90 border border-[#3A007A] hover:border-[#FF2A85] text-[#B39DDB] hover:text-[#FF2A85] transition-colors cursor-pointer"
                  title="Internet uzilishini sinash (Offline rejim)"
                >
                  <WifiOff className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-1 bg-[#1A052E]/90 border border-[#3A007A] rounded-lg p-1">
                <Globe className="w-3.5 h-3.5 text-[#00F0FF] mx-1.5" />
                {(['uz', 'ru', 'en'] as LanguageCode[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    className={`px-2 py-1 rounded font-mono-code text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                      lang === code
                        ? 'bg-[#BF00FF] text-white'
                        : 'text-[#B39DDB] hover:text-white'
                    }`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Center Animated Mascot & Greeting */}
          <div className="relative z-10 w-full max-w-md mx-auto my-auto py-8 text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-8"
            >
              {/* Breathing Neon Halo */}
              <motion.div
                animate={{
                  scale: [1, 1.07, 1],
                  opacity: [0.55, 0.88, 0.55],
                }}
                transition={{
                  duration: 3.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -inset-3 rounded-[36px] pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(191,0,255,0.45) 0%, rgba(0,240,255,0.45) 100%)',
                  filter: 'blur(16px)',
                }}
              />

              {/* Gradient Rounded-Square Frame */}
              <div
                className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-[32px] p-[5px]"
                style={{
                  background: 'linear-gradient(135deg, #BF00FF 0%, #9D00FF 45%, #00E5FF 100%)',
                  boxShadow: '0 0 30px rgba(191, 0, 255, 0.4)',
                }}
              >
                <div
                  className="w-full h-full rounded-[27px] bg-[#120422] vox-cyber-grid flex items-center justify-center relative overflow-hidden"
                  style={{
                    boxShadow: 'inset 0 0 36px rgba(0, 255, 170, 0.18)',
                  }}
                >
                  <div
                    className="w-28 h-28 rounded-full absolute pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(0, 255, 170, 0.32) 0%, transparent 70%)',
                    }}
                  />

                  {/* Levitating Cute Robot Head */}
                  <motion.svg
                    animate={{ y: [-5, 5, -5] }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    viewBox="0 0 120 120"
                    className="w-28 h-28 relative z-10 overflow-visible"
                  >
                    <line
                      x1="60"
                      y1="34"
                      x2="60"
                      y2="20"
                      stroke="#E066FF"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <motion.circle
                      animate={{ opacity: [0.6, 1, 0.6], r: [4.5, 5.5, 4.5] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      cx="60"
                      cy="17"
                      r="5"
                      fill="#00F0FF"
                    />
                    <rect
                      x="25"
                      y="34"
                      width="70"
                      height="56"
                      rx="14"
                      fill="#0B0217"
                      stroke="#E066FF"
                      strokeWidth="3.5"
                    />
                    <rect
                      x="30"
                      y="39"
                      width="60"
                      height="46"
                      rx="10"
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="1.8"
                      strokeOpacity="0.8"
                    />
                    <path
                      d="M 40 58 Q 47 48 54 58"
                      fill="none"
                      stroke="#39FF14"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 66 58 Q 73 48 80 58"
                      fill="none"
                      stroke="#39FF14"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 52 68 Q 60 76 68 68"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="38" cy="68" r="3.5" fill="#FF2A85" />
                    <circle cx="82" cy="68" r="3.5" fill="#FF2A85" />
                  </motion.svg>
                </div>
              </div>
            </motion.div>

            {/* Staggered Greeting Text */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2"
            >
              <h1
                className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight"
                style={{ textShadow: '0 0 18px rgba(191, 0, 255, 0.55)' }}
              >
                {t('welcome.greeting_1')}{' '}
                <motion.span
                  animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.18, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block"
                >
                  ✨
                </motion.span>
              </h1>

              <p
                className="font-display font-bold text-lg sm:text-xl text-[#00F0FF] tracking-wide"
                style={{ textShadow: '0 0 12px rgba(0, 240, 255, 0.45)' }}
              >
                {t('welcome.greeting_2', { name: firstName })}
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 text-sm text-[#B39DDB] font-mono-code leading-relaxed max-w-xs sm:max-w-sm mx-auto"
            >
              {t('welcome.subtitle')}
            </motion.p>
          </div>

          {/* Bottom "Davom etish ->" Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md mx-auto pb-2"
          >
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="button"
              disabled={verifyingNetwork}
              onClick={handleEnterClick}
              className="w-full py-4 px-6 rounded-2xl bg-[#16052B]/90 hover:bg-[#220940] text-[#00F0FF] font-mono-code text-sm font-bold tracking-wider border border-[#BF00FF]/80 hover:border-[#00F0FF] flex items-center justify-center gap-2.5 cursor-pointer transition-colors disabled:opacity-75"
              style={{
                boxShadow:
                  '0 0 22px rgba(191, 0, 255, 0.32), inset 0 0 14px rgba(191, 0, 255, 0.15)',
              }}
            >
              <span>
                {verifyingNetwork ? t('offline.checking_btn') : t('welcome.continue_btn')}
              </span>
              {verifyingNetwork ? (
                <RotateCw className="w-4 h-4 text-[#E066FF] animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 text-[#E066FF]" />
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface FirstTimeAuthGateModalProps {
  isOpen: boolean;
  userName: string;
  onOpenRegistration: () => void;
}

/**
 * 2. Faqatgina birinchi marta kirganda (ro'yxatdan o'tishdan oldin) chiqadigan VOX:BOT v2 oynasi.
 *    Foydalanuvchi bir marta ro'yxatdan o'tgandan so'ng bu oyna boshqa hech qachon ochilmaydi!
 */
export const FirstTimeAuthGateModal: React.FC<FirstTimeAuthGateModalProps> = ({
  isOpen,
  userName,
  onOpenRegistration,
}) => {
  const { lang, setLang, t } = useI18n();
  const firstName = userName.split(' ')[0] || 'Temur';

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-[#0D001A] vox-cyber-grid flex flex-col justify-between p-4 sm:p-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between border-b border-[#3A007A] pb-3">
        <div className="flex items-center gap-1 bg-[#1A0033] border border-[#3A007A] p-1">
          <Globe className="w-3.5 h-3.5 text-[#00F0FF] mx-1.5" />
          {(['uz', 'ru', 'en'] as LanguageCode[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`px-2.5 py-1 font-mono-code text-xs font-bold uppercase transition-colors cursor-pointer ${
                lang === code
                  ? 'bg-[#BF00FF] text-white'
                  : 'text-[#B39DDB] hover:text-white'
              }`}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="font-display font-bold text-base leading-tight text-right text-[#F3DAFF] uppercase">
          <div>VOX</div>
          <div>HUB</div>
        </div>
      </div>

      {/* Center VOX:BOT v2 & "[ ILOVAGA KIRISH ]" / "[ BOSHQA HISOBDAN KIRISH ]" */}
      <div className="w-full max-w-md mx-auto my-auto py-8 text-center space-y-6">
        <VoxBotMascot />

        <div className="space-y-2 pt-2">
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
            {t('welcome.greeting_1')}
          </h1>
          <p className="font-display font-semibold text-xl text-[#D580FF]">
            {t('welcome.greeting_2', { name: firstName })}
          </p>
        </div>

        <p className="text-xs sm:text-sm text-[#B39DDB] font-mono-code leading-relaxed max-w-sm mx-auto">
          {t('welcome.subtitle')}
        </p>

        <div className="pt-4">
          <button
            type="button"
            onClick={onOpenRegistration}
            className="w-full py-4 px-5 bg-gradient-to-r from-[#9900CC] via-[#BF00FF] to-[#9900CC] hover:brightness-110 text-white font-mono-code text-sm font-bold uppercase tracking-wider rounded-xl border border-[#E066FF] vox-purple-glow flex items-center justify-center gap-3 cursor-pointer transition-all"
          >
            <LogIn className="w-4 h-4 shrink-0 text-[#00F0FF]" />
            <span>RO'YXATDAN O'TISH // TIZIMGA KIRISH</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface OfflineGuardModalProps {
  isOpen: boolean;
  onRetryConnection: () => Promise<boolean> | boolean;
}

/**
 * 3. Internet bo'lmasa ilovaga kirib bo'lmasligini ta'minlovchi To'liq Ekranli Himoya Oynasi
 *    (Matches uploaded image.png with exact sad robot animation, neon halo, scanline border & retry button)
 */
export const OfflineGuardModal: React.FC<OfflineGuardModalProps> = ({
  isOpen,
  onRetryConnection,
}) => {
  const { t } = useI18n();
  const [checking, setChecking] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const handleRetryClick = async () => {
    if (checking) return;
    setChecking(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    const connected = await onRetryConnection();
    setChecking(false);
    if (!connected) {
      setShakeTrigger((prev) => prev + 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="vox-offline-guard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-[#0E021A] vox-cyber-grid flex flex-col justify-between p-5 sm:p-8 overflow-y-auto select-none"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="vox-offline-title"
        >
          {/* Ambient radial glow backdrop */}
          <div
            className="pointer-events-none fixed inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 38%, rgba(191, 0, 255, 0.18) 0%, rgba(0, 240, 255, 0.08) 36%, transparent 70%)',
            }}
          />

          {/* Top Bar matching uploaded screenshot */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between pt-1"
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-xl bg-[#1A052E] border-2 border-[#BF00FF] flex items-center justify-center vox-cyber-grid"
                style={{ boxShadow: '0 0 16px rgba(191, 0, 255, 0.55)' }}
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path
                    d="M6 5h2v2H6V5zm10 0h2v2h-2V5zM4 9h16v6H4V9zm3 2v2h2v-2H7zm8 0v2h2v-2h-2zM6 17h3v2H6v-2zm9 0h3v2h-3v-2z"
                    fill="#E5C5FF"
                  />
                </svg>
              </div>
              <span
                className="font-mono-code font-bold text-base sm:text-lg tracking-[0.2em] text-[#BF00FF] uppercase"
                style={{ textShadow: '0 0 12px rgba(191, 0, 255, 0.7)' }}
              >
                VOX HUB
              </span>
            </div>

            {/* Right OFFLINE Status Indicator */}
            <div className="flex items-center gap-2 font-mono-code text-xs tracking-wider text-[#9D8BA0] uppercase">
              <span>{t('offline.badge')}</span>
              <WifiOff className="w-4 h-4 text-[#9D8BA0]" />
            </div>
          </motion.div>

          {/* Center Animated Sad Robot & Offline Message */}
          <div className="relative z-10 w-full max-w-md mx-auto my-auto py-8 text-center flex flex-col items-center">
            <motion.div
              key={shakeTrigger}
              initial={{ opacity: 0, scale: 0.82, y: 20 }}
              animate={
                shakeTrigger > 0
                  ? { opacity: 1, scale: 1, y: 0, x: [0, -10, 10, -8, 8, -4, 4, 0] }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-8"
            >
              {/* Breathing Neon Halo */}
              <motion.div
                animate={{
                  scale: [1, 1.07, 1],
                  opacity: [0.55, 0.88, 0.55],
                }}
                transition={{
                  duration: 3.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -inset-3 rounded-[36px] pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(191,0,255,0.45) 0%, rgba(0,240,255,0.45) 100%)',
                  filter: 'blur(16px)',
                }}
              />

              {/* Gradient Rounded-Square Frame with Scanline Texture */}
              <div
                className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-[32px] p-[11px] overflow-hidden"
                style={{
                  background: 'linear-gradient(120deg, #8E00E8 0%, #9D00FF 58%, #00E5FF 100%)',
                  boxShadow:
                    '0 0 32px rgba(191, 0, 255, 0.42), 0 0 20px rgba(0, 240, 255, 0.25)',
                }}
              >
                {/* Horizontal Scanline Stripes on the Frame Border */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(14, 2, 26, 0.32) 0px, rgba(14, 2, 26, 0.32) 2px, transparent 2px, transparent 4px)',
                  }}
                />

                {/* Inner Dark Cyber Grid Screen */}
                <div
                  className="w-full h-full rounded-[22px] bg-[#120422] vox-cyber-grid flex items-center justify-center relative overflow-hidden"
                  style={{
                    boxShadow: 'inset 0 0 36px rgba(0, 240, 255, 0.22)',
                  }}
                >
                  {/* Center Cyan Radial Glow behind Robot */}
                  <div
                    className="w-32 h-32 rounded-full absolute pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(0, 240, 255, 0.34) 0%, transparent 68%)',
                    }}
                  />

                  {/* Levitating Sad Robot Head matching image.png */}
                  <motion.svg
                    animate={{ y: [-5, 5, -5] }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    viewBox="0 0 120 120"
                    className="w-28 h-28 relative z-10 overflow-visible"
                  >
                    {/* Antenna Stem */}
                    <line
                      x1="60"
                      y1="34"
                      x2="60"
                      y2="20"
                      stroke="#BF00FF"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Glowing Cyan Antenna Tip */}
                    <motion.circle
                      animate={{ opacity: [0.6, 1, 0.6], r: [4.5, 5.8, 4.5] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      cx="60"
                      cy="17"
                      r="5"
                      fill="#00F0FF"
                      style={{ filter: 'drop-shadow(0 0 8px #00F0FF)' }}
                    />

                    {/* Outer Purple Rounded Head */}
                    <rect
                      x="25"
                      y="34"
                      width="70"
                      height="56"
                      rx="14"
                      fill="#0B0217"
                      stroke="#BF00FF"
                      strokeWidth="3.5"
                      style={{ filter: 'drop-shadow(0 0 10px rgba(191, 0, 255, 0.65))' }}
                    />

                    {/* Inner Cyan Screen Frame */}
                    <rect
                      x="30"
                      y="39"
                      width="60"
                      height="46"
                      rx="10"
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="2.2"
                      strokeOpacity="0.9"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.65))' }}
                    />

                    {/* Sad / Worried Cyan Eyebrows */}
                    <path
                      d="M 38 54 Q 45 46 53 51"
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 82 54 Q 75 46 67 51"
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />

                    {/* Cute Sad Eyes with Glint */}
                    <circle cx="46" cy="59" r="2.6" fill="#00F0FF" />
                    <circle cx="47" cy="58" r="1" fill="#FFFFFF" />
                    <circle cx="74" cy="59" r="2.6" fill="#00F0FF" />
                    <circle cx="73" cy="58" r="1" fill="#FFFFFF" />

                    {/* Pixel Blush / Tear Cheeks (White + Pink pixels matching image.png) */}
                    <rect x="35.5" y="64" width="3.8" height="3.8" rx="0.8" fill="#FFFFFF" />
                    <rect x="39.8" y="64" width="3.8" height="3.8" rx="0.8" fill="#FF2A85" />
                    <rect x="76.4" y="64" width="3.8" height="3.8" rx="0.8" fill="#FF2A85" />
                    <rect x="80.7" y="64" width="3.8" height="3.8" rx="0.8" fill="#FFFFFF" />

                    {/* Sad Frowning Cyan Mouth */}
                    <path
                      d="M 49 72 Q 60 63 71 72"
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </div>
              </div>
            </motion.div>

            {/* Staggered Offline Text matching image.png */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2.5"
            >
              <h1
                id="vox-offline-title"
                className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight"
                style={{
                  textShadow:
                    '0 0 18px rgba(191, 0, 255, 0.8), 0 0 34px rgba(191, 0, 255, 0.45)',
                }}
              >
                {t('offline.title')}
              </h1>

              <div
                className="font-display font-bold text-base sm:text-lg text-[#00F0FF] tracking-wide flex items-center justify-center gap-2"
                style={{ textShadow: '0 0 12px rgba(0, 240, 255, 0.7)' }}
              >
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block w-2 h-2 rounded-full bg-[#00F0FF]"
                  style={{ boxShadow: '0 0 10px #00F0FF' }}
                />
                <span>{t('offline.status')}</span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 text-sm text-[#B8A9C9] font-mono-code leading-relaxed max-w-[290px] sm:max-w-xs mx-auto"
            >
              {t('offline.subtitle')}
            </motion.p>
          </div>

          {/* Bottom "Qayta urinib ko'rish ↻" Button matching image.png */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md mx-auto pb-2"
          >
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="button"
              onClick={handleRetryClick}
              disabled={checking}
              className="w-full py-4 px-6 rounded-2xl bg-[#16052B]/90 hover:bg-[#220940] text-[#00F0FF] font-mono-code text-sm font-bold tracking-wider border border-[#BF00FF]/80 hover:border-[#00F0FF] flex items-center justify-center gap-2.5 cursor-pointer transition-colors disabled:opacity-75"
              style={{
                boxShadow:
                  '0 0 22px rgba(191, 0, 255, 0.32), inset 0 0 14px rgba(191, 0, 255, 0.15)',
                textShadow: '0 0 10px rgba(0, 240, 255, 0.55)',
              }}
            >
              <span>{checking ? t('offline.checking_btn') : t('offline.retry_btn')}</span>
              <RotateCw
                className={`w-4 h-4 text-[#E066FF] ${checking ? 'animate-spin' : ''}`}
              />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
