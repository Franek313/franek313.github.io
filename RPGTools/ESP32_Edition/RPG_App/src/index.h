#include <Arduino.h>

const char PAGE_INDEX[] PROGMEM = R"HTML(
<!doctype html><html><head><meta name=viewport content="width=device-width,initial-scale=1">
<title>ESP32 LED + Player</title>
<style>
  body{font-family:system-ui;margin:20px;max-width:480px}
  .row{display:flex;gap:10px;margin:10px 0}
  button,input{font-size:18px;padding:10px;border-radius:10px;border:1px solid #ccc}
  .grow{flex:1}
</style>
</head><body>
<h2>ESP32 LED + Player</h2>

<!-- LED controls -->
<div class=row>
  <button id=on class=grow>LED ON</button>
  <button id=off class=grow>LED OFF</button>
</div>
<div class=row><input id=color type=color class=grow value="#ffffff"></div>
<div class=row>
  <input id=br type=range min=1 max=255 value=128 class=grow>
  <span id=brv>128</span>
</div>

<hr>

<!-- Music player -->
<div class=row>
  <button id=play class=grow>▶️ Play music</button>
  <button id=pause class=grow>⏸️ Pause</button>
  <button id=stop class=grow>⏹️ Stop</button>
</div>
<div style="font-size:14px;opacity:.8">Źródło: GitHub Pages</div>

<audio id=mp3 preload="auto" crossorigin="anonymous" src="{{TRACK_URL}}"></audio>

<pre id=state>...</pre>

<script>
const S=q=>document.querySelector(q);

// --- LED API ---
async function getState(){
  const r=await fetch('/api/state'); const j=await r.json();
  S('#state').textContent=JSON.stringify(j,null,2);
  S('#br').value=j.bright; S('#brv').textContent=j.bright;
  if(j.color && /^#[0-9a-f]{6}$/i.test(j.color)) S('#color').value=j.color;
}
async function set(p){
  const qs=new URLSearchParams(p).toString();
  await fetch('/api/set?'+qs);
  getState();
}
S('#on').onclick  = ()=> set({on:1});
S('#off').onclick = ()=> set({on:0});
S('#br').oninput  = e=> S('#brv').textContent=e.target.value;
S('#br').onchange = e=> set({br:e.target.value});
S('#color').onchange = e=> set({color:e.target.value});

// --- Audio ---
const a=S('#mp3');
S('#play').onclick  = async ()=>{ try{ await a.play(); }catch(e){ alert('Jeśli nie zagrało, kliknij jeszcze raz (polityka autoplay).'); } };
S('#pause').onclick = ()=> a.pause();
S('#stop').onclick  = ()=> { a.pause(); a.currentTime=0; };
a.addEventListener('error', ()=> alert('Błąd odtwarzania (sprawdź internet/URL).'));

// init
getState();
</script>
</body></html>
)HTML";