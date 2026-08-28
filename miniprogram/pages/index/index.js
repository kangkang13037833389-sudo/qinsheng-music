const tracks = require('./tracks');
const audio = wx.getBackgroundAudioManager();
const withSaved = (list, favorites) => list.map(track => ({...track, saved:favorites.includes(track.id)}));
Page({
  data:{tracks,shown:tracks,query:'',current:tracks[0],currentIndex:0,playing:false,favorites:[],progress:0,duration:0},
  onLoad(){const favorites=wx.getStorageSync('favorites')||[];const day=Math.floor(Date.now()/86400000)%tracks.length;this.setData({favorites,tracks:withSaved(tracks,favorites),shown:withSaved(tracks,favorites),daily:tracks[day]});wx.showShareMenu({menus:['shareAppMessage','shareTimeline']});audio.onPlay(()=>this.setData({playing:true}));audio.onPause(()=>this.setData({playing:false}));audio.onStop(()=>this.setData({playing:false}));audio.onEnded(()=>this.next());audio.onTimeUpdate(()=>this.setData({progress:audio.currentTime||0,duration:audio.duration||0}));},
  onShareAppMessage(){return {title:'秦声 · 听见八百里秦川',path:'/pages/index/index'};},
  onShareTimeline(){return {title:'秦声 · 20首秦腔与传统民乐试听'};},
  search(e){const query=e.detail.value.trim().toLowerCase();const list=query?tracks.filter(t=>(t.title+t.artist+t.album+t.tags).toLowerCase().includes(query)):tracks;this.setData({query,shown:withSaved(list,this.data.favorites)});},
  playDaily(){this.playTrack({currentTarget:{dataset:{id:this.data.daily.id}}});},
  playTrack(e){const index=tracks.findIndex(t=>t.id===e.currentTarget.dataset.id);const current=tracks[index];audio.title=current.title;audio.epname=current.album;audio.singer=current.artist;audio.coverImgUrl='https://extraordinary-dango-e55531.netlify.app/favicon.svg';audio.src=current.audio;this.setData({current,currentIndex:index,playing:true});},
  toggle(){if(!audio.src){this.playTrack({currentTarget:{dataset:{id:this.data.current.id}}});return;}this.data.playing?audio.pause():audio.play();},
  previous(){const i=(this.data.currentIndex-1+tracks.length)%tracks.length;this.playTrack({currentTarget:{dataset:{id:tracks[i].id}}});},
  next(){const i=(this.data.currentIndex+1)%tracks.length;this.playTrack({currentTarget:{dataset:{id:tracks[i].id}}});},
  seek(e){if(audio.duration)audio.seek(e.detail.value);},
  favorite(e){const id=e.currentTarget.dataset.id;let favorites=this.data.favorites.includes(id)?this.data.favorites.filter(x=>x!==id):this.data.favorites.concat(id);wx.setStorageSync('favorites',favorites);this.setData({favorites,tracks:withSaved(tracks,favorites),shown:withSaved(this.data.shown,favorites)});},
  fmt(n){n=Math.floor(n||0);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
});
