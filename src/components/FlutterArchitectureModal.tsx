import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, FileCode, FolderTree } from 'lucide-react';

interface FlutterArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PUBSPEC_YAML = `name: vox_hub
description: "VOX HUB — Cyberpunk Multi-Platform Media Aggregator (UZ/RU/EN)"
publish_to: 'none'
version: 2.4.0+42

environment:
  sdk: '>=3.4.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.6.1
  dio: ^5.7.0
  flutter_secure_storage: ^9.2.2
  flutter_appauth: ^8.0.0+1
  crypto: ^3.0.5
  easy_localization: ^3.0.7
  video_player: ^2.9.2
  chewie: ^1.8.5
  google_fonts: ^6.2.1
  url_launcher: ^6.3.1
  share_plus: ^10.1.2

flutter:
  uses-material-design: true
  assets:
    - assets/translations/uz.json
    - assets/translations/ru.json
    - assets/translations/en.json`;

const FOLDER_STRUCTURE = `lib/
├── core/
│   ├── config/
│   │   └── env_config.dart          # Zero hardcoded secrets (--dart-define)
│   ├── network/
│   │   ├── dio_client.dart          # Dio instance + timeouts + TLS pinning
│   │   └── auth_interceptor.dart    # 401 Silent Refresh + Request Retry Queue
│   ├── security/
│   │   ├── secure_vault.dart        # flutter_secure_storage Keychain/Keystore
│   │   ├── pkce_generator.dart      # RFC 7636 S256 code_verifier & challenge
│   │   └── input_sanitizer.dart     # Strict email/password validation & XSS strip
│   └── theme/
│       └── vox_cyber_theme.dart     # #0D001A void, #BF00FF neon, 0px sharp bevels
├── data/
│   ├── services/
│   │   ├── oauth_sso_manager.dart   # Unified YouTube, Twitch, TikTok, IG OAuth2
│   │   ├── youtube_api_service.dart # YouTube Data API v3 (pageToken cursor)
│   │   ├── twitch_helix_service.dart# Twitch Helix VODs + Clips cursor pagination
│   │   ├── tiktok_display_service.dart
│   │   └── instagram_graph_service.dart
├── presentation/
│   ├── shell/
│   │   └── main_indexed_shell.dart  # IndexedStack preserving 5-tab scroll state
│   ├── screens/
│   │   ├── welcome_onboarding_screen.dart
│   │   ├── hub_archive_screen.dart
│   │   ├── twitch_feed_screen.dart
│   │   ├── youtube_feed_screen.dart
│   │   ├── tiktok_feed_screen.dart
│   │   ├── instagram_feed_screen.dart
│   │   ├── profile_edit_screen.dart
│   │   └── settings_hub_screen.dart
│   └── modals/
│       ├── registration_sso_modal.dart
│       ├── change_email_modal.dart
│       ├── change_password_modal.dart
│       └── cyber_video_player_modal.dart
└── main.dart`;

