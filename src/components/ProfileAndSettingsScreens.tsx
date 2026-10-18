import React, { useState } from 'react';
import {
  ArrowLeft,
  Settings,
  Camera,
  Upload,
  Pencil,
  Lock,
  Copy,
  Check,
  Save,
  RotateCcw,
  Globe,
  Mail,
  Type,
  Shield,
  Key,
  Link2,
  Unlink,
  RefreshCw,
  Code2,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useI18n, LanguageCode, FontScaleMode } from '../i18n/i18n';
import { CyberAvatar, MOOD_AVATAR_THEMES } from './CyberThumbnail';
import { sanitizeUserInput } from '../services/securityService';

interface ProfileEditScreenProps {
  profile: {
    fullName: string;
    nickname: string;
    email: string;
    avatarId: string;
    frameColor?: string;
  };
  onBack: () => void;
  onOpenSettings: () => void;
  onOpenChangeEmail: () => void;
  onSaveProfile: (updated: {
    fullName: string;
    nickname: string;
    email: string;
    avatarId: string;
    frameColor?: string;
  }) => Promise<void>;
}

export const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({
  profile,
  onBack,
  onOpenSettings,
  onOpenChangeEmail,
  onSaveProfile,
}) => {
  const { lang, t } = useI18n();
  const [fullName, setFullName] = useState(profile.fullName);
  const [nickname, setNickname] = useState(profile.nickname);
  const [email, setEmail] = useState(profile.email);
  const [avatarId, setAvatarId] = useState(profile.avatarId || 'cyber_streamer_1');
  const [frameColor, setFrameColor] = useState<string>(() => {
    return (
      profile.frameColor ||
      (typeof window !== 'undefined' ? localStorage.getItem('vox_hub_frame_color') || '#00F0FF' : '#00F0FF')
    );
  });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const fullNameInputRef = React.useRef<HTMLInputElement>(null);
  const nicknameInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setFullName(profile.fullName);
    setNickname(profile.nickname);
    setEmail(profile.email);
    setAvatarId(profile.avatarId || 'cyber_streamer_1');
    if (profile.frameColor) {
      setFrameColor(profile.frameColor);
    }
  }, [profile.fullName, profile.nickname, profile.email, profile.avatarId, profile.frameColor]);

  const showSavedFeedback = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;

      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setAvatarId(dataUrl);
          await onSaveProfile({
            fullName: sanitizeUserInput(fullName) || profile.fullName,
            nickname: sanitizeUserInput(nickname).replace(/^@+/, '') || profile.nickname,
            email: sanitizeUserInput(email) || profile.email,
            avatarId: dataUrl,
            frameColor,
          });
          showSavedFeedback();
        } else {
          setAvatarId(result);
        }
      };
      img.onerror = () => {
        setAvatarId(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectPresetAvatar = async (presetId: string) => {
    const moodColor = MOOD_AVATAR_THEMES[presetId]?.frame || '#00F0FF';
    const isCustomUploaded =
      avatarId.startsWith('data:image/') ||
      avatarId.startsWith('blob:') ||
      avatarId.startsWith('http');

    // If user uploaded a custom photo, clicking a mood character sets their frame color to that mood;
    // clicking the same mood character again switches to that character avatar.
    const nextAvatarId = isCustomUploaded && frameColor !== moodColor ? avatarId : presetId;

    setAvatarId(nextAvatarId);
    setFrameColor(moodColor);
    try {
      localStorage.setItem('vox_hub_frame_color', moodColor);
    } catch {
      // ignore
    }
    await onSaveProfile({
      fullName: sanitizeUserInput(fullName) || profile.fullName,
      nickname: sanitizeUserInput(nickname).replace(/^@+/, '') || profile.nickname,
      email: sanitizeUserInput(email) || profile.email,
      avatarId: nextAvatarId,
      frameColor: moodColor,
    });
    showSavedFeedback();
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSave = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    const cleanedName = sanitizeUserInput(fullName) || profile.fullName;
    const cleanedNick = sanitizeUserInput(nickname).replace(/^@+/, '') || profile.nickname;
    const cleanedEmail = sanitizeUserInput(email) || profile.email;

    setSaving(true);
    try {
      try {
        localStorage.setItem('vox_hub_frame_color', frameColor);
      } catch {
        // ignore
      }
      await onSaveProfile({
        fullName: cleanedName,
        nickname: cleanedNick,
        email: cleanedEmail,
        avatarId,
        frameColor,
      });
      showSavedFeedback();
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFullName(profile.fullName);
    setNickname(profile.nickname);
    setEmail(profile.email);
    setAvatarId(profile.avatarId);
    setFrameColor(profile.frameColor || '#00F0FF');
    setSavedSuccess(false);
  };

  const presetAvatars = [
    'cyber_streamer_1',
    'cyber_streamer_2',
    'cyber_streamer_3',
    'cyber_skull_vox',
  ];

  return (
    <div className="w-full max-w-xl mx-auto space-y-5 pb-12">
      {/* Hidden File Input for uploading custom profile pictures */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Bar matching Image 1 */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#170624] border border-[#3A007A]">
        <button
          onClick={onBack}
          className="p-2 text-white hover:text-[#00F0FF] cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="p-2 text-[#00F0FF] hover:bg-[#261432] cursor-pointer"
            title={t('settings.title')}
          >
            <Settings className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg text-white uppercase tracking-wider">
            {t('profile.title')}
          </h1>
        </div>

        <CyberAvatar avatarId={avatarId} frameColor={frameColor} size="sm" />
      </div>

      {/* Inline Success Confirmation Banner (profil_saqlandi_muvaffaqiyatli_bildirishnoma) */}
      {savedSuccess && (
        <div className="p-3.5 bg-[#003911] border-2 border-[#39FF14] text-[#39FF14] font-mono-code text-xs font-bold flex items-center gap-2.5 vox-cyan-glow">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{t('notifications.profile_saved')}</span>
        </div>
      )}

      {/* Main Profile Card matching Image 1 */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-[#261432] border border-[#3A007A] p-6 space-y-5">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3.5">
            <div className="relative group cursor-pointer" onClick={triggerFilePicker}>
              <CyberAvatar avatarId={avatarId} frameColor={frameColor} size="lg" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFilePicker();
                }}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#BF00FF] hover:bg-[#E066FF] text-white border-2 border-[#170624] flex items-center justify-center cursor-pointer vox-purple-glow transition-transform hover:scale-110"
                title={t('profile.change_avatar')}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={triggerFilePicker}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#170624] hover:bg-[#352242] border border-[#00F0FF] font-mono-code text-xs text-[#00F0FF] uppercase tracking-wider cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t('profile.change_avatar')}</span>
            </button>

            {/* 4 Mood-Boosting Colored Little People (Avatars & Frame Colors) */}
            <div className="flex items-center gap-3.5 pt-1">
              {presetAvatars.map((preset) => {
                const moodTheme = MOOD_AVATAR_THEMES[preset];
                const isSelected = frameColor === moodTheme.frame || avatarId === preset;
                const moodTitle =
                  lang === 'ru'
                    ? moodTheme.labelRu
                    : lang === 'en'
                    ? moodTheme.labelEn
                    : moodTheme.labelUz;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(preset)}
                    className={`p-0.5 rounded-full transition-all cursor-pointer ${
                      isSelected
                        ? 'scale-110 ring-1 ring-white/90'
                        : 'opacity-85 hover:opacity-100 hover:scale-110'
                    }`}
                    style={{
                      boxShadow: isSelected ? `0 0 10px ${moodTheme.frame}99` : undefined,
                    }}
                    title={moodTitle}
                  >
                    <CyberAvatar avatarId={preset} frameColor={moodTheme.frame} size="sm" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="block font-mono-code text-xs text-[#D5C0D7] uppercase">
              {t('profile.full_name')}
            </label>
            <div className="flex items-center bg-[#352242] border border-[#514254] focus-within:border-[#00F0FF] px-3.5 py-3">
              <input
                ref={fullNameInputRef}
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent text-white font-display font-semibold text-base focus:outline-none"
              />
              <button
                type="button"
                onClick={() => fullNameInputRef.current?.focus()}
                className="text-[#00F0FF] hover:text-white ml-2 shrink-0 cursor-pointer"
                title="Edit Full Name"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Handle / Nickname Input */}
          <div className="space-y-1.5">
            <label className="block font-mono-code text-xs text-[#D5C0D7] uppercase">
              {t('profile.nickname')}
            </label>
            <div className="flex items-center bg-[#352242] border border-[#514254] focus-within:border-[#00F0FF] px-3.5 py-3">
              <span className="font-mono-code text-[#00F0FF] font-bold mr-1.5">@</span>
              <input
                ref={nicknameInputRef}
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-transparent text-[#00F0FF] font-mono-code font-semibold text-base focus:outline-none"
              />
              <button
                type="button"
                onClick={() => nicknameInputRef.current?.focus()}
                className="text-[#00F0FF] hover:text-white ml-2 shrink-0 cursor-pointer"
                title="Edit Nickname"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Email Card matching Image 1 */}
        <div className="bg-[#261432] border border-[#3A007A] p-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-mono-code text-xs text-[#D5C0D7] uppercase">
              {t('profile.email')}
            </label>
            <button
              type="button"
              onClick={onOpenChangeEmail}
              className="font-mono-code text-[11px] text-[#00F0FF] hover:underline uppercase cursor-pointer"
            >
              {t('settings.change_email_btn')}
            </button>
          </div>
          <div className="flex items-center justify-between bg-[#352242] border border-[#514254] focus-within:border-[#00F0FF] px-3.5 py-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Lock className="w-4 h-4 text-[#00F0FF] shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent font-mono-code text-sm text-white focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="p-1.5 bg-[#261432] hover:bg-[#402D4D] text-[#D5C0D7] border border-[#514254] ml-2 shrink-0 cursor-pointer"
              title="Copy Email"
            >
              {copiedEmail ? (
                <Check className="w-4 h-4 text-[#39FF14]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Save & Cancel Buttons */}
        <button
          type="submit"
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 font-mono-code font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer transition-all ${
            savedSuccess
              ? 'bg-[#008A33] text-white border-2 border-[#39FF14]'
              : 'bg-[#BF00FF] hover:bg-[#E066FF] text-white vox-purple-glow'
          }`}
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
              <span>{t('profile.save_changes')} ✓</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? '...' : t('profile.save_changes')}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-2.5 text-[#9D8BA0] hover:text-white font-mono-code text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('profile.cancel')}</span>
        </button>
      </form>
    </div>
  );
};

interface SettingsHubScreenProps {
  connectedProviders: Record<
    string,
    { connected: boolean; handle: string; pkceVerified?: boolean }
  >;
  onBack: () => void;
  onOpenChangeEmail: () => void;
  onOpenChangePassword: () => void;
  onOAuthConnect: (provider: string) => void;
  onOAuthDisconnect: (provider: string) => void;
  onTest401Interceptor: () => void;
  onOpenFlutterCode: () => void;
}

export const SettingsHubScreen: React.FC<SettingsHubScreenProps> = ({
  connectedProviders,
  onBack,
  onOpenChangeEmail,
  onOpenChangePassword,
  onOAuthConnect,
  onOAuthDisconnect,
  onTest401Interceptor,
  onOpenFlutterCode,
}) => {
  const { lang, setLang, fontScale, setFontScale, t } = useI18n();

  const languageOptions: { code: LanguageCode; label: string }[] = [
    { code: 'uz', label: "O'zbekcha (Lotin)" },
    { code: 'ru', label: 'Русский (RU)' },
    { code: 'en', label: 'English (EN)' },
  ];

  const fontOptions: { mode: FontScaleMode; label: string }[] = [
    { mode: 'small', label: t('settings.font_small') },
    { mode: 'standard', label: t('settings.font_standard') },
    { mode: 'large', label: t('settings.font_large') },
  ];

  const oauthPlatforms = [
    { id: 'youtube', name: 'YouTube Data API v3', scope: 'youtube.readonly' },
    { id: 'twitch', name: 'Twitch Helix API', scope: 'user:read:broadcast' },
    { id: 'tiktok', name: 'TikTok Login Kit & Display', scope: 'video.list' },
    { id: 'instagram', name: 'Instagram Graph / Display API', scope: 'user_media' },
    { id: 'discord', name: 'Discord RPC Gateway', scope: 'identify' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto space-y-5 pb-12">
      {/* Header matching Image 7 & Image 5 */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#170624] border border-[#3A007A]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-[#1D0B29] border-2 border-[#00F0FF] text-white hover:bg-[#261432] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display font-bold text-lg text-white uppercase tracking-wide">
              {t('settings.title')}
            </h1>
            <div className="font-mono-code text-[10px] text-[#9D8BA0]">
              {t('settings.subtitle')}
            </div>
          </div>
        </div>

        <div className="px-3 py-1.5 bg-[#1D0B29] border border-[#BF00FF] font-mono-code text-[11px] text-white">
          <span className="text-[#39FF14] mr-1.5">■</span>
          {t('settings.config_active')}
        </div>
      </div>

      {/* 1. ILOVA TILI (App Language) matching Image 7 */}
      <div className="bg-[#261432] border border-[#3A007A] p-5 space-y-3">
        <div className="flex items-center gap-2 font-mono-code font-bold text-sm text-white uppercase">
          <Globe className="w-4 h-4 text-[#00F0FF]" />
          <span>{t('settings.sec_1_lang')}</span>
        </div>

        <div className="space-y-2">
          {languageOptions.map((item) => {
            const isSelected = lang === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setLang(item.code)}
                className={`w-full flex items-center justify-between px-4 py-3.5 border font-mono-code text-sm transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#1D0B29] border-[#00F0FF] text-white'
                    : 'bg-[#1D0B29]/60 border-[#3A007A] text-[#D5C0D7] hover:border-[#9D8BA0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#9D8BA0]" />
                  )}
                  <span className="font-semibold">{item.label}</span>
                </div>
                {isSelected && (
                  <span className="px-2 py-0.5 bg-[#00F0FF] text-[#002022] font-mono-code text-[10px] font-bold uppercase">
                    {t('settings.active_badge')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ELEKTRON POCHTA matching Image 7 */}
      <div className="bg-[#261432] border border-[#3A007A] p-5 space-y-3">
        <div className="flex items-center gap-2 font-mono-code font-bold text-sm text-white uppercase">
          <Mail className="w-4 h-4 text-[#00F0FF]" />
          <span>{t('settings.sec_2_email')}</span>
        </div>

        <button
          type="button"
          onClick={onOpenChangeEmail}
          className="w-full py-3.5 px-4 bg-[#170624] hover:bg-[#1D0B29] border-2 border-[#00F0FF] text-[#00F0FF] font-mono-code font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer vox-cyan-glow"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>{t('settings.change_email_btn')}</span>
        </button>
      </div>

      {/* 3. SHRIFT O'LCHAMI (Font Size) matching Image 7 */}
      <div className="bg-[#261432] border border-[#3A007A] p-5 space-y-3">
        <div className="flex items-center gap-2 font-mono-code font-bold text-sm text-white uppercase">
          <Type className="w-4 h-4 text-[#E066FF]" />
          <span>{t('settings.sec_3_font')}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {fontOptions.map((opt) => {
            const active = fontScale === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => setFontScale(opt.mode)}
                className={`py-3 px-2 font-mono-code text-xs font-bold uppercase transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#00F0FF] text-[#002022] vox-cyan-glow'
                    : 'bg-[#1D0B29] text-[#D5C0D7] border border-[#3A007A] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. KIRISH PAROLI (Access Password) matching Image 7 */}
      <div className="bg-[#261432] border border-[#3A007A] p-5 space-y-3">
        <div className="flex items-center gap-2 font-mono-code font-bold text-sm text-white uppercase">
          <Shield className="w-4 h-4 text-[#FFB4AB]" />
          <span>{t('settings.sec_4_password')}</span>
        </div>

        <button
          type="button"
          onClick={onOpenChangePassword}
          className="w-full py-3.5 px-4 bg-[#BF00FF] hover:bg-[#E066FF] text-white font-mono-code font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer vox-purple-glow border-b-2 border-[#00F0FF]"
        >
          <Key className="w-4 h-4" />
          <span>{t('settings.change_password_btn')}</span>
        </button>
      </div>

      {/* 5. UNIFIED OAUTH 2.0 + PKCE LINKED ACCOUNTS */}
      <div className="bg-[#261432] border border-[#3A007A] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono-code font-bold text-sm text-white uppercase">
            <Link2 className="w-4 h-4 text-[#39FF14]" />
            <span>{t('settings.sec_5_oauth')}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {oauthPlatforms.map((plat) => {
            const info = connectedProviders[plat.id];
            const isConnected = Boolean(info?.connected);
            return (
              <div
                key={plat.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#170624] border border-[#3A007A]"
              >
                <div className="min-w-0">
                  <div className="font-display font-bold text-sm text-white uppercase">
                    {plat.name}
                  </div>
                  <div className="font-mono-code text-[11px] text-[#B39DDB]">
                    {isConnected ? (
                      <span className="text-[#39FF14]">
                        {info.handle} · {t('settings.connected_status')}
                      </span>
                    ) : (
                      <span>
                        {t('settings.disconnected_status')} ({plat.scope})
                      </span>
                    )}
                  </div>
                </div>

                {isConnected ? (
                  <button
                    type="button"
                    onClick={() => onOAuthDisconnect(plat.id)}
                    className="px-3 py-1.5 bg-[#93000A] hover:bg-[#FF0055] text-white font-mono-code text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>{t('settings.disconnect_btn')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOAuthConnect(plat.id)}
                    className="px-3 py-1.5 bg-[#00F0FF] hover:bg-[#7DF4FF] text-[#002022] font-mono-code text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>{t('settings.connect_btn')}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Security Verification Tools: 401 Silent Refresh Test & Flutter/Dart Code Export */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={onTest401Interceptor}
            className="py-2.5 px-3 bg-[#170624] hover:bg-[#352242] border border-[#39FF14] text-[#39FF14] font-mono-code text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="truncate">{t('settings.test_401_btn')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenFlutterCode}
            className="py-2.5 px-3 bg-[#170624] hover:bg-[#352242] border border-[#00F0FF] text-[#00F0FF] font-mono-code text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="truncate">{t('app.flutter_code_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
