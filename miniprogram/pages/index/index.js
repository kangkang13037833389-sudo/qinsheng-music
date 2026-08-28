const tracks = require('./tracks');
const audio = wx.getBackgroundAudioManager();
const withSaved = (list, favorites) => list.map(track => ({...track, saved:favorites.includes(track.id)}));
Page({
  data:{tracks,shown:tracks,query:'',current:tracks[0],currentIndex:0,playing:false,favorites:[],progress:0,duration:0,category:'全部',categories:['全部','秦腔','陕西秦韵','梆子戏','戏曲现场','民族器乐','民歌锣鼓'],playMode:'list'},
  onLoad(){const favorites=wx.getStorageSync('favorites')||[];const day=Math.floor(Date.now()/86400000)%tracks.length;this.setData({favorites,tracks:withSaved(tracks,favorites),shown:withSaved(tracks,favorites),daily:tracks[day]});wx.showShareMenu({menus:['shareAppMessage','shareTimeline']});audio.onPlay(()=>this.setData({playing:true}));audio.onPause(()=>this.setData({playing:false}));audio.onStop(()=>this.setData({playing:false}));audio.onEnded(()=>this.next());audio.onTimeUpdate(()=>this.setData({progress:audio.currentTime||0,duration:audio.duration||0}));},
  onShareAppMessage(){return {title:'秦声听戏 · 听见八百里秦川',path:'/pages/index/index'};},
  onShareTimeline(){return {title:'秦声听戏 · 32首传统戏曲与民乐试听'};},
  filter(query=this.data.query,category=this.data.category){let list=category==='全部'?tracks:tracks.filter(t=>t.category===category);if(query)list=list.filter(t=>(t.title+t.artist+t.album+t.tags+t.category).toLowerCase().includes(query));this.setData({shown:withSaved(list,this.data.favorites)});},
  search(e){const query=e.detail.value.trim().toLowerCase();this.setData({query});this.filter(query,this.data.category);},
  chooseCategory(e){const category=e.currentTarget.dataset.category;this.setData({category});this.filter(this.data.query,category);},
  playDaily(){this.playTrack({currentTarget:{dataset:{id:this.data.daily.id}}});},
  playTrack(e){const index=tracks.findIndex(t=>t.id===e.currentTarget.dataset.id);const current=tracks[index];audio.title=current.title;audio.epname=current.album;audio.singer=current.artist;audio.coverImgUrl='https://extraordinary-dango-e55531.netlify.app/favicon.svg';audio.src=current.audio;this.setData({current,currentIndex:index,playing:true});},
  toggle(){if(!audio.src){this.playTrack({currentTarget:{dataset:{id:this.data.current.id}}});return;}this.data.playing?audio.pause():audio.play();},
  previous(){const i=(this.data.currentIndex-1+tracks.length)%tracks.length;this.playTrack({currentTarget:{dataset:{id:tracks[i].id}}});},
  next(){const i=this.data.playMode==='shuffle'?Math.floor(Math.random()*tracks.length):(this.data.currentIndex+1)%tracks.length;this.playTrack({currentTarget:{dataset:{id:tracks[i].id}}});},
  changeMode(){const modes=['list','one','shuffle'];const playMode=modes[(modes.indexOf(this.data.playMode)+1)%modes.length];audio.loop=playMode==='one';this.setData({playMode});wx.showToast({title:playMode==='one'?'单曲循环':playMode==='shuffle'?'随机播放':'列表循环',icon:'none'});},
  seek(e){if(audio.duration)audio.seek(e.detail.value);},
  favorite(e){const id=e.currentTarget.dataset.id;let favorites=this.data.favorites.includes(id)?this.data.favorites.filter(x=>x!==id):this.data.favorites.concat(id);wx.setStorageSync('favorites',favorites);this.setData({favorites,tracks:withSaved(tracks,favorites),shown:withSaved(this.data.shown,favorites)});},
  fmt(n){n=Math.floor(n||0);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
});
