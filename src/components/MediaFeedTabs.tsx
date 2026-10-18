import React, { useState } from 'react';
import {
  Search,
  Play,
  Download,
  Maximize2,
  Share2,
  Bookmark,
  Heart,
  MessageSquare,
  ArrowUpDown,
  Zap,
  RefreshCw,
  HardDrive,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useI18n } from '../i18n/i18n';
import { MediaItem, StoryHighlight } from '../data/mediaCatalog';
import { CyberThumbnail } from './CyberThumbnail';

interface FeedCommonProps {
  items: MediaItem[];
  onPlay: (item: MediaItem, fullscreen?: boolean) => void;
  onShare: (item: MediaItem) => void;
  onDownload: (item: MediaItem) => void;
  onToggleSave: (item: MediaItem) => void;
  onToggleLike: (item: MediaItem) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
}

// ============================================================================
// 1. HUB TAB (Matches Image 14: TWITCH VIDEOLAR / ARXIV RO'YXATI / BULUT XOTIRASI)
// ============================================================================
export const HubFeedView: React.FC<
  FeedCommonProps & {
    savedItems: MediaItem[];
    autoArchive: boolean;
    onToggleAutoArchive: () => void;
    onOpenSettings: () => void;
  }
> = ({
  items,
  savedItems,
  onPlay,
  onShare,
  onDownload,
  onToggleSave,
  onLoadMore,
  hasMore,
  loadingMore,
  autoArchive,
  onToggleAutoArchive,
  onOpenSettings,
}) => {
  const { lang, t } = useI18n();
  const [filter, setFilter] = useState<'all' | 'streams' | 'clips' | 'saved'>('all');
  const [search, setSearch] = useState('');
  const [sortNewest, setSortNewest] = useState(true);

  const featured = items.find((i) => i.featured) || items[0];

  const sourceList =
    filter === 'saved'
      ? savedItems
      : items.filter((i) => {
          if (i.id === featured?.id && filter === 'all') return false;
          if (filter === 'streams') return i.type === 'stream' || i.type === 'vod';
          if (filter === 'clips') return i.type === 'clip';
          return true;
        });

  const filteredList = sourceList
    .filter(
      (i) =>
        !search.trim() ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.categoryTag.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (sortNewest ? 0 : b.viewsNumeric - a.viewsNumeric));

  const usedGb = 48.5;
  const totalGb = 100;
  const freeGb = +(totalGb - usedGb).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Title & Filter Tabs matching Image 14 */}
      <div className="space-y-3">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase tracking-wide">
          {t('hub.title')}
        </h1>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'all', label: t('hub.tab_all') },
              { id: 'streams', label: t('hub.tab_streams') },
              { id: 'clips', label: t('hub.tab_clips') },
              { id: 'saved', label: `${t('hub.tab_saved')} (${savedItems.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 font-mono-code text-xs font-bold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[#BF00FF] text-white vox-purple-glow'
                  : 'bg-[#261432] text-[#D5C0D7] border border-[#3A007A] hover:border-[#00F0FF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Row matching Image 14 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="sm:col-span-2 flex items-center bg-[#170624] border border-[#3A007A] focus-within:border-[#00F0FF] px-3 py-2.5">
            <Search className="w-4 h-4 text-[#00F0FF] mr-2.5 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('hub.search_placeholder')}
              className="w-full bg-transparent text-white font-mono-code text-xs focus:outline-none placeholder:text-[#9D8BA0]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-[#9D8BA0] hover:text-white ml-2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setSortNewest((p) => !p)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#1D0B29] hover:bg-[#261432] border border-[#3A007A] text-[#F3DAFF] font-mono-code text-xs font-semibold uppercase cursor-pointer whitespace-nowrap"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>{sortNewest ? t('hub.sort_newest') : t('hub.sort_popular')}</span>
          </button>
        </div>
      </div>

      {/* Featured Last Stream Card matching Image 14 */}
      {featured && filter === 'all' && !search && (
        <div className="bg-[#1D0B29] border border-[#3A007A] vox-pixel-shadow overflow-hidden">
          <div className="px-4 py-2 bg-[#261432] border-b border-[#3A007A] flex items-center justify-between">
            <span className="font-mono-code text-xs font-bold text-[#ECB1FF] uppercase">
              ■ {t('hub.featured_label')}
            </span>
            <span className="font-mono-code text-xs text-[#39FF14] font-bold">
              {featured.duration}
            </span>
          </div>

          <div
            onClick={() => onPlay(featured, false)}
            className="relative aspect-video w-full cursor-pointer group"
          >
            <CyberThumbnail variant={featured.artVariant} className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 bg-[#BF00FF] group-hover:bg-[#E066FF] border-2 border-white flex items-center justify-center vox-purple-glow transition-transform group-hover:scale-105">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>
            </div>

            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
              {featured.secondaryTag && (
                <span className="px-2 py-0.5 bg-[#170624]/90 border border-[#3A007A] font-mono-code text-[11px] text-[#D5C0D7]">
                  {featured.secondaryTag}
                </span>
              )}
              <span className="px-2 py-0.5 bg-[#261432]/90 border border-[#BF00FF] font-mono-code text-[11px] text-[#ECB1FF]">
                {featured.categoryTag}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlay(featured, true);
              }}
              className="absolute bottom-3 right-3 p-2 bg-[#170624]/90 border border-[#3A007A] text-white hover:border-[#00F0FF] cursor-pointer"
              title={t('hub.fullscreen_btn')}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            <div className="space-y-1.5">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white uppercase leading-snug">
                {featured.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 font-mono-code text-xs text-[#D5C0D7]">
                <span>{featured.quality}</span>
                <span>·</span>
                <span>{featured.views} tomosha</span>
                {featured.fileSizeGb && (
                  <>
                    <span>·</span>
                    <span className="text-[#39FF14]">{featured.fileSizeGb} GB</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => onPlay(featured, false)}
                className="py-3 px-4 bg-[#BF00FF] hover:bg-[#E066FF] text-white font-mono-code font-bold text-xs uppercase border-b-2 border-[#00F0FF] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t('hub.play_btn')}</span>
              </button>

              <button
                onClick={() => onDownload(featured)}
                className="py-3 px-4 bg-[#008A33] hover:bg-[#00E55B] hover:text-[#002107] text-white font-mono-code font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t('hub.download_btn')}</span>
              </button>
            </div>

            <button
              onClick={() => onPlay(featured, true)}
              className="w-full py-2.5 px-4 bg-[#261432] hover:bg-[#352242] border border-[#3A007A] text-[#F3DAFF] font-mono-code text-xs font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>{t('hub.fullscreen_btn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Archive List Section matching Image 14 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono-code font-bold text-sm text-[#F3DAFF] uppercase tracking-wider">
            ▣ {t('hub.archive_list_title')}
          </h3>
          <span className="font-mono-code text-xs text-[#00F0FF]">
            {filteredList.length} ITEMS
          </span>
        </div>

        <div className="space-y-2.5">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-[#1D0B29] border border-[#3A007A] hover:border-[#BF00FF] p-3 flex flex-col sm:flex-row gap-3.5 items-start sm:items-center transition-colors"
            >
              <div
                onClick={() => onPlay(item, false)}
                className="relative w-full sm:w-40 aspect-video shrink-0 cursor-pointer overflow-hidden border border-[#3A007A]"
              >
                <CyberThumbnail variant={item.artVariant} className="w-full h-full" />
                <span
                  className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 font-mono-code text-[10px] font-bold uppercase ${
                    item.categoryTag === 'CLIP'
                      ? 'bg-[#BF00FF] text-white'
                      : 'bg-[#170624]/90 text-[#D5C0D7] border border-[#514254]'
                  }`}
                >
                  {item.categoryTag}
                </span>
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-[#0D001A]/90 text-[#39FF14] font-mono-code text-[10px] font-bold">
                  {item.duration}
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-2 w-full">
                <div>
                  <h4
                    onClick={() => onPlay(item, false)}
                    className="font-display font-bold text-base text-white hover:text-[#00F0FF] uppercase truncate cursor-pointer"
                  >
                    {item.title}
                  </h4>
                  <div className="font-mono-code text-xs text-[#B39DDB]">
                    {item.views} · {item.ageText[lang]}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onPlay(item, false)}
                    className="px-3 py-1.5 bg-[#261432] hover:bg-[#BF00FF] text-white border border-[#514254] font-mono-code text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>{t('twitch.watch_short')}</span>
                  </button>

                  {item.type === 'vod' ? (
                    <button
                      onClick={() => onDownload(item)}
                      className="px-3 py-1.5 bg-[#170624] hover:bg-[#008A33] text-[#39FF14] hover:text-white border border-[#008A33] font-mono-code text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>{t('hub.download_short')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onShare(item)}
                      className="p-1.5 bg-[#261432] hover:bg-[#352242] text-[#D5C0D7] border border-[#514254] cursor-pointer"
                      title="Share"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onToggleSave(item)}
                    className={`p-1.5 border cursor-pointer ${
                      item.saved
                        ? 'bg-[#39FF14]/20 border-[#39FF14] text-[#39FF14]'
                        : 'bg-[#261432] border-[#514254] text-[#D5C0D7]'
                    }`}
                    title="Save to Archive"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && filter !== 'saved' && (
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full py-3 bg-[#1D0B29] hover:bg-[#261432] border border-[#3A007A] hover:border-[#00F0FF] text-[#F3DAFF] font-mono-code text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00F0FF] ${loadingMore ? 'animate-spin' : ''}`} />
            <span>{t('twitch.load_more')}</span>
          </button>
        )}
      </div>

      {/* Cloud Storage Telemetry Panel matching Image 14 bottom */}
      <div className="bg-[#170624] border border-[#3A007A] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between font-mono-code text-xs">
          <div className="flex items-center gap-2 font-bold text-white uppercase">
            <HardDrive className="w-4 h-4 text-[#39FF14]" />
            <span>{t('hub.cloud_storage_title')}</span>
          </div>
          <span className="text-[#F3DAFF] font-bold">
            {t('hub.cloud_used_pct', { pct: 48 })}
          </span>
        </div>

        <div className="flex items-center justify-between font-mono-code text-xs">
          <span className="text-[#B39DDB]">
            {t('hub.cloud_volume', { used: usedGb, total: totalGb })}
          </span>
          <span className="text-[#39FF14] font-bold">
            {t('hub.cloud_free', { free: freeGb })}
          </span>
        </div>

        {/* Neon progress bar */}
        <div className="w-full h-2.5 bg-[#261432] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#BF00FF] to-[#ECB1FF]"
            style={{ width: '48.5%' }}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#3A007A]/60 font-mono-code text-xs">
          <button
            type="button"
            onClick={onToggleAutoArchive}
            className="flex items-center gap-2 text-left cursor-pointer"
          >
            <span className={autoArchive ? 'text-[#39FF14]' : 'text-[#9D8BA0]'}>■</span>
            <span className="text-[#D5C0D7] hover:text-white">
              {autoArchive ? t('hub.auto_archive_on') : t('hub.auto_archive_off')}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="text-[#F3DAFF] hover:text-[#00F0FF] uppercase font-bold cursor-pointer"
          >
            {t('hub.settings_link')} →
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. TWITCH TAB (Matches Image 16: TWITCH VIDEOLAR – EFIRLAR VA KLIPLAR)
// ============================================================================
export const TwitchFeedView: React.FC<FeedCommonProps> = ({
  items,
  onPlay,
  onDownload,
  onLoadMore,
  hasMore,
  loadingMore,
}) => {
  const { lang, t } = useI18n();
  const [tab, setTab] = useState<'all' | 'recent' | 'clips'>('all');
  const [search, setSearch] = useState('');

  const featured = items.find((i) => i.featured) || items[0];
  const listItems = items
    .filter((i) => {
      if (tab === 'all' && i.id === featured?.id && !search) return false;
      if (tab === 'recent') return i.type === 'vod' || i.type === 'stream';
      if (tab === 'clips') return i.type === 'clip';
      return true;
    })
    .filter(
      (i) =>
        !search.trim() ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        (i.secondaryTag && i.secondaryTag.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase">
            {t('twitch.title')}{' '}
            <span className="text-[#BF00FF] font-normal text-lg">— {t('twitch.subtitle')}</span>
          </h1>
        </div>

        {/* Search Input matching Image 16 */}
        <div className="flex items-center bg-[#1D0B29] border border-[#3A007A] focus-within:border-[#00F0FF] px-3.5 py-3">
          <Search className="w-4 h-4 text-[#9D8BA0] mr-2.5 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('twitch.search_placeholder')}
            className="w-full bg-transparent text-white font-mono-code text-xs focus:outline-none placeholder:text-[#9D8BA0]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[#00F0FF] font-mono-code text-xs ml-2 cursor-pointer"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Filter Tabs matching Image 16 */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'all', label: `■ ${t('twitch.tab_all')}` },
              { id: 'recent', label: t('twitch.tab_recent') },
              { id: 'clips', label: t('twitch.tab_top_clips') },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setTab(f.id)}
              className={`px-4 py-2.5 font-mono-code text-xs font-bold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                tab === f.id
                  ? 'bg-[#BF00FF] text-white vox-purple-glow'
                  : 'bg-[#1D0B29] text-[#D5C0D7] border border-[#3A007A] hover:border-[#00F0FF]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured VOD Card matching Image 16 */}
      {featured && tab === 'all' && !search && (
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono-code text-xs">
            <span className="text-[#39FF14] font-bold uppercase">
              ■ {t('twitch.featured_left')}
            </span>
            <span className="text-[#D5C0D7] uppercase">{t('twitch.featured_right')}</span>
          </div>

          <div className="bg-[#1D0B29] border border-[#3A007A] overflow-hidden vox-pixel-shadow">
            <div
              onClick={() => onPlay(featured, false)}
              className="relative aspect-video w-full cursor-pointer group"
            >
              <CyberThumbnail variant={featured.artVariant} className="w-full h-full" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#0D001A]/90 border border-[#00F0FF] text-[#00F0FF] font-mono-code text-xs font-bold">
                  {featured.quality}
                </span>
                <span className="px-2 py-0.5 bg-[#00E55B] text-[#002107] font-mono-code text-xs font-bold">
                  {featured.categoryTag}
                </span>
              </div>
              <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-[#0D001A]/95 border border-[#00F0FF] text-white font-mono-code text-xs font-bold">
                {featured.duration}
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="space-y-2">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-white uppercase">
                  {featured.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 font-mono-code text-xs">
                  <span className="text-[#39FF14] font-bold">
                    ◉ {featured.views} TOMOSHA
                  </span>
                  <span className="text-[#9D8BA0]">·</span>
                  <span className="text-[#D5C0D7]">{featured.ageText[lang]}</span>
                  {featured.secondaryTag && (
                    <>
                      <span className="text-[#9D8BA0]">·</span>
                      <span className="text-white font-semibold">{featured.secondaryTag}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => onPlay(featured, false)}
                  className="py-3 px-4 bg-[#BF00FF] hover:bg-[#E066FF] text-white font-mono-code font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer vox-purple-glow"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{t('twitch.watch_btn')}</span>
                </button>

                <button
                  onClick={() => onDownload(featured)}
                  className="py-3 px-4 bg-[#170624] hover:bg-[#261432] border border-[#3A007A] text-[#00F0FF] font-mono-code font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('twitch.download_btn')}</span>
                </button>
              </div>

              <button
                onClick={() => onPlay(featured, true)}
                className="w-full py-2.5 bg-[#261432] hover:bg-[#352242] border border-[#3A007A] text-white font-mono-code text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>{t('twitch.fullscreen_btn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Curated Clips & Highlights matching Image 16 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between font-mono-code text-xs">
          <span className="text-[#F3DAFF] font-bold uppercase">
            ▣ {t('twitch.clips_header')}
          </span>
          <span className="text-[#39FF14] font-bold">
            {t('twitch.clips_count', { count: 42 })}
          </span>
        </div>

        <div className="space-y-3">
          {listItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#1D0B29] border border-[#3A007A] hover:border-[#00F0FF] p-3.5 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
            >
              <div
                onClick={() => onPlay(item, false)}
                className="relative w-full sm:w-44 aspect-video shrink-0 cursor-pointer border border-[#3A007A]"
              >
                <CyberThumbnail variant={item.artVariant} className="w-full h-full" />
                <span
                  className={`absolute top-2 left-2 px-1.5 py-0.5 font-mono-code text-[10px] font-bold uppercase ${
                    item.categoryTag === 'KLIP'
                      ? 'bg-[#00F0FF] text-[#002022]'
                      : item.categoryTag === 'VOD'
                      ? 'bg-[#39FF14] text-[#002107]'
                      : 'bg-[#BF00FF] text-white'
                  }`}
                >
                  {item.categoryTag}
                </span>
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-[#0D001A]/90 text-white font-mono-code text-[10px] font-bold">
                  {item.duration}
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-2 w-full">
                {item.secondaryTag && (
                  <div className="font-mono-code text-[11px] text-[#E066FF] font-bold uppercase">
                    ⚡ {item.secondaryTag}
                  </div>
                )}
                <h3
                  onClick={() => onPlay(item, false)}
                  className="font-display font-bold text-lg text-white hover:text-[#00F0FF] uppercase truncate cursor-pointer"
                >
                  {item.title}
                </h3>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="font-mono-code text-xs text-[#D5C0D7]">
                    <span className="text-[#39FF14] font-bold">{item.views}</span> ·{' '}
                    {item.ageText[lang]}
                  </div>

                  <button
                    onClick={() => onPlay(item, false)}
                    className="px-4 py-2 bg-[#BF00FF] hover:bg-[#E066FF] text-white font-mono-code text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{t('twitch.watch_short')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full py-3.5 bg-[#1D0B29] hover:bg-[#261432] border border-[#3A007A] hover:border-[#00F0FF] text-white font-mono-code text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#00F0FF] ${loadingMore ? 'animate-spin' : ''}`} />
            <span>{t('twitch.load_more')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 3. YOUTUBE TAB (Matches Image 12: YOUTUBE VIDEOLAR // UPLOADS & SHORTS)
// ============================================================================
export const YouTubeFeedView: React.FC<FeedCommonProps> = ({
  items,
  onPlay,
  onShare,
  onLoadMore,
  hasMore,
  loadingMore,
}) => {
  const { lang, t } = useI18n();
  const [tab, setTab] = useState<'all' | 'long' | 'shorts' | 'live'>('all');
  const [search, setSearch] = useState('');

  const featured = items.find((i) => i.featured) || items[0];
  const libraryItems = items
    .filter((i) => {
      if (tab === 'all' && i.id === featured?.id && !search) return false;
      if (tab === 'long') return i.type === 'vod';
      if (tab === 'shorts') return i.type === 'short';
      if (tab === 'live') return i.type === 'live';
      return true;
    })
    .filter(
      (i) =>
        !search.trim() ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        (i.secondaryTag && i.secondaryTag.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase leading-tight">
          {t('youtube.title')} <span className="text-[#BF00FF]">//</span>{' '}
          <span className="block sm:inline">{t('youtube.subtitle')}</span>
        </h1>

        {/* Search Input with ESC CLEAR matching Image 12 */}
        <div className="flex items-center bg-[#170624] border border-[#3A007A] focus-within:border-[#00F0FF] px-3.5 py-3">
          <Search className="w-4 h-4 text-[#D5C0D7] mr-2.5 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('youtube.search_placeholder')}
            className="w-full bg-transparent text-white font-mono-code text-xs focus:outline-none placeholder:text-[#9D8BA0]"
          />
          <button
            onClick={() => setSearch('')}
            className="font-mono-code text-[11px] text-[#9D8BA0] hover:text-[#00F0FF] ml-2 shrink-0 cursor-pointer"
          >
            {t('youtube.clear_btn')}
          </button>
        </div>

        {/* Filter Buttons matching Image 12 */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'all', label: t('youtube.tab_all') },
              { id: 'long', label: t('youtube.tab_long') },
              { id: 'shorts', label: t('youtube.tab_shorts') },
              { id: 'live', label: t('youtube.tab_live') },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setTab(f.id)}
              className={`px-3.5 py-2 font-mono-code text-xs font-bold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                tab === f.id
                  ? 'bg-[#BF00FF] text-white vox-purple-glow'
                  : 'bg-[#1D0B29] text-[#D5C0D7] border border-[#3A007A] hover:border-[#00F0FF]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured YouTube Video Card matching Image 12 */}
      {featured && tab === 'all' && !search && (
        <div className="bg-[#1D0B29] border border-[#3A007A] overflow-hidden vox-pixel-shadow">
          <div className="px-4 py-2 bg-[#261432] border-b border-[#3A007A] font-mono-code text-xs font-bold text-[#ECB1FF] uppercase">
            ■ {t('youtube.featured_badge')}
          </div>

          <div
            onClick={() => onPlay(featured, false)}
            className="relative aspect-video w-full cursor-pointer group"
          >
            <CyberThumbnail variant={featured.artVariant} className="w-full h-full" />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#FFB4AB] text-[#690005] font-mono-code text-xs font-bold">
                ▷ {featured.categoryTag}
              </span>
              {featured.quality && (
                <span className="px-2 py-0.5 bg-[#170624]/90 border border-[#514254] text-white font-mono-code text-xs font-bold">
                  {featured.quality}
                </span>
              )}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#BF00FF] group-hover:bg-[#E066FF] flex items-center justify-center vox-purple-glow transition-transform group-hover:scale-105">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>
            </div>

            <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-[#0D001A]/90 text-white font-mono-code text-xs font-bold">
              {featured.duration}
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-3.5">
            <div className="font-mono-code text-xs text-[#D5C0D7]">
              <span className="text-[#39FF14] font-bold">4K UHD</span> · {featured.views} TOMOSHA ·{' '}
              {featured.ageText[lang]}
            </div>

            <h2 className="font-display font-bold text-xl sm:text-2xl text-white uppercase leading-snug">
              {featured.title}
            </h2>

            {featured.subtitle && (
              <p className="text-xs text-[#B39DDB] leading-relaxed">{featured.subtitle}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => onPlay(featured, false)}
                className="py-3 px-4 bg-[#BF00FF] hover:bg-[#E066FF] text-white font-mono-code font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer vox-purple-glow"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t('youtube.play_btn')}</span>
              </button>

              <button
                onClick={() => onPlay(featured, true)}
                className="py-3 px-4 bg-[#261432] hover:bg-[#352242] border border-[#3A007A] text-white font-mono-code font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <Maximize2 className="w-4 h-4 text-[#00F0FF]" />
                <span>{t('youtube.fullscreen_btn')}</span>
              </button>
            </div>

            <button
              onClick={() => onShare(featured)}
              className="w-full py-2.5 bg-[#170624] hover:bg-[#261432] border border-[#3A007A] text-[#D5C0D7] font-mono-code text-xs font-semibold uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>{t('youtube.share_btn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Library Contents matching Image 12 */}
      <div className="space-y-3">
        <h3 className="font-mono-code font-bold text-xs text-[#D5C0D7] uppercase tracking-wider">
          ▣ {t('youtube.library_title', { count: libraryItems.length })}
        </h3>

        <div className="space-y-3">
          {libraryItems.map((item) => {
            const isShort = item.type === 'short';
            return (
              <div
                key={item.id}
                className="bg-[#1D0B29] border border-[#3A007A] hover:border-[#BF00FF] p-3.5 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
              >
                <div
                  onClick={() => onPlay(item, false)}
                  className="relative w-full sm:w-44 aspect-video shrink-0 cursor-pointer border border-[#3A007A]"
                >
                  <CyberThumbnail variant={item.artVariant} className="w-full h-full" />
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 font-mono-code text-[10px] font-bold uppercase ${
                      isShort
                        ? 'bg-[#FFB4AB] text-[#690005]'
                        : 'bg-[#170624]/90 text-[#D5C0D7] border border-[#514254]'
                    }`}
                  >
                    {isShort ? `⚡ ${item.categoryTag}` : item.categoryTag}
                  </span>
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-[#0D001A]/90 text-white font-mono-code text-[10px] font-bold">
                    {item.duration}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-1.5 w-full">
                  {item.secondaryTag && (
                    <div className="font-mono-code text-[11px] text-[#E066FF] uppercase">
                      {item.secondaryTag}
                    </div>
                  )}
                  <h4
                    onClick={() => onPlay(item, false)}
                    className="font-display font-bold text-lg text-white hover:text-[#00F0FF] uppercase leading-snug cursor-pointer"
                  >
                    {item.title}
                  </h4>
                  <div className="font-mono-code text-xs text-[#D5C0D7]">
                    <span className="text-[#39FF14] font-bold">{item.views}</span> tomosha ·{' '}
                    {item.ageText[lang]}
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => onPlay(item, false)}
                      className="p-2 bg-[#261432] hover:bg-[#BF00FF] border border-[#514254] text-white cursor-pointer"
                      title="Play"
                    >
                      {isShort ? <Zap className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onShare(item)}
                      className="p-2 bg-[#261432] hover:bg-[#352242] border border-[#514254] text-[#D5C0D7] cursor-pointer"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full py-3.5 bg-[#1D0B29] hover:bg-[#261432] border border-[#3A007A] hover:border-[#00F0FF] text-white font-mono-code text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#00F0FF] ${loadingMore ? 'animate-spin' : ''}`} />
            <span>{t('youtube.load_more')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 4. TIKTOK TAB (Matches Image 20: TIKTOK VIDEOLAR & VIRAL KLIPLAR)
// ============================================================================
export const TikTokFeedView: React.FC<FeedCommonProps> = ({
  items,
  onPlay,
  onShare,
  onToggleLike,
  onLoadMore,
  hasMore,
  loadingMore,
}) => {
  const { t } = useI18n();
  const [tab, setTab] = useState<'all' | 'trend' | 'clips' | 'tags'>('all');
  const [search, setSearch] = useState('');

  const filtered = items
    .filter((i) => {
      if (tab === 'trend') return i.categoryTag === 'TREND' || i.categoryTag === '#VIRAL';
      if (tab === 'clips') return i.type === 'clip';
      if (tab === 'tags') return i.categoryTag.startsWith('#');
      return true;
    })
    .filter(
      (i) =>
        !search.trim() ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.author.toLowerCase().includes(search.toLowerCase()) ||
        i.categoryTag.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono-code text-xs font-bold text-[#00F0FF] uppercase">
            ● {t('tiktok.kicker')}
          </span>
          <button
            onClick={() => filtered[0] && onPlay(filtered[0], true)}
            className="p-2 bg-[#1D0B29] border border-[#3A007A] text-white hover:border-[#00F0FF] cursor-pointer"
            title="Full Screen Feed"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase">
            {t('tiktok.title')}
          </h1>
          <p className="font-mono-code text-xs text-[#B39DDB] uppercase mt-1">
            {t('tiktok.subtitle')}
          </p>
        </div>

        {/* Search Input matching Image 20 */}
        <div className="flex items-center bg-[#1D0B29] border border-[#3A007A] focus-within:border-[#00F0FF] px-3.5 py-3">
          <Search className="w-4 h-4 text-[#00F0FF] mr-2.5 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('tiktok.search_placeholder')}
            className="w-full bg-transparent text-white font-mono-code text-xs focus:outline-none placeholder:text-[#9D8BA0]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[#9D8BA0] hover:text-white ml-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Tabs matching Image 20 */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'all', label: t('tiktok.tab_all') },
              { id: 'trend', label: t('tiktok.tab_trending') },
              { id: 'clips', label: t('tiktok.tab_clips') },
              { id: 'tags', label: t('tiktok.tab_tags') },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setTab(f.id)}
              className={`px-4 py-2 font-mono-code text-xs font-bold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                tab === f.id
                  ? 'bg-[#BF00FF] text-white vox-purple-glow'
                  : 'bg-[#1D0B29] text-[#D5C0D7] border border-[#3A007A] hover:border-[#00F0FF]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Proportional Vertical 9:16 Grid across Phone (2 cols), Tablet (3 cols), and Notebook (3 cols) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map((item) => {
          const isTrend = item.categoryTag === 'TREND';
          return (
            <div
              key={item.id}
              className="bg-[#1D0B29] border border-[#3A007A] hover:border-[#00F0FF] flex flex-col justify-between overflow-hidden group"
            >
              <div
                onClick={() => onPlay(item, false)}
                className="relative aspect-[9/16] w-full cursor-pointer overflow-hidden"
              >
                <CyberThumbnail
                  variant={item.artVariant}
                  aspectRatio="9:16"
                  className="w-full h-full"
                />

                {/* Top Badge & Duration */}
                <span
                  className={`absolute top-2.5 left-2.5 px-2 py-0.5 font-mono-code text-[10px] font-bold uppercase ${
                    isTrend
                      ? 'bg-[#BF00FF] text-white'
                      : 'bg-[#170624]/90 text-[#39FF14] border border-[#3A007A]'
                  }`}
                >
                  {item.categoryTag}
                </span>
                <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 bg-[#0D001A]/90 text-white font-mono-code text-[10px] font-bold">
                  {item.duration}
                </span>

                {/* Center Play Circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-[#0D001A]/80 border border-[#00F0FF] group-hover:bg-[#BF00FF] flex items-center justify-center transition-colors">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Overlay Title & Metrics */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#0D001A] via-[#0D001A]/85 to-transparent space-y-1.5">
                  <h3 className="font-display font-bold text-xs sm:text-sm text-white uppercase line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between font-mono-code text-[11px]">
                    <span className="text-[#D5C0D7]">◉ {item.views}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(item);
                      }}
                      className={`flex items-center gap-1 cursor-pointer ${
                        item.liked ? 'text-[#FF0055] font-bold' : 'text-[#ECB1FF]'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${item.liked ? 'fill-[#FF0055]' : ''}`} />
                      <span>{item.likes || '12K'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Footer Bar with Handle, Fullscreen & Share */}
              <div className="px-2.5 py-2 bg-[#170624] border-t border-[#3A007A] flex items-center justify-between gap-1">
                <span className="font-mono-code text-[10px] text-[#B39DDB] truncate">
                  {item.author}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onPlay(item, true)}
                    className="p-1 text-[#9D8BA0] hover:text-white cursor-pointer"
                    title="Full Screen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onShare(item)}
                    className="p-1 text-[#9D8BA0] hover:text-[#00F0FF] cursor-pointer"
                    title="Share"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loadingMore}
          className="w-full py-3.5 bg-[#1D0B29] hover:bg-[#261432] border border-[#3A007A] hover:border-[#00F0FF] text-white font-mono-code text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-[#00F0FF] ${loadingMore ? 'animate-spin' : ''}`} />
          <span>{t('tiktok.load_more')}</span>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// 5. INSTAGRAM TAB (Matches Image 22: INSTAGRAM REELS & ARXIV, Glitch-free!)
// ============================================================================
export const InstagramFeedView: React.FC<
  FeedCommonProps & {
    stories: StoryHighlight[];
    onOpenStory: (idx: number) => void;
  }
> = ({
  items,
  stories,
  onOpenStory,
  onPlay,
  onShare,
  onDownload,
  onToggleSave,
  onToggleLike,
  onLoadMore,
  hasMore,
  loadingMore,
}) => {
  const { t } = useI18n();
  const [tab, setTab] = useState<'all' | 'reels' | 'live' | 'stories'>('all');
  const [search, setSearch] = useState('');
  const [following, setFollowing] = useState(false);

  const reelsCount = items.filter((i) => i.type === 'reel').length;
  const liveCount = items.filter((i) => i.type === 'live').length;

  const filtered = items
    .filter((i) => {
      if (tab === 'reels') return i.type === 'reel';
      if (tab === 'live') return i.type === 'live';
      return true;
    })
    .filter(
      (i) =>
        !search.trim() ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        (i.secondaryTag && i.secondaryTag.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="space-y-6">
      {/* Header & Search matching Image 22 (with zero vertical pink/purple overlay glitch line) */}
      <div className="space-y-3">
        <div className="inline-block px-3 py-1 bg-[#1D0B29] border border-[#3A007A] font-mono-code text-[11px] text-[#F3DAFF]">
          {t('instagram.active_reels_badge', { count: items.length })}
        </div>

        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase">
            <span className="text-[#BF00FF] mr-2">■</span>
            {t('instagram.title')}
          </h1>
          <p className="text-xs text-[#B39DDB] mt-1">{t('instagram.subtitle')}</p>
        </div>

        <div className="flex items-center bg-[#170624] border border-[#3A007A] focus-within:border-[#00F0FF] px-3.5 py-3">
          <Search className="w-4 h-4 text-[#00F0FF] mr-2.5 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('instagram.search_placeholder')}
            className="w-full bg-transparent text-white font-mono-code text-xs focus:outline-none placeholder:text-[#9D8BA0]"
          />
          <SlidersHorizontal className="w-4 h-4 text-[#9D8BA0] ml-2 shrink-0" />
        </div>

        {/* Filter Tabs with Counts matching Image 22 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTab('all')}
            className={`px-3.5 py-2 font-mono-code text-xs font-bold uppercase flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              tab === 'all'
                ? 'bg-[#BF00FF] text-white vox-purple-glow'
                : 'bg-[#1D0B29] text-[#D5C0D7] border border-[#3A007A]'
            }`}
          >
            <span>{t('instagram.tab_all')}</span>
            <span className="px-1.5 py-0.2 bg-[#170624] text-white text-[10px]">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setTab('reels')}
            className={`px-3.5 py-2 font-mono-code text-xs font-bold uppercase flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              tab === 'reels'
                ? 'bg-[#BF00FF] text-white vox-purple-glow'
                : 'bg-[#1D0B29] text-[#D5C0D7] border border-[#3A007A]'
            }`}
          >
            <span>{t('instagram.tab_reels')}</span>
            <span className="px-1.5 py-0.2 bg-[#170624] text-[#D5C0D7] text-[10px]">
              {reelsCount}
            </span>
          </button>

          <button
            onClick={() => setTab('live')}
            className={`px-3.5 py-2 font-mono-code text-xs font-bold uppercase flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              tab === 'live'
                ? 'bg-[#BF00FF] text-white vox-purple-glow'
                : 'bg-[#1D0B29] text-[#D5C0D7] border border-[#3A007A]'
            }`}
          >
            <span>{t('instagram.tab_live')}</span>
            <span className="px-1.5 py-0.2 bg-[#170624] text-[#39FF14] text-[10px]">
              {liveCount}
            </span>
          </button>

          <button
            onClick={() => {
              setTab('stories');
              onOpenStory(0);
            }}
            className={`px-3.5 py-2 font-mono-code text-xs font-bold uppercase cursor-pointer whitespace-nowrap ${
              tab === 'stories'
                ? 'bg-[#00F0FF] text-[#002022]'
                : 'bg-[#1D0B29] text-[#D5C0D7] border border-[#3A007A]'
            }`}
          >
            {t('instagram.tab_stories')}
          </button>
        </div>
      </div>

      {/* Interactive Stories Highlights Row matching Image 22 */}
      <div className="bg-[#170624] border border-[#3A007A] p-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {stories.map((story, idx) => {
            const borderCol =
              story.accentColor === 'cyan'
                ? 'border-[#00F0FF]'
                : story.accentColor === 'green'
                ? 'border-[#39FF14]'
                : 'border-[#BF00FF]';
            return (
              <button
                key={story.id}
                onClick={() => onOpenStory(idx)}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
              >
                <div
                  className={`w-16 h-16 border-2 ${borderCol} p-0.5 bg-[#0D001A] group-hover:scale-105 transition-transform relative`}
                >
                  <CyberThumbnail
                    variant={story.artVariant}
                    aspectRatio="1:1"
                    className="w-full h-full"
                  />
                  {idx === 0 && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#39FF14]" />
                  )}
                </div>
                <span className="font-mono-code text-[10px] font-bold text-[#D5C0D7] group-hover:text-white uppercase">
                  {story.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instagram Reels & IG Live Feed Cards (1 col on Phone, 2 cols on Tablet & Notebook so cards never stretch) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const isLive = item.type === 'live';
          return (
            <div
              key={item.id}
              className="bg-[#1D0B29] border border-[#3A007A] overflow-hidden vox-pixel-shadow flex flex-col justify-between"
            >
              <div
                onClick={() => onPlay(item, false)}
                className="relative aspect-video w-full cursor-pointer group"
              >
                <CyberThumbnail variant={item.artVariant} className="w-full h-full" />

                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 font-mono-code text-xs font-bold uppercase ${
                      isLive ? 'bg-[#93000A] text-white' : 'bg-[#BF00FF] text-white'
                    }`}
                  >
                    {item.categoryTag}
                  </span>
                  {item.secondaryTag && (
                    <span className="px-2.5 py-0.5 bg-[#0D001A]/90 border border-[#00F0FF] text-[#00F0FF] font-mono-code text-xs font-bold uppercase">
                      {item.secondaryTag}
                    </span>
                  )}
                </div>

                <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#0D001A]/90 text-[#39FF14] font-mono-code text-xs font-bold">
                  ◔ {item.duration}
                </span>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#BF00FF]/90 group-hover:bg-[#E066FF] flex items-center justify-center vox-purple-glow">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {item.quality && (
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-[#0D001A]/90 font-mono-code text-[11px] text-[#F3DAFF] uppercase">
                    ◈ {item.quality}
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-display font-bold text-lg sm:text-xl text-white uppercase">
                  {item.title}
                </h3>

                {/* Engagement Stats Row */}
                <div className="flex items-center gap-4 font-mono-code text-xs text-[#D5C0D7]">
                  <span>◉ {item.views}</span>
                  <button
                    type="button"
                    onClick={() => onToggleLike(item)}
                    className={`flex items-center gap-1 cursor-pointer ${
                      item.liked ? 'text-[#FF0055] font-bold' : 'text-[#FFB4AB]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${item.liked ? 'fill-[#FF0055]' : ''}`} />
                    <span>{item.likes || '1.8K'}</span>
                  </button>
                  <span className="flex items-center gap-1 text-[#39FF14]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{item.comments || '248'}</span>
                  </span>
                </div>

                {/* Action Controls Row matching Image 22 */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPlay(item, false)}
                      className={`px-4 py-2 font-mono-code text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer ${
                        isLive
                          ? 'bg-[#00F0FF] text-[#002022] vox-cyan-glow'
                          : 'bg-[#ECB1FF] hover:bg-white text-[#320046]'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>
                        {isLive ? t('instagram.watch_vod_btn') : t('instagram.watch_btn')}
                      </span>
                    </button>

                    <button
                      onClick={() => onPlay(item, true)}
                      className="p-2 bg-[#170624] hover:bg-[#261432] border border-[#00F0FF] text-white cursor-pointer"
                      title="Full Screen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onShare(item)}
                      className="p-2 bg-[#261432] hover:bg-[#352242] border border-[#3A007A] text-[#D5C0D7] cursor-pointer"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDownload(item)}
                      className="p-2 bg-[#261432] hover:bg-[#352242] border border-[#3A007A] text-[#39FF14] cursor-pointer"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleSave(item)}
                      className={`p-2 border cursor-pointer ${
                        item.saved
                          ? 'bg-[#BF00FF] border-[#E066FF] text-white'
                          : 'bg-[#261432] border-[#3A007A] text-[#D5C0D7]'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loadingMore}
          className="w-full py-3.5 bg-[#1D0B29] hover:bg-[#261432] border border-[#3A007A] hover:border-[#00F0FF] text-white font-mono-code text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-[#00F0FF] ${loadingMore ? 'animate-spin' : ''}`} />
          <span>{t('instagram.load_more')}</span>
        </button>
      )}

      {/* Official Instagram Channel Card at bottom matching Image 22 */}
      <div className="bg-[#170624] border border-[#3A007A] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="font-mono-code font-bold text-xs text-white uppercase">
            ✪ @VOX_GAMING_OFFICIAL
          </div>
          <div className="font-mono-code text-[11px] text-[#B39DDB]">
            {t('instagram.follower_meta')}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setFollowing((p) => !p)}
          className={`px-4 py-2 font-mono-code text-xs font-bold uppercase border cursor-pointer ${
            following
              ? 'bg-[#39FF14]/20 border-[#39FF14] text-[#39FF14]'
              : 'bg-[#1D0B29] border-[#00F0FF] text-white hover:bg-[#00F0FF] hover:text-[#002022]'
          }`}
        >
          {following ? t('instagram.following_btn') : t('instagram.follow_btn')}
        </button>
      </div>
    </div>
  );
};