const DART_INTERCEPTOR_CODE = `// lib/core/network/auth_interceptor.dart
import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class EnvConfig {
  static const youtubeClientId = String.fromEnvironment('YOUTUBE_CLIENT_ID');
  static const twitchClientId = String.fromEnvironment('TWITCH_CLIENT_ID');
  static const tiktokClientKey = String.fromEnvironment('TIKTOK_CLIENT_KEY');
  static const instagramClientId = String.fromEnvironment('INSTAGRAM_CLIENT_ID');
}

class PKCEHelper {
  static Map<String, String> generateS256Pair() {
    final random = Random.secure();
    final values = List<int>.generate(32, (_) => random.nextInt(256));
    final verifier = base64UrlEncode(values).replaceAll('=', '');
    final bytes = utf8.encode(verifier);
    final digest = sha256.convert(bytes);
    final challenge = base64UrlEncode(digest.bytes).replaceAll('=', '');
    return {'verifier': verifier, 'challenge': challenge, 'method': 'S256'};
  }
}

class VoxAuthInterceptor extends QueuedInterceptorsWrapper {
  final Dio _dio;
  final FlutterSecureStorage _vault = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock_this_device),
  );

  VoxAuthInterceptor(this._dio);

  @override
  Future<void> onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final provider = options.extra['provider'] as String? ?? 'youtube';
    final token = await _vault.read(key: 'vox_access_\$provider');
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer \$token';
    }
    if (provider == 'twitch') {
      options.headers['Client-Id'] = EnvConfig.twitchClientId;
    }
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final provider = err.requestOptions.extra['provider'] as String? ?? 'youtube';
      final refreshToken = await _vault.read(key: 'vox_refresh_\$provider');
      if (refreshToken != null) {
        try {
          final refreshDio = Dio(BaseOptions(baseUrl: _dio.options.baseUrl));
          final res = await refreshDio.post('/api/auth/token/refresh', data: {
            'provider': provider,
            'refreshToken': refreshToken,
          });
          final newAccess = res.data['accessToken'] as String;
          final newRefresh = res.data['refreshToken'] as String;
          await _vault.write(key: 'vox_access_\$provider', value: newAccess);
          await _vault.write(key: 'vox_refresh_\$provider', value: newRefresh);

          // Retry failed request transparently without logging out user
          err.requestOptions.headers['Authorization'] = 'Bearer \$newAccess';
          final clonedResponse = await _dio.fetch(err.requestOptions);
          return handler.resolve(clonedResponse);
        } catch (_) {
          // Refresh token revoked
        }
      }
    }
    handler.next(err);
  }
}`;

export const FlutterArchitectureModal: React.FC<FlutterArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pubspec' | 'structure' | 'interceptor'>('interceptor');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentCode =
    activeTab === 'pubspec'
      ? PUBSPEC_YAML
      : activeTab === 'structure'
      ? FOLDER_STRUCTURE
      : DART_INTERCEPTOR_CODE;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl bg-[#1A0033] border-2 border-[#00F0FF] vox-cyan-glow flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between px-4 py-3 bg-[#0D001A] border-b border-[#3A007A]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#39FF14]" />
            <h2 className="font-display font-bold text-base text-white uppercase">
              VOX HUB // FLUTTER (DART) &amp; CYBERSECURITY ARCHITECTURE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#93000A] text-white border border-[#FF0055] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#140026] border-b border-[#3A007A]">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('interceptor')}
              className={`px-3 py-1.5 font-mono-code text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'interceptor'
                  ? 'bg-[#BF00FF] text-white border border-[#E066FF]'
                  : 'bg-[#26004D] text-[#B39DDB] border border-[#3A007A]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Dio 401 Interceptor &amp; PKCE</span>
            </button>
            <button
              onClick={() => setActiveTab('pubspec')}
              className={`px-3 py-1.5 font-mono-code text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pubspec'
                  ? 'bg-[#BF00FF] text-white border border-[#E066FF]'
                  : 'bg-[#26004D] text-[#B39DDB] border border-[#3A007A]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>pubspec.yaml</span>
            </button>
            <button
              onClick={() => setActiveTab('structure')}
              className={`px-3 py-1.5 font-mono-code text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'structure'
                  ? 'bg-[#BF00FF] text-white border border-[#E066FF]'
                  : 'bg-[#26004D] text-[#B39DDB] border border-[#3A007A]'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Folder Architecture</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#0D001A] border border-[#00F0FF] text-[#00F0FF] font-mono-code text-xs flex items-center gap-1.5 cursor-pointer hover:bg-[#00F0FF] hover:text-[#0D001A]"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED' : 'COPY CODE'}</span>
          </button>
        </div>

        <pre className="p-4 overflow-auto text-xs font-mono-code text-[#D3FBFF] bg-[#0D001A] leading-relaxed flex-1">
          {currentCode}
        </pre>
      </div>
    </div>
  );
};
