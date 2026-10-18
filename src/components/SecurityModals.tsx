import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, Key, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n/i18n';
import {
  evaluatePasswordStrength,
  safeApiRequest,
  sanitizeUserInput,
  validateEmailFormat,
} from '../services/securityService';

interface ChangeEmailModalProps {
  isOpen: boolean;
  currentEmail: string;
  onClose: () => void;
  onSuccess: (newEmail: string) => void;
}

export const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
  isOpen,
  currentEmail,
  onClose,
  onSuccess,
}) => {
  const { t } = useI18n();
  const [newEmail, setNewEmail] = useState('yangi.pochta@domen.uz');
  const [currentPassword, setCurrentPassword] = useState('CyberVox#2026');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleaned = sanitizeUserInput(newEmail).toLowerCase();

    if (!validateEmailFormat(cleaned)) {
      setError('Invalid email address format.');
      return;
    }
    if (!currentPassword || currentPassword.length < 4) {
      setError('Re-authentication required: Enter your current password.');
      return;
    }

    setLoading(true);
    try {
      const data = await safeApiRequest<{ email: string }>('/api/auth/email', {
        method: 'PUT',
        body: JSON.stringify({ newEmail: cleaned, currentPassword }),
      });
      onSuccess(data.email || cleaned);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Matches Image 10: EMAILNI O'ZGARTIRISH */}
      <div className="w-full max-w-md bg-[#261432] border-t-2 border-t-[#00F0FF] border border-[#3A007A] vox-cyan-glow">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3A007A]">
          <div className="flex items-center gap-2">
            <span className="text-[#00F0FF] font-mono-code font-bold text-lg">@</span>
            <h2 className="font-display font-bold text-lg text-white uppercase">
              {t('modals.change_email_title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#352242] hover:bg-[#453152] text-[#D5C0D7] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-[#93000A] border border-[#FF0055] text-white font-mono-code text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-mono-code text-xs text-[#B39DDB] uppercase">
              <span>{t('modals.current_email')}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14]" />
            </label>
            <div className="flex items-center bg-[#170624] border border-[#3A007A] px-3 py-2.5 text-[#D5C0D7] font-mono-code text-sm">
              <Mail className="w-4 h-4 text-[#9D8BA0] mr-2.5 shrink-0" />
              <span className="truncate">{currentEmail}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono-code text-xs text-[#F3DAFF] uppercase">
              {t('modals.new_email')}
            </label>
            <div className="flex items-center bg-[#170624] border border-[#3A007A] focus-within:border-[#00F0FF] px-3 py-2.5">
              <Mail className="w-4 h-4 text-[#00F0FF] mr-2.5 shrink-0" />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-transparent text-white font-mono-code text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono-code text-xs text-[#F3DAFF] uppercase">
              {t('modals.current_password')}
            </label>
            <div className="flex items-center bg-[#170624] border border-[#3A007A] focus-within:border-[#00F0FF] px-3 py-2.5">
              <Lock className="w-4 h-4 text-[#E066FF] mr-2.5 shrink-0" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-transparent text-white font-mono-code text-sm focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="text-[#9D8BA0] hover:text-white ml-2 cursor-pointer"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00F0FF] hover:bg-[#7DF4FF] text-[#002022] font-mono-code font-bold text-sm uppercase flex items-center justify-center gap-2 cursor-pointer"
              style={{ boxShadow: '0 0 16px rgba(0, 240, 255, 0.4)' }}
            >
              <Mail className="w-4 h-4" />
              <span>{t('modals.save_email_btn')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-[#1D0B29] hover:bg-[#352242] text-[#D5C0D7] font-mono-code text-xs uppercase cursor-pointer"
            >
              {t('modals.cancel_plain')}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between px-5 py-2.5 bg-[#170624] border-t border-[#3A007A] font-mono-code text-[11px]">
          <span className="text-[#9D8BA0]">SEC_CH_256</span>
          <span className="text-[#39FF14]">■ {t('modals.encrypted_badge')}</span>
        </div>
      </div>
    </div>
  );
};

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useI18n();
  const [oldPassword, setOldPassword] = useState('CyberVox#2025');
  const [newPassword, setNewPassword] = useState('CyberVox#2026!Ultra');
  const [confirmPassword, setConfirmPassword] = useState('CyberVox#2026!Ultra');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!strength.valid) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Confirmation password does not match.');
      return;
    }

    setLoading(true);
    try {
      await safeApiRequest('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Matches Image 5: Parolni O'zgartirish */}
      <div className="w-full max-w-md bg-[#261432] border border-[#514254] vox-purple-glow">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#352242] border-b border-[#514254]">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#ECB1FF]" />
            <h2 className="font-display font-bold text-lg text-white">
              {t('modals.change_pwd_title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#93000A] hover:bg-[#FF0055] text-white border-b-2 border-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-[#93000A] border border-[#FF0055] text-white font-mono-code text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block font-mono-code text-xs text-[#D5C0D7] uppercase">
              {t('modals.old_password')}
            </label>
            <div className="flex items-center bg-[#170624] border border-[#3A007A] focus-within:border-[#00F0FF] px-3 py-2.5">
              <Key className="w-4 h-4 text-[#9D8BA0] mr-2.5 shrink-0" />
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-transparent text-white font-mono-code text-sm focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowOld((p) => !p)}
                className="text-[#D3FBFF] ml-2 cursor-pointer"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono-code text-xs text-[#D5C0D7] uppercase">
                {t('modals.new_password')}
              </label>
              <span className="font-mono-code text-[10px] text-[#39FF14]">
                STRENGTH: {strength.label}
              </span>
            </div>
            <div className="flex items-center bg-[#170624] border border-[#3A007A] focus-within:border-[#00F0FF] px-3 py-2.5">
              <Lock className="w-4 h-4 text-[#9D8BA0] mr-2.5 shrink-0" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-transparent text-white font-mono-code text-sm focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="text-[#D3FBFF] ml-2 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono-code text-xs text-[#D5C0D7] uppercase">
              {t('modals.confirm_new_password')}
            </label>
            <div className="flex items-center bg-[#170624] border border-[#3A007A] focus-within:border-[#00F0FF] px-3 py-2.5">
              <ShieldCheck className="w-4 h-4 text-[#9D8BA0] mr-2.5 shrink-0" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent text-white font-mono-code text-sm focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="text-[#D3FBFF] ml-2 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#BF00FF] hover:bg-[#E066FF] text-white font-mono-code font-bold text-sm flex items-center justify-center gap-2 cursor-pointer vox-purple-glow"
            >
              <Key className="w-4 h-4 text-[#FFD700]" />
              <span>{t('modals.save_pwd_btn')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-[#1D0B29] hover:bg-[#352242] text-[#D5C0D7] font-mono-code text-xs cursor-pointer"
            >
              × {t('modals.cancel_bracket')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
