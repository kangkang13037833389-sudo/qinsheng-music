'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import tracks from './tracks.json';

type Track = (typeof tracks)[number];
type View = 'home' | 'categories' | 'favorites' | 'recent';
type PlayMode = 'list' | 'one' | 'shuffle';
const I = { home: '⌂', category: '田', heart: '♡', heartFull: '♥', recent: '↺', previous: '⏮', next: '⏭', play: '▶', pause: '❚❚', repeat: '↻', shuffle: '⤨', volume: '♫' };
const categories = ['全部', '秦腔', '陕西秦韵', '梆子戏', '戏曲现场', '民族器乐', '民歌锣鼓'];
const time = (value: number) => Number.isFinite(value) ? `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}` : '0:00';
const dailyIndex = () => {
  const now = new Date();
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  return day % tracks.length;
};

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [view, setView] = useState<View>('home');
  const [query, setQuery] = useState('');
  const [currentId, setCurrentId] = useState(tracks[0].id);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(.72);
  const [playMode, setPlayMode] = useState<PlayMode>('list');
  const [category, setCategory] = useState('全部');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(JSON.parse(localStorage.getItem('qinsheng-favorites') || '[]'));
    setRecent(JSON.parse(localStorage.getItem('qinsheng-recent') || '[]'));
  }, []);

  const current = tracks.find(track => track.id === currentId) || tracks[0];
  const dailyTrack = tracks[dailyIndex()];
  const dailyDate = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date());
  const visibleTracks = useMemo(() => {
    let list: Track[] = [...tracks];
    if (view === 'categories' && category !== '全部') list = list.filter(track => track.category === category);
    if (view === 'favorites') list = list.filter(track => favorites.includes(track.id));
    if (view === 'recent') list = recent.map(id => tracks.find(track => track.id === id)).filter(Boolean) as Track[];
    const q = query.trim().toLowerCase();
    return q ? list.filter(track => `${track.title}${track.artist}${track.album}${track.tags.join('')}`.toLowerCase().includes(q)) : list;
  }, [category, favorites, query, recent, view]);

  const save = (key: string, values: string[]) => { localStorage.setItem(key, JSON.stringify(values)); return values; };
  const selectTrack = (track: Track) => {
    setCurrentId(track.id);
    setRecent(items => save('qinsheng-recent', [track.id, ...items.filter(id => id !== track.id)].slice(0, 12)));
    setPlaying(true);
  };
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    if (playing) audio.play().catch(() => setPlaying(false)); else audio.pause();
  }, [playing, currentId, volume]);
  const step = (direction: number) => { const index = tracks.findIndex(track => track.id === currentId); const nextIndex = playMode === 'shuffle' ? Math.floor(Math.random() * tracks.length) : (index + direction + tracks.length) % tracks.length; selectTrack(tracks[nextIndex]); };
  const favorite = (id: string) => setFavorites(items => save('qinsheng-favorites', items.includes(id) ? items.filter(item => item !== id) : [...items, id]));
  const nav: { id: View; label: string; icon: string }[] = [{ id:'home',label:'发现秦声',icon:I.home },{ id:'categories',label:'分类曲库',icon:I.category },{ id:'favorites',label:'我的收藏',icon:I.heart },{ id:'recent',label:'最近播放',icon:I.recent }];

  return <main className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => { setView('home'); setQuery(''); }} aria-label="返回首页"><span className="brand-mark">秦</span><span><strong>秦声</strong><small>QINSHENG · kangkang</small></span></button>
      <nav aria-label="主导航">{nav.map(item => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { setView(item.id); setQuery(''); }}><span>{item.icon}</span>{item.label}</button>)}</nav>
      <div className="culture-note"><span>声起黄土</span><p>一板一眼，唱尽三秦故事</p></div>
      <p className="legal-note">试听音频来自 <a href="https://www.ear0.com/search/word-%E7%A7%A6%E8%85%94" target="_blank" rel="noreferrer">耳聆网公开授权作品</a><br />包含 CC0 与 CC BY-NC 许可</p>
    </aside>

    <section className="content">
      <header className="topbar"><div className="mobile-brand"><span className="brand-mark">秦</span><span><strong>秦声</strong><small>kangkang</small></span></div><label className="search"><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索剧目、唱段、名家…" /></label><span className="edition">秦腔·关中版</span></header>
      <nav className="mobile-nav" aria-label="手机导航">{nav.map(item => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { setView(item.id); setQuery(''); }}><span>{item.icon}</span>{item.label.replace('我的','').replace('发现','')}</button>)}</nav>
      {view === 'home' && !query && <>
        <section className="hero"><div className="hero-copy"><p className="eyebrow">每日推荐 · {dailyDate}</p><h1>听见八百里<br /><em>秦川风骨</em></h1><p>今日为你推荐《{dailyTrack.title}》。曲目每日自动轮换，听见黄土地上的悲欢人生。</p><button onClick={() => selectTrack(dailyTrack)}><span>{I.play}</span> 播放今日推荐</button></div><div className="hero-art" aria-label="秦腔文化抽象图形"><div className="sun"/><div className="arch"><span>声</span></div><div className="mountains"/></div></section>
        <section className="moods"><button onClick={() => {setView('categories');setCategory('秦腔')}}><span>鼓</span><div><strong>秦腔真声</strong><small>听关中乡音</small></div></button><button onClick={() => {setView('categories');setCategory('陕西秦韵')}}><span>陕</span><div><strong>陕西秦韵</strong><small>陕北民歌与秦川风</small></div></button><button onClick={() => {setView('categories');setCategory('民族器乐')}}><span>弦</span><div><strong>民族器乐</strong><small>二胡唢呐与锣鼓</small></div></button></section>
      </>}
      {view === 'categories' && !query && <section className="category-panel"><p className="eyebrow">分类曲库</p><h1>循声入戏</h1><p>按剧种与声音类型寻找喜欢的唱段和器乐。</p><div className="category-tabs">{categories.map(item => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}<small>{item === '全部' ? tracks.length : tracks.filter(track => track.category === item).length}</small></button>)}</div></section>}
      <section className="track-section"><div className="section-heading"><div><p className="eyebrow">{query ? '搜索结果' : view === 'favorites' ? '我的收藏' : view === 'recent' ? '最近播放' : '经典唱段'}</p><h2>{query ? `找到 ${visibleTracks.length} 首相关唱段` : view === 'home' ? '一曲入秦' : view === 'favorites' ? '留住喜欢的声音' : '再听一遍'}</h2></div>{query && <button className="clear" onClick={() => setQuery('')}>清除搜索</button>}</div>
        <div className="track-list"><div className="track-row track-head"><span>#</span><span>曲目</span><span>流派 / 标签</span><span>时长</span><span /></div>
          {visibleTracks.map((track,index) => <div key={track.id} className={`track-row ${currentId === track.id ? 'current' : ''}`}><button className="index" onClick={() => selectTrack(track)}>{currentId === track.id && playing ? '♫' : String(index + 1).padStart(2,'0')}</button><button className="track-title" onClick={() => selectTrack(track)}><span className={`cover cover-${track.color}`}>秦</span><span><strong>{track.title}</strong><small>{track.artist} · {track.album}</small></span></button><span className="tags">{track.tags.map(tag => <i key={tag}>{tag}</i>)}</span><span className="length">{track.length}</span><button className={`favorite ${favorites.includes(track.id) ? 'saved' : ''}`} onClick={() => favorite(track.id)} aria-label="收藏">{favorites.includes(track.id) ? I.heartFull : I.heart}</button></div>)}
          {!visibleTracks.length && <div className="empty"><b>曲库里暂时没有找到</b><p>目前可搜索曲名、演员、专辑和标签；试试“三滴血”、“秦腔”或“二胡”。</p></div>}
        </div>
      </section>
    </section>

    <footer className="player"><audio ref={audioRef} src={current.audio} loop={playMode === 'one'} onTimeUpdate={event => setProgress(event.currentTarget.currentTime)} onLoadedMetadata={event => setDuration(event.currentTarget.duration)} onEnded={() => playMode !== 'one' && step(1)} />
      <div className="now-playing"><span className={`cover cover-${current.color}`}>秦</span><span><strong>{current.title}</strong><small>{current.artist}</small></span><button className={`favorite ${favorites.includes(current.id) ? 'saved' : ''}`} onClick={() => favorite(current.id)}>{favorites.includes(current.id) ? I.heartFull : I.heart}</button></div>
      <div className="transport"><div className="buttons"><button onClick={() => step(-1)} aria-label="上一首">{I.previous}</button><button className="play" onClick={() => { if (!playing) setRecent(items => save('qinsheng-recent',[current.id,...items.filter(id => id !== current.id)].slice(0,12))); setPlaying(!playing); }} aria-label={playing ? '暂停' : '播放'}>{playing ? I.pause : I.play}</button><button onClick={() => step(1)} aria-label="下一首">{I.next}</button></div><div className="timeline"><span>{time(progress)}</span><input aria-label="播放进度" type="range" min="0" max={duration || 100} value={progress} onChange={event => { const next = Number(event.target.value); if (audioRef.current) audioRef.current.currentTime = next; setProgress(next); }} style={{'--value':`${duration ? progress/duration*100 : 0}%`} as React.CSSProperties}/><span>{duration ? time(duration) : current.length}</span></div></div>
      <div className="player-tools"><button className={playMode !== 'list' ? 'on' : ''} onClick={() => setPlayMode(mode => mode === 'list' ? 'one' : mode === 'one' ? 'shuffle' : 'list')} aria-label="切换播放模式" title={playMode === 'list' ? '列表循环' : playMode === 'one' ? '单曲循环' : '随机播放'}>{playMode === 'shuffle' ? I.shuffle : I.repeat}<small>{playMode === 'one' ? '1' : ''}</small></button><span>{I.volume}</span><input aria-label="音量" type="range" min="0" max="1" step=".01" value={volume} onChange={event => setVolume(Number(event.target.value))} style={{'--value':`${volume*100}%`} as React.CSSProperties}/></div>
    </footer>
  </main>;
}
