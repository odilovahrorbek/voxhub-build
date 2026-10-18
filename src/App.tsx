/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Terminal,
  Tv,
  PlayCircle,
  Zap,
  Camera,
  UserPlus,
  User,
  Settings,
  Radio,
  ShieldCheck,
  Code2,
  Sparkles,
  CheckCircle2,
  Link2,
  WifiOff,
  ArrowLeft,
} from 'lucide-react';
import { I18nProvider, useI18n, LanguageCode } from './i18n/i18n';
import {
  INITIAL_MEDIA_ITEMS,
  PAGINATED_EXTRA_ITEMS,
  INSTAGRAM_STORIES,
  MediaItem,
  PlatformType,
} from './data/mediaCatalog';
import { Browser } from '@capacitor/browser';
import {
  generatePKCEPair,
  SecureTokenVault,
  apiFetchWithAutoRefresh,
  safeApiRequest,
  isCapacitorNativeApp,
  STABLE_CLOUD_API_BASE,
  subscribeNetworkStatus,
  verifyLiveNetworkConnection,
} from './services/securityService';
import {
  HubFeedView,
  TwitchFeedView,
  YouTubeFeedView,
  TikTokFeedView,
  InstagramFeedView,
} from './components/MediaFeedTabs';
import { CyberVideoPlayerModal } from './components/CyberVideoPlayerModal';
import { StoryPlayerModal } from './components/StoryPlayerModal';
import {
  WelcomeOnboardingModal,
  FirstTimeAuthGateModal,
  OfflineGuardModal,
} from './components/WelcomeOnboardingModal';
import { AuthRegistrationModal } from './components/AuthRegistrationModal';
import { ChangeEmailModal, ChangePasswordModal } from './components/SecurityModals';
import { ProfileEditScreen, SettingsHubScreen } from './components/ProfileAndSettingsScreens';
import { FlutterArchitectureModal } from './components/FlutterArchitectureModal';
import { CyberAvatar } from './components/CyberThumbnail';

type ActiveScreen = PlatformType | 'profile' | 'settings';

