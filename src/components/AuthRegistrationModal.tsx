import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, User, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useI18n } from '../i18n/i18n';
import {
  safeApiRequest,
  sanitizeUserInput,
  validateEmailFormat,
} from '../services/securityService';

interface AuthRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOAuthConnect?: (provider: string) => void;
  onSuccessAuth: (profile: {
    fullName: string;
    nickname: string;
    email: string;
  }) => void;
  connectedProviders?: Record<string, { connected: boolean; handle: string }>;
}

export const AuthRegistrationModal: React.FC<AuthRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccessAuth,
}) => {
  const { t } = useI18n();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = sanitizeUserInput(email).trim();
    const cleanNick = sanitizeUserInput(nickname).replace(/^@+/, '').trim();

    if (!cleanEmail) {
      setErrorMsg(t('auth.email_label') + ' kiritilishi shart');
      return;
    }

    if (!validateEmailFormat(cleanEmail)) {
      setErrorMsg('Elektron pochta manzili noto‘g‘ri kiritildi (masalan: misol@gmail.com)');
      return;
    }

    if (mode === 'register') {
      if (cleanNick.length < 2) {
        setErrorMsg('Ismingiz yoki taxallusingiz kamida 2 ta belgidan iborat bo‘lsin');
        return;
      }
    }

    if (password.length < 6) {
      setErrorMsg('Parol kamida 6 ta belgidan iborat bo‘lishi lozim');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const data = await safeApiRequest<{
        success: boolean;
        profile: { fullName: string; nickname: string; email: string };
      }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          nickname: cleanNick || cleanEmail.split('@')[0],
          email: cleanEmail,
          password,
        }),
      });
      onSuccessAuth({
        fullName: data.profile.fullName || cleanNick || cleanEmail.split('@')[0],
        nickname: data.profile.nickname || cleanNick || cleanEmail.split('@')[0],
        email: data.profile.email || cleanEmail,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Tizimga ulanishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-[#160527] border-2 border-[#BF00FF]/60 rounded-2xl relative shadow-[0_0_40px_rgba(191,0,255,0.35)] overflow-hidden my-auto">
        {/* Subtle accent glow line at top */}
        <div className="h-1 w-full bg-gradient-to-r from-[#00F0FF] via-[#BF00FF] to-[#39FF14]" />

        <div className="p-6 sm:p-7 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl text-white tracking-wide">
                {mode === 'register' ? t('auth.register_title') : t('auth.login_title')}
              </h2>
              <p className="text-xs text-[#C8B3D6] mt-1">
                {mode === 'register'
                  ? "VOX HUB dan to'liq foydalanish uchun hisobingizni oching"
                  : "O'z hisobingiz ma'lumotlarini kiriting"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#250E3A] hover:bg-[#391759] text-[#C8B3D6] hover:text-white border border-[#4E1E78] transition-colors cursor-pointer shrink-0 ml-3"
              aria-label="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#7A0B1A]/80 border border-[#FF2A6D] text-white text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A6D] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Streamlined Registration / Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#D7C4E2] uppercase tracking-wider">
                  {t('auth.username_label')}
                </label>
                <div className="flex items-center bg-[#0C0117] border border-[#4E1E78] focus-within:border-[#00F0FF] focus-within:ring-1 focus-within:ring-[#00F0FF] rounded-xl px-3.5 py-3 transition-colors">
                  <User className="w-4 h-4 text-[#BF00FF] mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-transparent text-white text-sm placeholder:text-[#786487] focus:outline-none"
                    placeholder="Masalan: Temur yoki ahrorbek"
                    autoFocus
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#D7C4E2] uppercase tracking-wider">
                {t('auth.email_label')}
              </label>
              <div className="flex items-center bg-[#0C0117] border border-[#4E1E78] focus-within:border-[#00F0FF] focus-within:ring-1 focus-within:ring-[#00F0FF] rounded-xl px-3.5 py-3 transition-colors">
                <Mail className="w-4 h-4 text-[#BF00FF] mr-2.5 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-white text-sm placeholder:text-[#786487] focus:outline-none"
                  placeholder="elektron_pochta@manzil.uz"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#D7C4E2] uppercase tracking-wider">
                {t('auth.password_label')}
              </label>
              <div className="flex items-center bg-[#0C0117] border border-[#4E1E78] focus-within:border-[#00F0FF] focus-within:ring-1 focus-within:ring-[#00F0FF] rounded-xl px-3.5 py-3 transition-colors">
                <Lock className="w-4 h-4 text-[#BF00FF] mr-2.5 shrink-0" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-white text-sm placeholder:text-[#786487] focus:outline-none"
                  placeholder="Kamida 6 ta belgi"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="text-[#9D8BA0] hover:text-white ml-2 p-1 cursor-pointer transition-colors"
                  aria-label={showPwd ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-[#9900CC] via-[#BF00FF] to-[#9900CC] hover:brightness-110 active:scale-[0.99] text-white font-display font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(191,0,255,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 mt-3"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'register' ? t('auth.create_account_btn') : t('auth.login_submit_btn')}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#00F0FF]" />
                </>
              )}
            </button>
          </form>

          {/* Switch Mode Footer */}
          <div className="pt-2 text-center border-t border-[#3A145E]/60 flex items-center justify-center gap-2 text-xs text-[#B49EC1]">
            <span>
              {mode === 'register' ? t('auth.already_have_account') : t('auth.no_account_yet')}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === 'register' ? 'login' : 'register'));
                setErrorMsg(null);
              }}
              className="font-bold text-[#00F0FF] hover:underline cursor-pointer uppercase transition-colors"
            >
              {mode === 'register' ? t('auth.switch_to_login') : t('auth.switch_to_register')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