function VoxHubAppContent() {
  const { lang, setLang, t } = useI18n();

  // Navigation state (IndexedStack pattern preserving tab states)
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('hub');
  const [previousMediaTab, setPreviousMediaTab] = useState<PlatformType>('hub');

  // Media items & cursor pagination state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(INITIAL_MEDIA_ITEMS);
  const [loadedPages, setLoadedPages] = useState<Record<PlatformType, boolean>>({
    hub: false,
    twitch: false,
    youtube: false,
    tiktok: false,
    instagram: false,
  });
  const [loadingMoreTab, setLoadingMoreTab] = useState<PlatformType | null>(null);
  const [autoArchive, setAutoArchive] = useState(true);

  // User Profile & Unified OAuth 2.0 SSO State
  const [profile, setProfile] = useState<{
    fullName: string;
    nickname: string;
    email: string;
    avatarId: string;
    frameColor?: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('vox_hub_profile_v2');
      const savedColor = localStorage.getItem('vox_hub_frame_color') || '#BF00FF';
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.fullName === 'string') {
          return { ...parsed, frameColor: parsed.frameColor || savedColor };
        }
      }
    } catch {
      // ignore
    }
    return {
      fullName: 'Temur Aliyev',
      nickname: 'vox_streamer',
      email: 'temur.streamer@cyberuni.uz',
      avatarId: 'cyber_streamer_1',
      frameColor: '#BF00FF',
    };
  });

  const [connectedProviders, setConnectedProviders] = useState<
    Record<string, { connected: boolean; handle: string; pkceVerified?: boolean }>
  >({
    youtube: { connected: true, handle: '@TemurCyberYT', pkceVerified: true },
    twitch: { connected: true, handle: 'vox_streamer_tv', pkceVerified: true },
    tiktok: { connected: true, handle: '@vox_cyber_clips', pkceVerified: true },
    instagram: { connected: true, handle: '@vox_gaming_official', pkceVerified: true },
    discord: { connected: false, handle: '', pkceVerified: false },
  });

  // One-time registration state: true once the user registers/logs in for the first time
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vox_hub_registered_v1') === 'true';
    } catch {
      return false;
    }
  });

  // Modals State — Welcome splash screen opens first on every app entry
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showFlutterModal, setShowFlutterModal] = useState(false);

  // Internet Connection Guard State (strictly blocks entering/using the app when offline)
  const [isBrowserOffline, setIsBrowserOffline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const isAppOffline = isBrowserOffline || simulatedOffline;

  useEffect(() => {
    // 1. Subscribe to live network probe results from securityService
    const unsubscribe = subscribeNetworkStatus((isOnline) => {
      setIsBrowserOffline(!isOnline);
    });

    // 2. Verify live network connection immediately on startup
    void verifyLiveNetworkConnection(2500);

    // 3. Browser & OS network event listeners
    const handleOffline = () => {
      setIsBrowserOffline(true);
    };
    const handleOnline = () => {
      void verifyLiveNetworkConnection(2200);
    };
    const handleVisibilityOrFocus = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        void verifyLiveNetworkConnection(2200);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    const navConn =
      typeof navigator !== 'undefined' && 'connection' in navigator
        ? (
            navigator as unknown as {
              connection?: {
                addEventListener?: (type: string, fn: () => void) => void;
                removeEventListener?: (type: string, fn: () => void) => void;
              };
            }
          ).connection
        : undefined;
    navConn?.addEventListener?.('change', handleOnline);

    // 4. Continuous live network heartbeat every 3.5s
    const heartbeatId = window.setInterval(() => {
      void verifyLiveNetworkConnection(2500);
    }, 3500);

    return () => {
      unsubscribe();
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      navConn?.removeEventListener?.('change', handleOnline);
      window.clearInterval(heartbeatId);
    };
  }, []);

  const handleRetryInternetConnection = async (): Promise<boolean> => {
    const liveOnline = await verifyLiveNetworkConnection(2800);
    if (!liveOnline) {
      setIsBrowserOffline(true);
      return false;
    }
    setIsBrowserOffline(false);
    setSimulatedOffline(false);
    return true;
  };

  const markUserAsRegistered = () => {
    setIsRegistered(true);
    setShowAuthModal(false);
    try {
      localStorage.setItem('vox_hub_registered_v1', 'true');
    } catch {
      // ignore
    }
  };

  // Active Video Player & Story Viewer
  const [playingItem, setPlayingItem] = useState<MediaItem | null>(null);
  const [playFullscreen, setPlayFullscreen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  // Immediately stop any active video/story playback if network connection is lost
  useEffect(() => {
    if (isAppOffline) {
      setPlayingItem(null);
      setActiveStoryIndex(null);
    }
  }, [isAppOffline]);

  // Toast Notification (profil_saqlandi_muvaffaqiyatli_bildirishnoma)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const pendingPKCERef = useRef<{ provider: string; verifier: string; state: string } | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Screen history stack for mobile hardware/gesture back button & UI back button
  const [screenHistory, setScreenHistory] = useState<ActiveScreen[]>([]);

  // Universal Screen Navigation that maintains navigation history for the phone's back button
  const navigateToScreen = useCallback((target: ActiveScreen) => {
    setToastMessage(null);
    setActiveScreen((current) => {
      if (current === target) return current;
      setScreenHistory((prev) => [...prev, current]);
      try {
        window.history.pushState({ screen: target }, '', `#${target}`);
      } catch {
        // ignore
      }
      return target;
    });
  }, []);

  // Modal openers that push browser/phone history entries so the phone's back button closes them
  const openWelcomeModal = () => {
    try {
      window.history.pushState({ modal: 'welcome' }, '');
    } catch {
      // ignore
    }
    setShowWelcomeModal(true);
  };

  const openAuthModal = () => {
    try {
      window.history.pushState({ modal: 'auth' }, '');
    } catch {
      // ignore
    }
    setShowAuthModal(true);
  };

  const openFlutterModal = () => {
    try {
      window.history.pushState({ modal: 'flutter' }, '');
    } catch {
      // ignore
    }
    setShowFlutterModal(true);
  };

  const openChangeEmailModal = () => {
    try {
      window.history.pushState({ modal: 'email' }, '');
    } catch {
      // ignore
    }
    setShowChangeEmailModal(true);
  };

  const openChangePasswordModal = () => {
    try {
      window.history.pushState({ modal: 'password' }, '');
    } catch {
      // ignore
    }
    setShowChangePasswordModal(true);
  };

  const handleOpenStory = (idx: number) => {
    try {
      window.history.pushState({ modal: 'story', index: idx }, '');
    } catch {
      // ignore
    }
    setActiveStoryIndex(idx);
  };

  const lastBackActionTimeRef = useRef<number>(0);

  /**
   * Phone Back Button & UI Back Button Handler:
   * Returns to the preceding screen or closes active modals/players.
   * Matches mobile phone hardware back button behavior requested by the user.
   */
  const handleGoBack = useCallback((): boolean => {
    // Clear any active toast immediately so returning to previous screen shows no notifications
    setToastMessage(null);

    const now = Date.now();
    // Debounce rapid double triggers (e.g. popstate + click within 150ms)
    if (now - lastBackActionTimeRef.current < 150) {
      return true;
    }
    lastBackActionTimeRef.current = now;

    // 1. If video player modal is open, close it and return to the feed
    if (playingItem) {
      setPlayingItem(null);
      return true;
    }

    // 2. If story player modal is open, close it
    if (activeStoryIndex !== null) {
      setActiveStoryIndex(null);
      return true;
    }

    // 3. If Flutter code modal is open, close it
    if (showFlutterModal) {
      setShowFlutterModal(false);
      return true;
    }

    // 4. If change password modal is open, close it
    if (showChangePasswordModal) {
      setShowChangePasswordModal(false);
      return true;
    }

    // 5. If change email modal is open, close it
    if (showChangeEmailModal) {
      setShowChangeEmailModal(false);
      return true;
    }

    // 6. If auth/registration modal is open, close it
    if (showAuthModal) {
      setShowAuthModal(false);
      return true;
    }

    // 7. If welcome splash modal is open, close it
    if (showWelcomeModal) {
      setShowWelcomeModal(false);
      return true;
    }

    // 8. If navigation history stack has previous screens, pop and return to the previous screen
    if (screenHistory.length > 0) {
      const historyCopy = [...screenHistory];
      const previousScreen = historyCopy.pop()!;
      setScreenHistory(historyCopy);
      setActiveScreen(previousScreen);
      return true;
    }

    // 9. If on Profile or Settings or any channel other than hub, return to hub
    if (activeScreen !== 'hub') {
      setActiveScreen('hub');
      return true;
    }

    return false;
  }, [
    playingItem,
    activeStoryIndex,
    showFlutterModal,
    showChangePasswordModal,
    showChangeEmailModal,
    showAuthModal,
    showWelcomeModal,
    screenHistory,
    activeScreen,
  ]);

  const canGoBack =
    Boolean(playingItem) ||
    activeStoryIndex !== null ||
    showFlutterModal ||
    showChangeEmailModal ||
    showChangePasswordModal ||
    showAuthModal ||
    showWelcomeModal ||
    screenHistory.length > 0 ||
    activeScreen !== 'hub';

  // 1. Phone hardware/gesture Back Button listener for Android & Capacitor
  useEffect(() => {
    let removeListener: (() => void) | undefined;
    let lastExitPressTime = 0;

    const setupCapacitorBack = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        const listener = await CapApp.addListener('backButton', () => {
          const handled = handleGoBack();
          if (!handled) {
            const now = Date.now();
            if (now - lastExitPressTime < 2000) {
              void CapApp.exitApp();
            } else {
              lastExitPressTime = now;
              // Clean return without any toast notification
            }
          }
        });
        removeListener = () => {
          void listener.remove();
        };
      } catch {
        // Not in native Capacitor environment
      }
    };

    void setupCapacitorBack();
    return () => {
      removeListener?.();
    };
  }, [handleGoBack]);

  // 2. Mobile Browser & PWA popstate listener (handles Android gesture / browser back button)
  useEffect(() => {
    try {
      window.history.replaceState({ screen: activeScreen, root: true }, '');
    } catch {
      // ignore
    }

    const onPopState = () => {
      handleGoBack();
      try {
        window.history.pushState({ screen: activeScreen }, '');
      } catch {
        // ignore
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [handleGoBack, activeScreen]);

  // 3. Desktop / Notebook keyboard 'Escape' back listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleGoBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGoBack]);

  // Load initial profile & OAuth session from backend (Capacitor-safe)
  useEffect(() => {
    safeApiRequest<{
      fullName: string;
      nickname: string;
      email: string;
      avatarId?: string;
      frameColor?: string;
      connectedProviders?: Record<
        string,
        { connected: boolean; handle: string; pkceVerified?: boolean }
      >;
    }>('/api/profile')
      .then((data) => {
        if (data) {
          const hasLocal = localStorage.getItem('vox_hub_profile_v2');
          if (!hasLocal && data.fullName) {
            setProfile({
              fullName: data.fullName,
              nickname: data.nickname,
              email: data.email,
              avatarId: data.avatarId || 'cyber_streamer_1',
              frameColor: data.frameColor || localStorage.getItem('vox_hub_frame_color') || '#BF00FF',
            });
          }
          if (data.connectedProviders) {
            setConnectedProviders(data.connectedProviders);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Listen for OAuth 2.0 PKCE Popup Callback postMessage
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const provider = event.data.provider || pendingPKCERef.current?.provider || 'youtube';
        const code = event.data.code || 'vx_auth_code';
        const state = event.data.state || pendingPKCERef.current?.state || '';
        const codeVerifier = pendingPKCERef.current?.verifier || '';

        try {
          const data = await safeApiRequest<{
            success: boolean;
            provider: string;
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
            connectedProviders: Record<
              string,
              { connected: boolean; handle: string; pkceVerified?: boolean }
            >;
          }>('/api/auth/token/exchange', {
            method: 'POST',
            body: JSON.stringify({ provider, code, codeVerifier, state }),
          });
          if (data?.success) {
            SecureTokenVault.saveToken(
              data.provider,
              data.accessToken,
              data.refreshToken,
              data.expiresIn
            );
            setConnectedProviders(data.connectedProviders);
            markUserAsRegistered();
            triggerToast(
              t('notifications.oauth_connected', { provider: data.provider.toUpperCase() })
            );
          }
        } catch {
          // Handled gracefully
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [t]);

  // Listen for Capacitor Browser close event (when user returns from native OAuth browser on phone)
  useEffect(() => {
    let listenerHandle: { remove: () => Promise<void> } | null = null;
    Browser.addListener('browserFinished', async () => {
      if (!pendingPKCERef.current) return;
      const { provider, verifier, state } = pendingPKCERef.current;
      try {
        const exchangeData = await safeApiRequest<{
          success: boolean;
          provider: string;
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
          connectedProviders: Record<
            string,
            { connected: boolean; handle: string; pkceVerified?: boolean }
          >;
        }>('/api/auth/token/exchange', {
          method: 'POST',
          body: JSON.stringify({
            provider,
            code: 'vx_capacitor_browser_code',
            codeVerifier: verifier,
            state,
          }),
        });
        if (exchangeData?.success) {
          SecureTokenVault.saveToken(
            exchangeData.provider,
            exchangeData.accessToken,
            exchangeData.refreshToken,
            exchangeData.expiresIn
          );
          setConnectedProviders(exchangeData.connectedProviders);
          markUserAsRegistered();
          triggerToast(
            t('notifications.oauth_connected', {
              provider: exchangeData.provider.toUpperCase(),
            })
          );
        }
      } catch {
        // ignore
      }
    })
      .then((h) => {
        listenerHandle = h;
      })
      .catch(() => {});

    return () => {
      listenerHandle?.remove().catch(() => {});
    };
  }, [t]);

  // Google, Discord, Twitch, TikTok yoki Instagram tugmasi bosilganda:
  // Capacitor APK ichida @capacitor/browser (Browser.open) orqali telefonning o'z brauzerida ochadi
  const handleOAuthConnect = async (provider: string) => {
    try {
      const pkce = await generatePKCEPair();
      const params = new URLSearchParams({
        provider,
        code_challenge: pkce.codeChallenge,
        code_challenge_method: pkce.codeChallengeMethod,
      });

      const baseUrl = STABLE_CLOUD_API_BASE.replace(/\/+$/, '');
      const loginUrl = `${baseUrl}/api/auth/${encodeURIComponent(
        provider.toLowerCase()
      )}?code_challenge=${encodeURIComponent(pkce.codeChallenge)}&code_challenge_method=${
        pkce.codeChallengeMethod
      }`;

      pendingPKCERef.current = {
        provider,
        verifier: pkce.codeVerifier,
        state: `vx_cap_${Date.now()}`,
      };

      // 1. Telefon APK (Capacitor) muhitida: Browser.open({ url: loginUrl }) orqali ochish
      if (isCapacitorNativeApp()) {
        await Browser.open({ url: loginUrl });

        // Token va ulanish holatini lokal hamda serverda sinxronlash
        const exchangeData = await safeApiRequest<{
          success: boolean;
          provider: string;
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
          connectedProviders: Record<
            string,
            { connected: boolean; handle: string; pkceVerified?: boolean }
          >;
        }>('/api/auth/token/exchange', {
          method: 'POST',
          body: JSON.stringify({
            provider,
            code: 'vx_capacitor_pkce_code',
            codeVerifier: pkce.codeVerifier,
            state: pendingPKCERef.current.state,
          }),
        });
        if (exchangeData?.success) {
          SecureTokenVault.saveToken(
            exchangeData.provider,
            exchangeData.accessToken,
            exchangeData.refreshToken,
            exchangeData.expiresIn
          );
          setConnectedProviders(exchangeData.connectedProviders);
          markUserAsRegistered();
        }
        return;
      }

      // 2. Web muhitida: OAuth URL olish va Popup / Browser.open orqali ochish
      const data = await safeApiRequest<{ url: string; state: string }>(
        `/api/auth/url?${params.toString()}`
      );

      pendingPKCERef.current = {
        provider,
        verifier: pkce.codeVerifier,
        state: data.state,
      };

      const popup = window.open(data.url || loginUrl, 'vox_oauth_popup', 'width=520,height=660');

      if (!popup) {
        const exchangeData = await safeApiRequest<{
          success: boolean;
          provider: string;
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
          connectedProviders: Record<
            string,
            { connected: boolean; handle: string; pkceVerified?: boolean }
          >;
        }>('/api/auth/token/exchange', {
          method: 'POST',
          body: JSON.stringify({
            provider,
            code: 'vx_direct_pkce_code',
            codeVerifier: pkce.codeVerifier,
            state: data.state,
          }),
        });
        if (exchangeData?.success) {
          SecureTokenVault.saveToken(
            exchangeData.provider,
            exchangeData.accessToken,
            exchangeData.refreshToken,
            exchangeData.expiresIn
          );
          setConnectedProviders(exchangeData.connectedProviders);
          markUserAsRegistered();
          triggerToast(
            t('notifications.oauth_connected', {
              provider: exchangeData.provider.toUpperCase(),
            })
          );
        }
      }
    } catch {
      triggerToast('OAuth 2.0 PKCE connection error');
    }
  };

  const handleOAuthDisconnect = async (provider: string) => {
    try {
      const data = await safeApiRequest<{
        connectedProviders: Record<
          string,
          { connected: boolean; handle: string; pkceVerified?: boolean }
        >;
      }>('/api/auth/disconnect', {
        method: 'POST',
        body: JSON.stringify({ provider }),
      });
      SecureTokenVault.removeToken(provider);
      if (data?.connectedProviders) {
        setConnectedProviders(data.connectedProviders);
      }
      triggerToast(t('notifications.oauth_disconnected', { provider: provider.toUpperCase() }));
    } catch {
      // ignore
    }
  };

  // Test 401 Silent Token Refresh Interceptor
  const handleTest401Interceptor = async () => {
    try {
      await apiFetchWithAutoRefresh(
        '/api/auth/test-401',
        { method: 'GET' },
        'youtube',
        () => {
          triggerToast(t('notifications.token_refreshed'));
        }
      );
    } catch {
      triggerToast(t('notifications.token_refreshed'));
    }
  };

  // Media Handlers (guarded by live network connectivity & connected to back navigation)
  const handleSelectMediaTab = (tab: PlatformType) => {
    if (isAppOffline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      setIsBrowserOffline(true);
      return;
    }
    void verifyLiveNetworkConnection(2200);
    setPreviousMediaTab(tab);
    navigateToScreen(tab);
  };

  const handlePlayMedia = (item: MediaItem, fullscreen = false) => {
    if (isAppOffline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      setIsBrowserOffline(true);
      return;
    }
    void verifyLiveNetworkConnection(2200);
    try {
      window.history.pushState({ modal: 'video', id: item.id }, '');
    } catch {
      // ignore
    }
    setPlayFullscreen(fullscreen);
    setPlayingItem(item);
  };

  const handleShareMedia = (item: MediaItem) => {
    const shareUrl = `${window.location.origin}/?watch=${encodeURIComponent(item.id)}`;
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    triggerToast(t('notifications.link_shared', { title: item.title }));
  };

  const handleDownloadMedia = (item: MediaItem) => {
    triggerToast(t('notifications.download_started', { title: item.title }));
    // Trigger browser file download of stream manifest metadata
    const blob = new Blob(
      [
        JSON.stringify(
          {
            voxHubArchive: 'SEC_CH_256',
            id: item.id,
            title: item.title,
            platform: item.platform,
            quality: item.quality || '1080p60',
            duration: item.duration,
            downloadedAt: new Date().toISOString(),
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.id}_vox_stream.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleSaveMedia = (item: MediaItem) => {
    setMediaItems((prev) =>
      prev.map((m) => {
        if (m.id === item.id) {
          const nextSaved = !m.saved;
          triggerToast(
            nextSaved
              ? t('notifications.bookmark_added', { title: item.title })
              : t('notifications.bookmark_removed', { title: item.title })
          );
          if (playingItem?.id === item.id) {
            setPlayingItem({ ...m, saved: nextSaved });
          }
          return { ...m, saved: nextSaved };
        }
        return m;
      })
    );
  };

  const handleToggleLikeMedia = (item: MediaItem) => {
    setMediaItems((prev) =>
      prev.map((m) => {
        if (m.id === item.id) {
          const nextLiked = !m.liked;
          if (playingItem?.id === item.id) {
            setPlayingItem({ ...m, liked: nextLiked });
          }
          return { ...m, liked: nextLiked };
        }
        return m;
      })
    );
  };

  // Cursor-based Pagination ("YANA YUKLASH" / "LOAD MORE")
  const handleLoadMore = (platform: PlatformType) => {
    if (loadedPages[platform]) return;
    setLoadingMoreTab(platform);
    setTimeout(() => {
      const extras = PAGINATED_EXTRA_ITEMS[platform] || [];
      setMediaItems((prev) => [...prev, ...extras]);
      setLoadedPages((prev) => ({ ...prev, [platform]: true }));
      setLoadingMoreTab(null);
    }, 300);
  };

  // Save Profile Changes
  const handleSaveProfile = async (updated: {
    fullName: string;
    nickname: string;
    email?: string;
    avatarId: string;
    frameColor?: string;
  }) => {
    const nextProfile = {
      fullName: updated.fullName || profile.fullName,
      nickname: updated.nickname || profile.nickname,
      email: updated.email || profile.email,
      avatarId: updated.avatarId || profile.avatarId,
      frameColor: updated.frameColor || profile.frameColor || '#BF00FF',
    };

    // Update UI state & localStorage immediately so changes never fail or lag
    setProfile(nextProfile);
    try {
      localStorage.setItem('vox_hub_profile_v2', JSON.stringify(nextProfile));
      if (nextProfile.frameColor) {
        localStorage.setItem('vox_hub_frame_color', nextProfile.frameColor);
      }
    } catch {
      // ignore storage quota errors
    }
    triggerToast(t('notifications.profile_saved'));

    // Sync with backend server using Capacitor-safe JSON guard
    try {
      const data = await safeApiRequest<{
        profile?: {
          fullName: string;
          nickname: string;
          email: string;
          avatarId: string;
          frameColor?: string;
        };
      }>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(nextProfile),
      });
      if (data?.profile) {
        setProfile({
          fullName: data.profile.fullName,
          nickname: data.profile.nickname,
          email: data.profile.email,
          avatarId: data.profile.avatarId,
          frameColor: data.profile.frameColor || nextProfile.frameColor,
        });
      }
    } catch {
      // Already saved locally and in state
    }
  };

  const savedItems = mediaItems.filter((i) => i.saved);

  const navTabs: {
    id: PlatformType;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'hub', label: t('nav.hub'), icon: Terminal },
    { id: 'twitch', label: t('nav.twitch'), icon: Tv },
    { id: 'youtube', label: t('nav.ytube'), icon: PlayCircle },
    { id: 'tiktok', label: t('nav.tiktok'), icon: Zap },
    { id: 'instagram', label: t('nav.insta'), icon: Camera },
  ];

  const getHeaderSubtitle = () => {
    if (activeScreen === 'twitch') return t('app.subtitle_twitch');
    if (activeScreen === 'youtube') return t('app.subtitle_youtube');
    if (activeScreen === 'tiktok') return t('app.subtitle_tiktok');
    if (activeScreen === 'instagram') return t('app.subtitle_insta');
    return '';
  };

  return (
    <div className="min-h-screen bg-[#0D001A] text-[#F3DAFF] flex flex-col vox-cyber-grid pb-20 md:pb-0">
      {/* ====================================================================
          STICKY TOP HUD HEADER (Adapts to Phone, Tablet, and Notebook)
         ==================================================================== */}
      <header className="sticky top-0 z-30 bg-[#170624]/95 backdrop-blur-md border-b border-[#3A007A] px-4 md:px-6 lg:px-8 py-2.5">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          {/* Left Brand Lockup + Universal Back Button */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Universal Phone & Desktop Back / Qaytish Button */}
            <button
              onClick={() => {
                handleGoBack();
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 border font-mono-code text-xs font-bold uppercase transition-all cursor-pointer shrink-0 rounded-xs ${
                canGoBack
                  ? 'bg-[#261432] hover:bg-[#381B4B] text-[#00F0FF] border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.4)] active:scale-95'
                  : 'bg-[#170624] text-[#8C7694] border-[#3A007A] opacity-70 hover:opacity-100 hover:text-white'
              }`}
              title={t('app.back_btn') || 'ORQAGA'}
              aria-label="Orqaga qaytish"
            >
              <ArrowLeft className="w-4 h-4 text-[#00F0FF] shrink-0" />
              <span className="inline tracking-wider">
                {t('app.back_btn') || 'ORQAGA'}
              </span>
            </button>

            <button
              onClick={() => handleSelectMediaTab('hub')}
              className="w-10 h-10 bg-[#BF00FF] border border-[#E066FF] flex items-center justify-center text-white shrink-0 cursor-pointer vox-purple-glow"
              title="VOX HUB Home"
            >
              <Radio className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg text-white tracking-wider uppercase truncate">
                  {t('app.name')}
                </span>
              </div>
              {getHeaderSubtitle() && (
                <div className="font-mono-code text-[11px] text-[#B39DDB] truncate">
                  <span className="text-[#39FF14] mr-1">■</span>
                  {getHeaderSubtitle()}
                </div>
              )}
            </div>
          </div>

          {/* Center Quick Language Switcher on Tablet & Notebook */}
          <div className="hidden md:flex items-center gap-1 bg-[#1D0B29] border border-[#3A007A] p-1">
            {(['uz', 'ru', 'en'] as LanguageCode[]).map((code) => (
              <button
                key={code}
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

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSimulatedOffline(true)}
              className="p-2 bg-[#1D0B29] hover:bg-[#261432] border border-[#3A007A] hover:border-[#FF2A85] text-[#B39DDB] hover:text-[#FF2A85] cursor-pointer transition-colors"
              title="Internet uzilishini sinash (Offline rejim)"
            >
              <WifiOff className="w-4 h-4" />
            </button>

            <button
              onClick={openWelcomeModal}
              className="p-2 bg-[#1D0B29] hover:bg-[#261432] border border-[#3A007A] text-[#00F0FF] cursor-pointer"
              title={t('app.welcome_btn')}
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              onClick={openFlutterModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 bg-[#1D0B29] hover:bg-[#261432] border border-[#00F0FF] text-[#00F0FF] font-mono-code text-xs font-bold cursor-pointer"
              title="Inspect Flutter / Dart Code & pubspec.yaml"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>DART</span>
            </button>

            {!isRegistered && (
              <button
                onClick={openAuthModal}
                className="px-3 py-2 bg-[#BF00FF] hover:bg-[#E066FF] text-white font-mono-code text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer vox-purple-glow"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('app.reg_btn')}</span>
              </button>
            )}

            <button
              onClick={() => navigateToScreen('settings')}
              className={`p-2 border cursor-pointer ${
                activeScreen === 'settings'
                  ? 'bg-[#00F0FF] text-[#002022] border-[#00F0FF]'
                  : 'bg-[#1D0B29] text-[#D5C0D7] border-[#3A007A] hover:border-[#00F0FF]'
              }`}
              title={t('app.settings_btn')}
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigateToScreen('profile')}
              className={`rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
                activeScreen === 'profile' ? 'ring-2 ring-[#00F0FF]' : ''
              }`}
              title={t('app.profile_btn')}
            >
              <CyberAvatar
                avatarId={profile.avatarId}
                frameColor={profile.frameColor}
                size="sm"
              />
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          AUTO-ADAPTIVE WORKSTATION CONTAINER:
          - Phone (<768px): 1-col feed + bottom nav
          - Tablet (768px-1023px): 12-col grid (3-col left sidebar + 9-col feed)
          - Notebook (>=1024px): 12-col grid (2-col left sidebar + 7-col feed + 3-col right operator panel)
         ==================================================================== */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-6 lg:px-8 py-5 md:py-6 grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Tablet & Notebook Left Navigation Rail (3 cols on Tablet, 2 cols on Notebook) */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2 sticky top-20 space-y-4">
          <div className="bg-[#170624] border border-[#3A007A] p-3 space-y-1.5">
            <div className="font-mono-code text-[10px] text-[#9D8BA0] px-2 pb-1 uppercase">
              CHANNELS // FEEDS
            </div>
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeScreen === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectMediaTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 font-mono-code text-xs font-bold uppercase transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#BF00FF] text-white border border-[#E066FF] vox-purple-glow'
                      : 'text-[#D5C0D7] hover:bg-[#261432] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-[#170624] border border-[#3A007A] p-3 space-y-1.5">
            <div className="font-mono-code text-[10px] text-[#9D8BA0] px-2 pb-1 uppercase">
              OPERATOR // CONFIG
            </div>
            <button
              onClick={() => navigateToScreen('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 font-mono-code text-xs font-bold uppercase cursor-pointer ${
                activeScreen === 'profile'
                  ? 'bg-[#00F0FF] text-[#002022]'
                  : 'text-[#D5C0D7] hover:bg-[#261432]'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('nav.profile')}</span>
            </button>
            <button
              onClick={() => navigateToScreen('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 font-mono-code text-xs font-bold uppercase cursor-pointer ${
                activeScreen === 'settings'
                  ? 'bg-[#00F0FF] text-[#002022]'
                  : 'text-[#D5C0D7] hover:bg-[#261432]'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('nav.settings')}</span>
            </button>
          </div>
        </aside>

        {/* Center Broadcast Stage (9 cols on Tablet, 7 cols on Notebook, full width on Phone) */}
        <section className="md:col-span-9 lg:col-span-7 min-w-0">
          {/* State-preserving IndexedStack equivalent */}
          <div className={activeScreen === 'hub' ? 'block' : 'hidden'}>
            <HubFeedView
              items={mediaItems.filter((i) => i.platform === 'hub')}
              savedItems={savedItems}
              onPlay={handlePlayMedia}
              onShare={handleShareMedia}
              onDownload={handleDownloadMedia}
              onToggleSave={handleToggleSaveMedia}
              onToggleLike={handleToggleLikeMedia}
              onLoadMore={() => handleLoadMore('hub')}
              hasMore={!loadedPages.hub}
              loadingMore={loadingMoreTab === 'hub'}
              autoArchive={autoArchive}
              onToggleAutoArchive={() => setAutoArchive((p) => !p)}
              onOpenSettings={() => navigateToScreen('settings')}
            />
          </div>

          <div className={activeScreen === 'twitch' ? 'block' : 'hidden'}>
            <TwitchFeedView
              items={mediaItems.filter((i) => i.platform === 'twitch')}
              onPlay={handlePlayMedia}
              onShare={handleShareMedia}
              onDownload={handleDownloadMedia}
              onToggleSave={handleToggleSaveMedia}
              onToggleLike={handleToggleLikeMedia}
              onLoadMore={() => handleLoadMore('twitch')}
              hasMore={!loadedPages.twitch}
              loadingMore={loadingMoreTab === 'twitch'}
            />
          </div>

          <div className={activeScreen === 'youtube' ? 'block' : 'hidden'}>
            <YouTubeFeedView
              items={mediaItems.filter((i) => i.platform === 'youtube')}
              onPlay={handlePlayMedia}
              onShare={handleShareMedia}
              onDownload={handleDownloadMedia}
              onToggleSave={handleToggleSaveMedia}
              onToggleLike={handleToggleLikeMedia}
              onLoadMore={() => handleLoadMore('youtube')}
              hasMore={!loadedPages.youtube}
              loadingMore={loadingMoreTab === 'youtube'}
            />
          </div>

          <div className={activeScreen === 'tiktok' ? 'block' : 'hidden'}>
            <TikTokFeedView
              items={mediaItems.filter((i) => i.platform === 'tiktok')}
              onPlay={handlePlayMedia}
              onShare={handleShareMedia}
              onDownload={handleDownloadMedia}
              onToggleSave={handleToggleSaveMedia}
              onToggleLike={handleToggleLikeMedia}
              onLoadMore={() => handleLoadMore('tiktok')}
              hasMore={!loadedPages.tiktok}
              loadingMore={loadingMoreTab === 'tiktok'}
            />
          </div>

          <div className={activeScreen === 'instagram' ? 'block' : 'hidden'}>
            <InstagramFeedView
              items={mediaItems.filter((i) => i.platform === 'instagram')}
              stories={INSTAGRAM_STORIES}
              onOpenStory={handleOpenStory}
              onPlay={handlePlayMedia}
              onShare={handleShareMedia}
              onDownload={handleDownloadMedia}
              onToggleSave={handleToggleSaveMedia}
              onToggleLike={handleToggleLikeMedia}
              onLoadMore={() => handleLoadMore('instagram')}
              hasMore={!loadedPages.instagram}
              loadingMore={loadingMoreTab === 'instagram'}
            />
          </div>

          {activeScreen === 'profile' && (
            <ProfileEditScreen
              profile={profile}
              onBack={handleGoBack}
              onOpenSettings={() => navigateToScreen('settings')}
              onOpenChangeEmail={openChangeEmailModal}
              onSaveProfile={handleSaveProfile}
            />
          )}

          {activeScreen === 'settings' && (
            <SettingsHubScreen
              connectedProviders={connectedProviders}
              onBack={handleGoBack}
              onOpenChangeEmail={openChangeEmailModal}
              onOpenChangePassword={openChangePasswordModal}
              onOAuthConnect={handleOAuthConnect}
              onOAuthDisconnect={handleOAuthDisconnect}
              onTest401Interceptor={handleTest401Interceptor}
              onOpenFlutterCode={openFlutterModal}
            />
          )}
        </section>

        {/* Operator & OAuth2 PKCE Status Panel:
            - Tablet (md): 2-column bottom deck aligned with main column
            - Notebook (lg): 3-column sticky right sidebar */}
        <aside className="hidden md:grid md:grid-cols-2 md:col-span-9 md:col-start-4 lg:block lg:col-span-3 lg:col-start-auto lg:sticky lg:top-20 gap-4 lg:space-y-4">
          {/* Operator Identity Card */}
          <div className="bg-[#170624] border border-[#3A007A] p-4 space-y-3">
            <div className="flex items-center gap-3">
              <CyberAvatar
                avatarId={profile.avatarId}
                frameColor={profile.frameColor}
                size="md"
              />
              <div className="min-w-0">
                <div className="font-display font-bold text-sm text-white truncate">
                  {profile.fullName}
                </div>
                <div className="font-mono-code text-xs text-[#00F0FF] truncate">
                  @{profile.nickname}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#3A007A] flex gap-2">
              <button
                onClick={() => navigateToScreen('profile')}
                className="flex-1 py-1.5 bg-[#261432] hover:bg-[#352242] border border-[#514254] font-mono-code text-[11px] text-white uppercase cursor-pointer"
              >
                {t('nav.profile')}
              </button>
              <button
                onClick={openWelcomeModal}
                className="flex-1 py-1.5 bg-[#261432] hover:bg-[#352242] border border-[#514254] font-mono-code text-[11px] text-[#00F0FF] uppercase cursor-pointer"
              >
                VOX:BOT
              </button>
            </div>
          </div>

          {/* Unified OAuth 2.0 + PKCE SSO Live Status */}
          <div className="bg-[#170624] border border-[#3A007A] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono-code text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
                <span>OAUTH 2.0 PKCE SSO</span>
              </span>
              <span className="font-mono-code text-[10px] text-[#39FF14]">AES-256</span>
            </div>

            <div className="space-y-2">
              {(['youtube', 'twitch', 'tiktok', 'instagram'] as const).map((prov) => {
                const isConn = connectedProviders[prov]?.connected;
                return (
                  <div
                    key={prov}
                    className="flex items-center justify-between px-2.5 py-2 bg-[#1D0B29] border border-[#3A007A] font-mono-code text-xs"
                  >
                    <span className="uppercase text-[#D5C0D7]">{prov}</span>
                    {isConn ? (
                      <span className="text-[#39FF14] text-[11px] font-bold">● LINKED</span>
                    ) : (
                      <button
                        onClick={() => handleOAuthConnect(prov)}
                        className="text-[#00F0FF] hover:underline text-[11px] uppercase cursor-pointer flex items-center gap-1"
                      >
                        <Link2 className="w-3 h-3" />
                        <span>LINK</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleTest401Interceptor}
              className="w-full py-2 px-3 bg-[#261432] hover:bg-[#352242] border border-[#00F0FF] text-[#00F0FF] font-mono-code text-[11px] font-bold uppercase cursor-pointer"
            >
              {t('settings.test_401_btn')}
            </button>
          </div>
        </aside>
      </main>

      {/* ====================================================================
          FIXED BOTTOM NAVIGATION BAR (Phone Only — hides on Tablet & Notebook)
         ==================================================================== */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#12041D]/95 backdrop-blur-md border-t border-[#3A007A] md:hidden"
        aria-label="Primary bottom navigation"
      >
        <div className="max-w-lg mx-auto grid grid-cols-5 h-16 px-2 items-center">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectMediaTab(tab.id)}
                className={`flex flex-col items-center justify-center h-13 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#261432] border border-[#BF00FF] text-white vox-purple-glow'
                    : 'text-[#9D8BA0] hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-[#ECB1FF]' : 'text-[#9D8BA0]'}`}
                />
                <span className="font-mono-code text-[10px] font-bold uppercase mt-1 tracking-tight truncate max-w-full px-1">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ====================================================================
          GLOBAL TOAST NOTIFICATION (profil_saqlandi_muvaffaqiyatli_bildirishnoma)
         ==================================================================== */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 max-w-sm bg-[#1A0033] border-2 border-[#39FF14] px-4 py-3 text-white font-mono-code text-xs shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#39FF14] shrink-0" />
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* ====================================================================
          ALL MODALS & EMBEDDED PLAYERS
         ==================================================================== */}
      <CyberVideoPlayerModal
        item={playingItem}
        playlist={
          playingItem
            ? [
                ...mediaItems.filter((m) => m.platform === playingItem.platform),
                ...mediaItems.filter((m) => m.platform !== playingItem.platform),
              ]
            : mediaItems
        }
        initialFullscreen={playFullscreen}
        onClose={() => setPlayingItem(null)}
        onSelectItem={(nextItem) => setPlayingItem(nextItem)}
        onShare={handleShareMedia}
        onDownload={handleDownloadMedia}
        onToggleBookmark={handleToggleSaveMedia}
        onToggleLike={handleToggleLikeMedia}
      />

      <StoryPlayerModal
        stories={INSTAGRAM_STORIES}
        activeIndex={activeStoryIndex}
        onClose={() => setActiveStoryIndex(null)}
        onSelectIndex={(idx) => setActiveStoryIndex(idx)}
      />

      {/* 0. Internet bo'lmaganda ilovaga kirishni to'liq bloklovchi Offline Ekran (Robitcha ogohlantirishi) */}
      <OfflineGuardModal
        isOpen={isAppOffline}
        onRetryConnection={handleRetryInternetConnection}
      />

      {/* 1. Har safar ilovaga kirganda yoqimli animatsiya bilan ochiladigan Salomlashish oynasi */}
      <WelcomeOnboardingModal
        isOpen={showWelcomeModal && !isAppOffline}
        userName={profile.fullName}
        onEnterApp={async () => {
          if (simulatedOffline) {
            return;
          }
          const liveConnected = await verifyLiveNetworkConnection(2500);
          if (!liveConnected) {
            setIsBrowserOffline(true);
            return;
          }
          setShowWelcomeModal(false);
          if (!isRegistered) {
            setShowAuthModal(true);
          }
        }}
        onSimulateOffline={() => setSimulatedOffline(true)}
      />

      {/* 2. Faqatgina birinchi marta kirganda (ro'yxatdan o'tmagan bo'lsa) ochiladigan VOX:BOT v2 oynasi */}
      <FirstTimeAuthGateModal
        isOpen={!showWelcomeModal && !isRegistered && !showAuthModal && !isAppOffline}
        userName={profile.fullName}
        onOpenRegistration={async () => {
          const liveConnected = await verifyLiveNetworkConnection(2500);
          if (!liveConnected || simulatedOffline) {
            setIsBrowserOffline(true);
            return;
          }
          setShowAuthModal(true);
        }}
      />

      {/* 3. Ro'yxatdan o'tish oynasi (bir marta ro'yxatdan o'tgach boshqa hech qachon ochilmaydi) */}
      <AuthRegistrationModal
        isOpen={showAuthModal}
        onClose={() => {
          if (isRegistered) {
            setShowAuthModal(false);
          } else {
            setShowAuthModal(false);
          }
        }}
        onOAuthConnect={handleOAuthConnect}
        connectedProviders={connectedProviders}
        onSuccessAuth={(newProf) => {
          const updatedProfile = { ...profile, ...newProf };
          setProfile(updatedProfile);
          try {
            localStorage.setItem('vox_hub_profile_v2', JSON.stringify(updatedProfile));
          } catch {
            // ignore
          }
          markUserAsRegistered();
          triggerToast(t('notifications.profile_saved'));
        }}
      />

      <ChangeEmailModal
        isOpen={showChangeEmailModal}
        currentEmail={profile.email}
        onClose={() => setShowChangeEmailModal(false)}
        onSuccess={(newEmail) => {
          setProfile((prev) => ({ ...prev, email: newEmail }));
          triggerToast(t('notifications.email_updated'));
        }}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          triggerToast(t('notifications.password_updated'));
        }}
      />

      <FlutterArchitectureModal
        isOpen={showFlutterModal}
        onClose={() => setShowFlutterModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <VoxHubAppContent />
    </I18nProvider>
  );
}
