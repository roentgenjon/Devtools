(function(){
'use strict';
var ID='__idt3__',SKEY='__idt3_s__',AKEY='__idt3_a__',SECRET='__spy__';
if(document.getElementById(ID)){document.getElementById(ID).remove();if(window.__idt3_restore__)window.__idt3_restore__();return;}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function loadSet(){try{return Object.assign({fontSize:12,opacity:0.96,color:'#00cc88',errors:true,network:true,ts:true,w:450,h:0},JSON.parse(localStorage.getItem(SKEY)||'{}'));}catch(e){return{fontSize:12,opacity:0.96,color:'#00cc88',errors:true,network:true,ts:true,w:450,h:0};}}
function saveSet(){try{localStorage.setItem(SKEY,JSON.stringify(S.cfg));}catch(e){}}
function loadAct(){try{return JSON.parse(localStorage.getItem(AKEY)||'[]');}catch(e){return[];}}
function saveAct(){try{localStorage.setItem(AKEY,JSON.stringify(S.act.slice(-500)));}catch(e){}}
function trackAct(type,detail){S.act.push({t:Date.now(),type:type,detail:detail,url:location.href});saveAct();}
var cfg=loadSet();
var S={
  tab:'console',logs:[],net:[],hist:[],hidx:-1,
  minimized:false,fullscreen:false,
  prevPos:null,
  x:Math.max(0,window.innerWidth-(cfg.w||450)-16),
  y:16,
  w:cfg.w||450,
  h:cfg.h||Math.round(window.innerHeight*0.82),
  cfg:cfg,
  el:null,picking:false,
  act:loadAct(),spy:false,
  drag:{on:false,ox:0,oy:0},
  rsz:{on:false,dir:'',ox:0,oy:0,ow:0,oh:0},
  stor:'local',
  csearch:''
};
var oc={log:console.log,warn:console.warn,error:console.error,info:console.info};
window.__idt3_restore__=function(){console.log=oc.log;console.warn=oc.warn;console.error=oc.error;console.info=oc.info;};
['log','warn','error','info'].forEach(function(m){
  console[m]=function(){
    var txt=Array.prototype.slice.call(arguments).map(function(a){try{return typeof a==='object'&&a!==null?JSON.stringify(a,null,2):String(a);}catch(e){return String(a);}}).join(' ');
    addLog(m,txt);
    if(m==='error')trackAct('error',txt);
    oc[m].apply(console,arguments);
  };
});
var oFetch=window.fetch;
window.fetch=function(url,opts){
  var method=(opts&&opts.method)||'GET';
  var e={t:Date.now(),method:method,url:String(url),status:'...'};
  S.net.push(e);renderNet();
  return oFetch.apply(this,arguments).then(function(r){e.status=r.status;renderNet();return r;}).catch(function(ex){e.status='ERR';renderNet();throw ex;});
};
var oXHR=XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open=function(m,u){
  var e={t:Date.now(),method:m,url:String(u),status:'...'};
  S.net.push(e);
  this.addEventListener('loadend',function(){e.status=this.status;renderNet();});
  return oXHR.apply(this,arguments);
};
window.addEventListener('error',function(ev){addLog('error','Uncaught: '+ev.message+(ev.filename?' @ '+ev.filename+':'+ev.lineno:''));});
window.addEventListener('unhandledrejection',function(ev){addLog('error','Promise: '+(ev.reason&&ev.reason.message||String(ev.reason)));});
document.addEventListener('click',function(ev){if(!ev.target.closest('#'+ID))trackAct('click',ev.target.tagName+(ev.target.id?'#'+ev.target.id:''));},true);
document.addEventListener('input',function(ev){if(!ev.target.closest('#'+ID))trackAct('input','['+ev.target.tagName+']');},true);
var root=document.createElement('div');
root.id=ID;
Object.assign(root.style,{position:'fixed',top:'0',left:'0',width:'0',height:'0',zIndex:'2147483647'});
document.body.appendChild(root);
var shadow=root.attachShadow({mode:'open'});
var styleEl=document.createElement('style');
var panelEl=document.createElement('div');
panelEl.id='panel';
shadow.appendChild(styleEl);
shadow.appendChild(panelEl);
function ts(){if(!S.cfg.ts)return'';var d=new Date();return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0')+':'+d.getSeconds().toString().padStart(2,'0')+' ';}
function addLog(type,msg){S.logs.push({type:type,msg:msg,t:ts()});if(S.logs.length>600)S.logs=S.logs.slice(-600);renderLog();}
var CMDS=[
  // Console & Panel
  {n:'clear',d:'Console leeren',f:function(){S.logs=[];renderLog();}},
  {n:'help',d:'Commands anzeigen',f:function(){S.tab='commands';render();}},
  {n:'net-clear',d:'Network-Log leeren',f:function(){S.net=[];renderNet();}},
  // Navigation
  {n:'reload',d:'Seite neu laden',f:function(){location.reload();}},
  {n:'reload-hard',d:'Seite hart neu laden (Cache leeren)',f:function(){location.reload(true);}},
  {n:'back',d:'Zurück navigieren',f:function(){history.back();}},
  {n:'forward',d:'Vorwärts navigieren',f:function(){history.forward();}},
  {n:'print',d:'Druckdialog öffnen',f:function(){window.print();}},
  // Scrollen
  {n:'scroll-top',d:'Zum Seitenanfang',f:function(){window.scrollTo({top:0,behavior:'smooth'});}},
  {n:'scroll-bottom',d:'Zum Seitenende',f:function(){window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});}},
  {n:'scroll-mid',d:'Zur Seitenmitte',f:function(){window.scrollTo({top:document.body.scrollHeight/2,behavior:'smooth'});}},
  {n:'scroll-pos',d:'Aktuelle Scroll-Position',f:function(){addLog('info','scrollX:'+window.scrollX+' scrollY:'+window.scrollY);}},
  // Seiten-Info
  {n:'url',d:'Aktuelle URL anzeigen',f:function(){addLog('info',location.href);}},
  {n:'title',d:'Seitentitel anzeigen',f:function(){addLog('info','Titel: '+document.title);}},
  {n:'viewport',d:'Viewport-Größe und DPR',f:function(){addLog('info','Viewport: '+window.innerWidth+'x'+window.innerHeight+' | Screen: '+screen.width+'x'+screen.height+' | dpr:'+window.devicePixelRatio);}},
  {n:'page-info',d:'Vollständige Seiten-Infos',f:function(){addLog('info','URL: '+location.href+'\nTitel: '+document.title+'\nLang: '+(document.documentElement.lang||'–')+'\nCharset: '+document.characterSet+'\nReferrer: '+(document.referrer||'–'));}},
  {n:'ua',d:'User-Agent anzeigen',f:function(){addLog('info',navigator.userAgent);}},
  {n:'online',d:'Verbindungsstatus',f:function(){addLog('info','Online: '+navigator.onLine+(navigator.connection?' | '+navigator.connection.effectiveType:''));}},
  {n:'lang',d:'Browser-Sprache',f:function(){addLog('info','Sprache: '+navigator.language+' | Alle: '+navigator.languages.join(', '));}},
  {n:'timezone',d:'Zeitzone anzeigen',f:function(){addLog('info','Zeitzone: '+Intl.DateTimeFormat().resolvedOptions().timeZone+' | Offset: '+(new Date().getTimezoneOffset()/-60)+'h');}},
  // DOM-Analyse
  {n:'dom-count',d:'Anzahl DOM-Elemente',f:function(){addLog('info','DOM-Elemente: '+document.querySelectorAll('*').length);}},
  {n:'headings',d:'Alle Überschriften anzeigen',f:function(){var hs=Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));addLog('info','Überschriften ('+hs.length+'):\n'+hs.map(function(h){return h.tagName+': '+h.textContent.trim().slice(0,80);}).join('\n'));}},
  {n:'links',d:'Alle Links anzeigen',f:function(){var ls=Array.from(document.querySelectorAll('a')).map(function(a){return a.href;}).filter(Boolean);addLog('info','Links ('+ls.length+'):\n'+ls.join('\n'));}},
  {n:'images',d:'Alle Bilder auflisten',f:function(){var im=Array.from(document.querySelectorAll('img'));addLog('info','Bilder ('+im.length+'):\n'+im.map(function(i){return(i.alt||'–')+' → '+i.src.slice(0,80);}).join('\n'));}},
  {n:'inputs',d:'Alle Input-Felder anzeigen',f:function(){var inp=Array.from(document.querySelectorAll('input,textarea,select'));addLog('info','Inputs ('+inp.length+'):\n'+inp.map(function(i){return i.tagName+(i.type?'['+i.type+']':'')+(i.name?' name='+i.name:'')+(i.id?' id='+i.id:'');}).join('\n'));}},
  {n:'buttons',d:'Alle Buttons anzeigen',f:function(){var bs=Array.from(document.querySelectorAll('button,[role=button]'));addLog('info','Buttons ('+bs.length+'):\n'+bs.map(function(b){return b.textContent.trim().slice(0,60)+(b.id?' #'+b.id:'');}).join('\n'));}},
  {n:'forms',d:'Alle Formulare anzeigen',f:function(){var fs=Array.from(document.querySelectorAll('form'));addLog('info','Formulare ('+fs.length+'): '+fs.map(function(f){return(f.id?'#'+f.id:f.name||'?')+(f.action?' → '+f.action:'');}).join(' | '));}},
  {n:'metas',d:'Meta-Tags anzeigen',f:function(){var ms=Array.from(document.querySelectorAll('meta'));addLog('info','Metas:\n'+ms.map(function(m){return(m.name||m.property||m.httpEquiv||'?')+': '+(m.content||'').slice(0,80);}).join('\n'));}},
  {n:'scripts',d:'Script-Tags anzeigen',f:function(){var ss=Array.from(document.querySelectorAll('script[src]'));addLog('info','Scripts ('+ss.length+'):\n'+ss.map(function(s){return s.src;}).join('\n'));}},
  {n:'stylesheets',d:'Stylesheets anzeigen',f:function(){var cs=Array.from(document.styleSheets);addLog('info','Stylesheets ('+cs.length+'):\n'+cs.map(function(s){return s.href||'<inline>';}).join('\n'));}},
  {n:'iframes',d:'iFrames anzeigen',f:function(){var fs=Array.from(document.querySelectorAll('iframe'));addLog('info','iFrames ('+fs.length+'):\n'+fs.map(function(f){return(f.src||'–')+(f.id?' #'+f.id:'');}).join('\n'));}},
  {n:'word-count',d:'Wörter auf der Seite zählen',f:function(){var t=(document.body.innerText||'').trim().split(/\s+/);addLog('info','Wörter: '+t.length+' | Zeichen: '+(document.body.innerText||'').length);}},
  // Visuelle Tools
  {n:'dark-mode',d:'Dark Mode aktivieren',f:function(){document.documentElement.style.filter='invert(1) hue-rotate(180deg)';}},
  {n:'light-mode',d:'Dark Mode entfernen',f:function(){document.documentElement.style.filter='';}},
  {n:'outline-all',d:'Alle Elemente umrahmen',f:function(){var s=document.createElement('style');s.id='__idt3_outline__';s.textContent='*{outline:1px solid rgba(255,0,0,0.4)!important;}';document.head.appendChild(s);addLog('info','Outline aktiviert');}},
  {n:'outline-off',d:'Element-Umrahmung entfernen',f:function(){var s=document.getElementById('__idt3_outline__');if(s)s.remove();addLog('info','Outline entfernt');}},
  {n:'hide-images',d:'Alle Bilder ausblenden',f:function(){document.querySelectorAll('img').forEach(function(i){i.style.visibility='hidden';});addLog('info','Bilder ausgeblendet');}},
  {n:'show-images',d:'Bilder wieder anzeigen',f:function(){document.querySelectorAll('img').forEach(function(i){i.style.visibility='';});addLog('info','Bilder eingeblendet');}},
  {n:'zoom-in',d:'Seiten-Zoom erhöhen',f:function(){document.body.style.zoom=String(Math.round(((parseFloat(document.body.style.zoom)||1)+0.1)*10)/10);addLog('info','Zoom: '+document.body.style.zoom);}},
  {n:'zoom-out',d:'Seiten-Zoom verringern',f:function(){document.body.style.zoom=String(Math.round(((parseFloat(document.body.style.zoom)||1)-0.1)*10)/10);addLog('info','Zoom: '+document.body.style.zoom);}},
  {n:'zoom-reset',d:'Seiten-Zoom zurücksetzen',f:function(){document.body.style.zoom='';addLog('info','Zoom zurückgesetzt');}},
  {n:'highlight-links',d:'Alle Links farbig markieren',f:function(){document.querySelectorAll('a').forEach(function(a){a.style.outline='2px solid #ff0';a.style.backgroundColor='rgba(255,255,0,0.15)';});addLog('info','Links markiert');}},
  {n:'remove-highlight',d:'Link-Markierung entfernen',f:function(){document.querySelectorAll('a').forEach(function(a){a.style.outline='';a.style.backgroundColor='';});addLog('info','Markierung entfernt');}},
  // Clipboard & Export
  {n:'copy-url',d:'URL in Zwischenablage kopieren',f:function(){if(navigator.clipboard){navigator.clipboard.writeText(location.href).then(function(){addLog('info','URL kopiert: '+location.href);}).catch(function(){addLog('error','Kopieren fehlgeschlagen');});}else{addLog('warn','Clipboard nicht verfügbar');}}},
  {n:'copy-title',d:'Seitentitel in Zwischenablage',f:function(){if(navigator.clipboard){navigator.clipboard.writeText(document.title).then(function(){addLog('info','Titel kopiert: '+document.title);});}else{addLog('warn','Clipboard nicht verfügbar');}}},
  {n:'copy-html',d:'Body-HTML in Zwischenablage',f:function(){if(navigator.clipboard){navigator.clipboard.writeText(document.body.innerHTML.slice(0,50000)).then(function(){addLog('info','HTML kopiert ('+document.body.innerHTML.length+' Zeichen)');});}else{addLog('warn','Clipboard nicht verfügbar');}}},
  // Performance & System
  {n:'perf',d:'Performance-Metriken',f:function(){var n=performance.getEntriesByType('navigation')[0];if(n)addLog('info','Load:'+Math.round(n.loadEventEnd)+'ms | DOM:'+Math.round(n.domContentLoadedEventEnd)+'ms | TTFB:'+Math.round(n.responseStart)+'ms');else addLog('info','Runtime: '+Math.round(performance.now())+'ms');}},
  {n:'timing',d:'Alle Performance-Einträge',f:function(){var rs=performance.getEntriesByType('resource').slice(0,10);addLog('info','Top-Ressourcen:\n'+rs.map(function(r){return Math.round(r.duration)+'ms '+r.name.slice(0,60);}).join('\n'));}},
  {n:'memory',d:'Speichernutzung (Chrome)',f:function(){var m=performance.memory;m?addLog('info','Used:'+Math.round(m.usedJSHeapSize/1048576)+'MB | Total:'+Math.round(m.totalJSHeapSize/1048576)+'MB | Limit:'+Math.round(m.jsHeapSizeLimit/1048576)+'MB'):addLog('warn','Nicht verfügbar');}},
  {n:'fonts',d:'Verwendete Schriften',f:function(){var fs=new Set();document.querySelectorAll('*').forEach(function(el){fs.add(getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/"/g,''));});addLog('info','Fonts ('+fs.size+'): '+Array.from(fs).join(', '));}},
  {n:'res-count',d:'Geladene Ressourcen zählen',f:function(){var rs=performance.getEntriesByType('resource');var types={};rs.forEach(function(r){var t=r.initiatorType||'other';types[t]=(types[t]||0)+1;});addLog('info','Ressourcen ('+rs.length+'): '+Object.keys(types).map(function(k){return k+':'+types[k];}).join(' | '));}},
  {n:'battery',d:'Batterie-Status',f:function(){navigator.getBattery?navigator.getBattery().then(function(b){addLog('info','Batterie: '+Math.round(b.level*100)+'% | Laden: '+b.charging);}):addLog('warn','Nicht verfügbar');}},
  {n:'vibrate',d:'Gerät vibrieren lassen',f:function(){navigator.vibrate?navigator.vibrate([100,50,100]):addLog('warn','Vibration nicht verfügbar');}},
  // Storage
  {n:'cookies',d:'Alle Cookies anzeigen',f:function(){addLog('info','Cookies: '+(document.cookie||'(leer)'));}},
  {n:'storage-clear',d:'localStorage leeren',f:function(){localStorage.clear();addLog('info','localStorage geleert');}},
  {n:'session-clear',d:'sessionStorage leeren',f:function(){sessionStorage.clear();addLog('info','sessionStorage geleert');}},
  {n:'cookies-clear',d:'Alle Cookies löschen',f:function(){document.cookie.split(';').forEach(function(c){var n=c.trim().split('=')[0];document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';});addLog('info','Cookies gelöscht');}},
  {n:'local-count',d:'localStorage-Einträge zählen',f:function(){addLog('info','localStorage: '+localStorage.length+' Einträge | sessionStorage: '+sessionStorage.length+' Einträge');}},
  // Sonstiges
  {n:'geolocation',d:'Standort abfragen',f:function(){navigator.geolocation?navigator.geolocation.getCurrentPosition(function(p){addLog('info','Lat:'+p.coords.latitude.toFixed(6)+' Lng:'+p.coords.longitude.toFixed(6)+' Acc:'+Math.round(p.coords.accuracy)+'m');},function(e){addLog('error',e.message);}):addLog('warn','Nicht verfügbar');}},
  {n:'fullscreen',d:'Browser-Vollbild aktivieren',f:function(){document.documentElement.requestFullscreen?document.documentElement.requestFullscreen():addLog('warn','Nicht verfügbar');}},
  {n:'color-scheme',d:'Farbschema des Systems',f:function(){addLog('info','Dark Mode: '+window.matchMedia('(prefers-color-scheme:dark)').matches+' | Reduced Motion: '+window.matchMedia('(prefers-reduced-motion:reduce)').matches);}},
  {n:'focus',d:'Aktuell fokussiertes Element',f:function(){var el=document.activeElement;addLog('info','Fokus: '+(el?el.tagName+(el.id?'#'+el.id:'')+(el.className?' .'+String(el.className).split(' ')[0]:''):'keins'));}},
];
function execCmd(raw){
  var input=raw.trim();
  if(!input)return;
  S.hist.unshift(input);S.hidx=-1;
  if(input===SECRET){S.spy=true;S.tab='activity';addLog('info','Activity Monitor aktiviert');render();return;}
  var cmd=CMDS.find(function(c){return c.n===input.split(' ')[0];});
  if(cmd){addLog('user','> '+input);cmd.f();return;}
  addLog('user','> '+input);
  try{var r=eval.call(window,input);if(r!==undefined)addLog('result',typeof r==='object'&&r!==null?JSON.stringify(r,null,2):String(r));}
  catch(e){addLog('error',e.message);}
}
function css(){
  var c=S.cfg.color||'#00cc88';var fs=S.cfg.fontSize||12;var op=S.cfg.opacity||0.96;
  var panelPos=S.fullscreen
    ?'left:0;top:0;width:100vw;height:100vh;border-radius:0;border:none;'
    :'left:'+S.x+'px;top:'+S.y+'px;width:'+S.w+'px;height:'+(S.minimized?44:S.h)+'px;border-radius:12px;border:1px solid #2a2a3a;';
  return [
    '#panel{position:fixed;z-index:2147483647;'+panelPos+'background:rgba(13,13,18,'+op+');display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,.8);overflow:hidden;font-family:monospace;font-size:'+fs+'px;color:#e2e2f0;}',
    '#tb{height:44px;min-height:44px;background:#14141c;border-bottom:1px solid #2a2a3a;display:flex;align-items:center;gap:4px;padding:0 8px;cursor:grab;touch-action:none;flex-shrink:0;}',
    '#tb span{flex:1;font-size:12px;font-weight:700;color:#fff;pointer-events:none;user-select:none;}',
    'button{cursor:pointer;border:none;outline:none;-webkit-appearance:none;}',
    '.x{background:none;color:#888;padding:6px 8px;border-radius:6px;font-size:14px;}',
    '.x:active{background:#222;}',
    '#tabs{display:flex;overflow-x:auto;background:#0d0d12;border-bottom:1px solid #2a2a3a;flex-shrink:0;scrollbar-width:none;}',
    '#tabs::-webkit-scrollbar{display:none;}',
    '.t{padding:9px 11px;font-size:11px;font-weight:600;color:#555;white-space:nowrap;border-bottom:2px solid transparent;background:none;flex-shrink:0;}',
    '.t.a{color:'+c+';border-bottom-color:'+c+';}',
    '.t:active{color:#aaa;}',
    '#body{flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0;}',
    '.pane{flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:3px;min-height:0;-webkit-overflow-scrolling:touch;}',
    '.pane::-webkit-scrollbar{width:3px;}.pane::-webkit-scrollbar-thumb{background:#333;border-radius:2px;}',
    '.ll{padding:2px 4px;border-radius:3px;font-size:'+fs+'px;line-height:1.55;word-break:break-all;white-space:pre-wrap;}',
    '.ll.log{color:#d4d4d4;}.ll.info{color:#9cdcfe;}.ll.warn{color:#dcdcaa;background:rgba(220,220,170,.06);}.ll.error{color:#f48771;background:rgba(244,135,113,.08);}.ll.result{color:'+c+';}.ll.user{color:#569cd6;}',
    '.lt{color:#444;font-size:9px;margin-right:4px;}',
    '#ibar{display:flex;gap:6px;padding:6px 8px;border-top:1px solid #2a2a3a;background:#0a0a10;flex-shrink:0;}',
    '#inp{flex:1;background:#1c1c28;border:1px solid #2a2a3a;border-radius:6px;color:#e2e2f0;padding:7px 10px;font-size:'+fs+'px;font-family:monospace;outline:none;-webkit-appearance:none;min-width:0;}',
    '#inp:focus{border-color:'+c+';}',
    '#runbtn{background:'+c+';color:#000;padding:7px 14px;border-radius:6px;font-size:12px;font-weight:700;flex-shrink:0;}',
    '#runbtn:active{opacity:.8;}',
    '.sh{font-size:10px;font-weight:700;color:#555;letter-spacing:1px;text-transform:uppercase;padding:4px 2px 2px;}',
    '.btn{background:#1c1c28;border:1px solid #333;color:#e2e2f0;padding:6px 12px;border-radius:6px;font-size:12px;margin:2px;display:inline-block;}',
    '.btn:active{background:#2a2a3a;}',
    '.btn.ac{background:'+c+';color:#000;border-color:'+c+';font-weight:700;}',
    '.btn.dn{background:#c33;border-color:#c33;color:#fff;}',
    '.ci{display:flex;align-items:center;gap:8px;padding:7px 8px;background:#14141c;border:1px solid #1e1e2a;border-radius:6px;}',
    '.ci:active{background:#1c1c28;}',
    '.cn{font-size:12px;font-weight:700;color:'+c+';flex-shrink:0;font-family:monospace;}',
    '.cd{font-size:11px;color:#666;flex:1;}',
    '.cr{background:#1c1c28;border:1px solid #333;color:#aaa;padding:4px 10px;border-radius:4px;font-size:11px;}',
    '.cr:active{background:#2a2a3a;}',
    '.si{width:100%;background:#1c1c28;border:1px solid #2a2a3a;border-radius:6px;color:#e2e2f0;padding:7px 10px;font-size:12px;font-family:monospace;outline:none;-webkit-appearance:none;box-sizing:border-box;margin-bottom:6px;}',
    '.si:focus{border-color:'+c+';}',
    'textarea.ed{width:100%;flex:1;min-height:100px;background:#0a0a10;border:1px solid #2a2a3a;border-radius:6px;color:#ce9178;padding:8px;font-size:11px;font-family:monospace;line-height:1.5;resize:vertical;outline:none;-webkit-appearance:none;box-sizing:border-box;}',
    'textarea.ed:focus{border-color:'+c+';}',
    '.sr{display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid #181824;}',
    '.sl{font-size:12px;color:#999;flex:1;}',
    '.sv{font-size:12px;color:'+c+';text-align:right;min-width:36px;}',
    'input[type=range]{accent-color:'+c+';width:90px;}',
    'input[type=color]{width:40px;height:26px;padding:1px;border:1px solid #333;border-radius:4px;background:#1c1c28;cursor:pointer;}',
    'select.sc{background:#1c1c28;border:1px solid #333;border-radius:4px;color:#e2e2f0;padding:3px 6px;font-size:11px;outline:none;}',
    '.ki{display:flex;align-items:flex-start;gap:6px;padding:5px 8px;background:#14141c;border:1px solid #1e1e2a;border-radius:5px;}',
    '.kk{font-size:11px;font-weight:700;color:#9cdcfe;min-width:70px;flex-shrink:0;word-break:break-all;}',
    '.kv{font-size:11px;color:#ce9178;flex:1;word-break:break-all;}',
    '.kx{background:none;color:#555;font-size:15px;padding:0 3px;flex-shrink:0;}',
    '.kx:active{color:#f48771;}',
    '.ni{padding:5px 8px;background:#14141c;border:1px solid #1e1e2a;border-radius:5px;}',
    '.nm{font-size:10px;font-weight:700;background:#007acc;color:#fff;padding:1px 5px;border-radius:3px;margin-right:5px;}',
    '.nu{font-size:11px;color:#e2e2f0;word-break:break-all;}',
    '.ns{font-size:10px;margin-top:2px;}',
    '.nok{color:'+c+'}.ner{color:#f48771;}.npd{color:#dcdcaa;}',
    '.ei{background:#14141c;border:1px solid #2a2a3a;border-radius:6px;padding:8px;}',
    '.etag{font-size:13px;font-weight:700;color:'+c+';margin-bottom:4px;}',
    '.eav{font-size:11px;color:#9cdcfe;line-height:1.7;}',
    '.evl{color:#ce9178;}',
    '.ai{padding:5px 8px;background:#14141c;border:1px solid #1e1e2a;border-radius:5px;margin-bottom:2px;}',
    '.at{font-size:10px;font-weight:700;color:'+c+';text-transform:uppercase;margin-right:5px;}',
    '.ad{font-size:11px;color:#d4d4d4;word-break:break-all;}',
    '.au{font-size:10px;color:#444;display:block;margin-top:1px;}',
    '.atm{font-size:9px;color:#444;float:right;}',
    '.rc{position:absolute;bottom:0;right:0;width:22px;height:22px;cursor:nwse-resize;touch-action:none;display:flex;align-items:flex-end;justify-content:flex-end;padding:3px;box-sizing:border-box;z-index:10;}',
    '.rc svg{opacity:0.4;pointer-events:none;}',
    '.rc:active svg,.rc:hover svg{opacity:0.9;}',
    '#panel{position:relative;}',
  ].join('');
}
var TABS=['console','elements','editor','styles','storage','network','commands','settings'];
var TLBL={console:'Console',elements:'Elements',editor:'Editor',styles:'Styles',storage:'Storage',network:'Network',commands:'Commands',settings:'Settings',activity:'Activity'};
function renderLog(){
  var lp=shadow.getElementById('logpane');
  if(!lp)return;
  lp.innerHTML=S.logs.map(function(l){return '<div class="ll '+l.type+'"><span class="lt">'+l.t+'</span>'+esc(l.msg)+'</div>';}).join('');
  lp.scrollTop=lp.scrollHeight;
}
function renderNet(){
  var np=shadow.getElementById('netpane');
  if(!np)return;
  np.innerHTML=S.net.slice().reverse().map(function(n){var sc=n.status==='...'?'npd':(Number(n.status)>=400||n.status==='ERR'?'ner':'nok');return '<div class="ni"><span class="nm">'+esc(n.method)+'</span><span class="nu">'+esc(String(n.url).slice(0,100))+'</span><div class="ns '+sc+'">'+esc(String(n.status))+'</div></div>';}).join('')||'<div style="color:#555;padding:8px;font-size:12px">Noch keine Requests</div>';
}
function buildPanel(){
  var tabs=TABS.slice();if(S.spy)tabs.push('activity');
  var tabsHtml=tabs.map(function(t){return '<button class="t'+(S.tab===t?' a':'')+'" data-tab="'+t+'">'+TLBL[t]+'</button>';}).join('');
  var inner='';
  if(S.tab==='console'){
    inner='<div class="pane" id="logpane">'+S.logs.map(function(l){return '<div class="ll '+l.type+'"><span class="lt">'+l.t+'</span>'+esc(l.msg)+'</div>';}).join('')+'</div>'+
      '<div id="ibar"><input id="inp" type="text" placeholder="JavaScript oder Befehl…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"><button id="runbtn">▶</button></div>';
  }else if(S.tab==='elements'){
    var ehtml='<div class="ei"><div class="etag">Kein Element ausgewählt</div><div class="eav">Tippe auf "Auswählen" um ein Element zu wählen.</div></div>';
    if(S.el&&document.contains(S.el)){
      var el=S.el;var ats=Array.from(el.attributes).map(function(a){return '<div class="eav">'+esc(a.name)+'=<span class="evl">"'+esc(a.value)+'"</span></div>';}).join('');
      ehtml='<div class="ei"><div class="etag">&lt;'+esc(el.tagName.toLowerCase())+'&gt;</div>'+ats+'<div class="eav" style="margin-top:6px">text: <span class="evl">'+esc((el.textContent||'').slice(0,100))+'</span></div><div class="eav">class: <span class="evl">'+esc(el.className)+'</span></div><div class="eav">id: <span class="evl">'+esc(el.id)+'</span></div></div>';
    }
    var compStyles='';
    if(S.el&&document.contains(S.el)){var cs2=getComputedStyle(S.el);var cps=['display','position','width','height','margin','padding','background','color','font-size','font-family','z-index','opacity'];compStyles='<div class="sh">Computed Styles</div>'+cps.map(function(p){return '<div class="sr"><span class="sl">'+p+'</span><span class="sv" style="color:#aaa;font-size:10px">'+esc(cs2.getPropertyValue(p))+'</span></div>';}).join('');}
    inner='<div class="pane"><div class="sh">Element Picker</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px"><button class="btn ac" id="pickbtn">'+(S.picking?'⏹ Abbrechen':'🎯 Auswählen')+'</button>'+(S.el&&document.contains(S.el)?'<button class="btn" id="scbtn">📍 Scrollen</button><button class="btn dn" id="delbtn">🗑 Löschen</button>':'')+'</div>'+ehtml+compStyles+'</div>';
  }else if(S.tab==='editor'){
    var hasEl=S.el&&document.contains(S.el);
    var edHtml=hasEl?S.el.outerHTML:'';
    var elLabel=hasEl?'&lt;'+esc(S.el.tagName.toLowerCase())+'&gt;'+(S.el.id?'#'+esc(S.el.id):'')+(S.el.className&&typeof S.el.className==='string'?' .'+esc(S.el.className.trim().split(/\s+/)[0]):''):'–';
    inner='<div class="pane" style="gap:6px">'+
      '<div class="sh">Ausgewähltes Element</div>'+
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;padding:7px 8px;background:#14141c;border:1px solid #1e1e2a;border-radius:6px;">'+
        '<span style="font-size:12px;font-weight:700;color:'+(hasEl?'#00cc88':'#555')+'">'+elLabel+'</span>'+
        '<button class="btn" id="ed-pick" style="margin:0;padding:4px 10px;font-size:11px">🎯 Element wählen</button>'+
      '</div>'+
      (hasEl?''  :'<div style="color:#555;font-size:12px;padding:4px 2px">Bitte zuerst ein Element auswählen (Element-Tab oder Button oben).</div>')+
      '<textarea class="ed" id="htmled" rows="12" placeholder="HTML des Elements…">'+esc(edHtml)+'</textarea>'+
      '<div style="display:flex;gap:4px;flex-wrap:wrap">'+
        '<button class="btn ac" id="applyhtml">✅ Anwenden</button>'+
        '<button class="btn" id="resethtml">↩ Zurücksetzen</button>'+
      '</div>'+
      '<div class="sh" style="margin-top:8px">CSS Injizieren</div>'+
      '<textarea class="ed" id="cssed" rows="4" placeholder="button { background: red; }"></textarea>'+
      '<button class="btn ac" id="applycss">✅ CSS anwenden</button>'+
    '</div>';
  }else if(S.tab==='styles'){
    if(!S.el||!document.contains(S.el)){inner='<div class="pane"><div class="ei"><div class="eav">Bitte zuerst im Elements-Tab ein Element auswählen.</div></div></div>';}
    else{var cs3=getComputedStyle(S.el);var sps=['color','background-color','font-size','font-family','font-weight','margin','padding','border','border-radius','display','position','top','left','width','height','opacity','transform','z-index','text-align','line-height','overflow','cursor'];inner='<div class="pane"><div class="sh">&lt;'+esc(S.el.tagName.toLowerCase())+'&gt; Inline Style</div><textarea class="ed" id="ised" rows="3">'+esc(S.el.style.cssText)+'</textarea><button class="btn ac" id="applystyle" style="margin-bottom:8px">✅ Anwenden</button><div class="sh">Computed</div>'+sps.map(function(p){return '<div class="sr"><span class="sl">'+p+'</span><span class="sv" style="color:#aaa;font-size:10px;word-break:break-all;text-align:left;flex:2">'+esc(cs3.getPropertyValue(p))+'</span></div>';}).join('')+'</div>';}
  }else if(S.tab==='storage'){
    var items=[];
    if(S.stor==='local'){try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);items.push({k:k,v:localStorage.getItem(k)});}}catch(e){}}
    else if(S.stor==='session'){try{for(var j=0;j<sessionStorage.length;j++){var sk2=sessionStorage.key(j);items.push({k:sk2,v:sessionStorage.getItem(sk2)});}}catch(e){}}
    else{document.cookie.split(';').forEach(function(c){var p=c.trim().split('=');if(p[0])items.push({k:p[0].trim(),v:p.slice(1).join('=')});});}
    var rows=items.map(function(item){return '<div class="ki"><span class="kk">'+esc(item.k)+'</span><span class="kv">'+esc((item.v||'').slice(0,150))+'</span><button class="kx" data-sdel="'+esc(item.k)+'" data-stab="'+S.stor+'">✕</button></div>';}).join('')||'<div style="color:#555;padding:8px;font-size:12px">Leer</div>';
    inner='<div class="pane"><div style="display:flex;gap:4px;margin-bottom:6px"><button class="btn'+(S.stor==='local'?' ac':'')+'" data-stor="local">Local</button><button class="btn'+(S.stor==='session'?' ac':'')+'" data-stor="session">Session</button><button class="btn'+(S.stor==='cookie'?' ac':'')+'" data-stor="cookie">Cookie</button></div>'+rows+'<div class="sh" style="margin-top:6px">Hinzufügen</div><div style="display:flex;gap:4px;flex-wrap:wrap"><input id="snk" class="si" placeholder="Key" style="flex:1;min-width:60px;margin-bottom:0"><input id="snv" class="si" placeholder="Value" style="flex:2;min-width:80px;margin-bottom:0"><button class="btn ac" id="sadd">+</button></div></div>';
  }else if(S.tab==='network'){
    inner='<div class="pane" id="netpane">'+( S.net.slice().reverse().map(function(n){var sc=n.status==='...'?'npd':(Number(n.status)>=400||n.status==='ERR'?'ner':'nok');return '<div class="ni"><span class="nm">'+esc(n.method)+'</span><span class="nu">'+esc(String(n.url).slice(0,100))+'</span><div class="ns '+sc+'">'+esc(String(n.status))+'</div></div>';}).join('')||'<div style="color:#555;padding:8px;font-size:12px">Noch keine Requests</div>' )+'</div><div id="ibar" style="border-top:1px solid #1e1e2a"><button class="btn dn" id="clearnet" style="margin:0">🗑 Leeren</button></div>';
  }else if(S.tab==='commands'){
    var q=(S.csearch||'').toLowerCase();var fcmds=q?CMDS.filter(function(c){return c.n.indexOf(q)!==-1||c.d.toLowerCase().indexOf(q)!==-1;}):CMDS;
    inner='<div class="pane"><input class="si" id="csearch" type="search" placeholder="Commands suchen…" value="'+esc(S.csearch||'')+'" autocorrect="off" autocapitalize="off">'+fcmds.map(function(c){return '<div class="ci"><span class="cn">'+esc(c.n)+'</span><span class="cd">'+esc(c.d)+'</span><button class="cr" data-runcmd="'+esc(c.n)+'">▶</button></div>';}).join('')+'</div>';
  }else if(S.tab==='settings'){
    var cf=S.cfg;
    inner='<div class="pane"><div class="sh">Darstellung</div>'+
      '<div class="sr"><span class="sl">Schriftgröße</span><input type="range" id="sfs" min="10" max="16" value="'+cf.fontSize+'"><span class="sv" id="sfsv">'+cf.fontSize+'px</span></div>'+
      '<div class="sr"><span class="sl">Transparenz</span><input type="range" id="sop" min="0.5" max="1" step="0.02" value="'+cf.opacity+'"><span class="sv" id="sopv">'+Math.round(cf.opacity*100)+'%</span></div>'+
      '<div class="sr"><span class="sl">Akzentfarbe</span><input type="color" id="scol" value="'+cf.color+'"></div>'+
      '<div class="sh" style="margin-top:8px">Verhalten</div>'+
      '<div class="sr"><span class="sl">Zeitstempel</span><select class="sc" id="sts"><option value="1"'+(cf.ts?' selected':'')+'>An</option><option value="0"'+(!cf.ts?' selected':'')+'>Aus</option></select></div>'+
      '<div class="sh" style="margin-top:8px">Panel-Breite</div>'+
      '<div class="sr"><span class="sl">Breite</span><input type="range" id="sw" min="320" max="750" value="'+S.w+'"><span class="sv" id="swv">'+S.w+'px</span></div>'+
      '<div class="sh" style="margin-top:8px">Aktionen</div>'+
      '<div style="display:flex;gap:4px;flex-wrap:wrap"><button class="btn dn" id="resetcfg">↩ Reset</button><button class="btn" id="exportlogs">📥 Logs</button></div>'+
      '</div>';
  }else if(S.tab==='activity'){
    var acts=S.act.slice().reverse().slice(0,200);
    inner='<div class="pane"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="color:#f48771;font-size:11px;flex:1">'+S.act.length+' Einträge</span><button class="btn dn" id="clearact">🗑</button><button class="btn" id="exportact">📥</button></div>'+
      (acts.map(function(a){var d=new Date(a.t);var tstr=d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0')+':'+d.getSeconds().toString().padStart(2,'0');return '<div class="ai"><span class="atm">'+tstr+'</span><span class="at">'+esc(a.type)+'</span><span class="ad">'+esc((a.detail||'').slice(0,100))+'</span><span class="au">'+esc((a.url||'').slice(0,60))+'</span></div>';}).join('')||'<div style="color:#555;padding:8px;font-size:12px">Noch leer</div>')+
      '</div>';
  }
  styleEl.textContent=css();
  panelEl.innerHTML=
    '<div id="tb"><span>🛠️ DevTools</span>'+
    '<button class="x" id="fsbtn" title="Vollbild">'+(S.fullscreen?'⊡':'⛶')+'</button>'+
    '<button class="x" id="minbtn">'+(S.minimized?'＋':'－')+'</button>'+
    '<button class="x" id="closebtn">✕</button>'+
    '</div>'+
    (S.minimized||S.fullscreen?'':'<div id="tabs">'+tabsHtml+'</div><div id="body">'+inner+'</div><div class="rc" id="rc"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="4" y1="12" x2="12" y2="4" stroke="#aaa" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="12" x2="12" y2="8" stroke="#aaa" stroke-width="1.5" stroke-linecap="round"/></svg></div>');
}
function render(){buildPanel();bindPanelEvents();}
var _hlEl=null;
function startPicking(){
  S.picking=true;render();
  var ov=document.createElement('div');
  ov.id='__idt3ov__';
  Object.assign(ov.style,{position:'fixed',inset:'0',zIndex:'2147483646',cursor:'crosshair',background:'transparent'});
  document.body.appendChild(ov);
  function getAt(x,y){ov.style.display='none';var e=document.elementFromPoint(x,y);ov.style.display='';return e;}
  function hl(el){if(_hlEl&&document.contains(_hlEl)){_hlEl.style.outline=_hlEl.__idt3ol__||'';}_hlEl=null;if(!el||el.id===ID||el.id==='__idt3ov__')return;_hlEl=el;el.__idt3ol__=el.style.outline||'';el.style.outline='2px solid '+(S.cfg.color||'#00cc88');}
  function pick(el){if(el&&el!==ov&&el.id!==ID&&el.id!=='__idt3ov__'){S.el=el;addLog('info','Ausgewählt: <'+el.tagName.toLowerCase()+'>'+(el.id?'#'+el.id:'')+(el.className&&typeof el.className==='string'?' .'+el.className.trim().split(/\s+/)[0]:''));}stopPicking();}
  ov.addEventListener('touchmove',function(e){hl(getAt(e.touches[0].clientX,e.touches[0].clientY));e.preventDefault();},{passive:false});
  ov.addEventListener('touchend',function(e){var t=e.changedTouches[0];var el=getAt(t.clientX,t.clientY);if(_hlEl&&document.contains(_hlEl)){_hlEl.style.outline=_hlEl.__idt3ol__||'';_hlEl=null;}pick(el);e.preventDefault();},{passive:false});
  ov.addEventListener('mousemove',function(e){hl(getAt(e.clientX,e.clientY));});
  ov.addEventListener('click',function(e){var el=getAt(e.clientX,e.clientY);if(_hlEl&&document.contains(_hlEl)){_hlEl.style.outline=_hlEl.__idt3ol__||'';_hlEl=null;}pick(el);});
}
function stopPicking(){
  S.picking=false;var ov=document.getElementById('__idt3ov__');if(ov)ov.remove();
  if(_hlEl&&document.contains(_hlEl)){_hlEl.style.outline=_hlEl.__idt3ol__||'';_hlEl=null;}
  render();
}
function bindPanelEvents(){
  var tb=shadow.getElementById('tb');
  if(tb){
    function onDragStart(x,y){S.drag.on=true;S.drag.ox=x-S.x;S.drag.oy=y-S.y;}
    tb.addEventListener('touchstart',function(e){if(e.target.tagName==='BUTTON')return;onDragStart(e.touches[0].clientX,e.touches[0].clientY);e.preventDefault();},{passive:false});
    tb.addEventListener('mousedown',function(e){if(e.target.tagName==='BUTTON')return;onDragStart(e.clientX,e.clientY);e.preventDefault();});
  }
  var rc2=shadow.getElementById('rc');
  if(rc2){
    rc2.addEventListener('touchstart',function(e){S.rsz={on:true,dir:'c',ox:e.touches[0].clientX,oy:e.touches[0].clientY,ow:S.w,oh:S.h};e.preventDefault();},{passive:false});
    rc2.addEventListener('mousedown',function(e){S.rsz={on:true,dir:'c',ox:e.clientX,oy:e.clientY,ow:S.w,oh:S.h};e.preventDefault();});
  }
  var cb=shadow.getElementById('closebtn');if(cb)cb.addEventListener('click',function(){root.remove();window.__idt3_restore__();});
  var mb=shadow.getElementById('minbtn');if(mb)mb.addEventListener('click',function(){S.minimized=!S.minimized;render();});
  var fsb=shadow.getElementById('fsbtn');if(fsb)fsb.addEventListener('click',function(){
    if(!S.fullscreen){
      S.prevPos={x:S.x,y:S.y,w:S.w,h:S.h};
      S.fullscreen=true;S.minimized=false;
    }else{
      S.fullscreen=false;
      if(S.prevPos){S.x=S.prevPos.x;S.y=S.prevPos.y;S.w=S.prevPos.w;S.h=S.prevPos.h;S.prevPos=null;}
    }
    render();
  });
  shadow.querySelectorAll('[data-tab]').forEach(function(el){el.addEventListener('click',function(){S.tab=this.dataset.tab;render();});});
  var inp=shadow.getElementById('inp');
  var rb=shadow.getElementById('runbtn');
  function runInp(){if(!inp)return;var v=inp.value.trim();if(!v)return;execCmd(v);inp.value='';inp.focus();}
  if(inp){
    inp.addEventListener('keydown',function(e){
      if(e.key==='Enter'){e.preventDefault();runInp();}
      else if(e.key==='ArrowUp'){e.preventDefault();S.hidx=Math.min(S.hist.length-1,S.hidx+1);inp.value=S.hist[S.hidx]||'';}
      else if(e.key==='ArrowDown'){e.preventDefault();S.hidx=Math.max(-1,S.hidx-1);inp.value=S.hidx>=0?(S.hist[S.hidx]||''):'';}
    });
  }
  if(rb)rb.addEventListener('click',function(){runInp();});
  var pkb=shadow.getElementById('pickbtn');if(pkb)pkb.addEventListener('click',function(){S.picking?stopPicking():startPicking();});
  var scb=shadow.getElementById('scbtn');if(scb)scb.addEventListener('click',function(){if(S.el&&document.contains(S.el))S.el.scrollIntoView({behavior:'smooth',block:'center'});});
  var dlb=shadow.getElementById('delbtn');if(dlb)dlb.addEventListener('click',function(){if(S.el&&document.contains(S.el)){S.el.remove();S.el=null;render();}});
  var edpick=shadow.getElementById('ed-pick');if(edpick)edpick.addEventListener('click',function(){startPicking();});
  var aph=shadow.getElementById('applyhtml');if(aph)aph.addEventListener('click',function(){
    var e=shadow.getElementById('htmled');if(!e||!e.value.trim())return;
    if(!S.el||!document.contains(S.el)){addLog('warn','Kein Element ausgewählt – bitte zuerst ein Element wählen');return;}
    try{
      var parent=S.el.parentNode;if(!parent){addLog('error','Element hat kein Elternelement');return;}
      var tmp=document.createElement('div');tmp.innerHTML=e.value;
      var newEl=tmp.firstChild;
      if(!newEl){addLog('error','Ungültiges HTML');return;}
      parent.replaceChild(newEl,S.el);
      S.el=newEl;
      addLog('info','Element aktualisiert: <'+newEl.tagName.toLowerCase()+'>');
      render();
    }catch(ex){addLog('error','Fehler: '+ex.message);}
  });
  var rsh=shadow.getElementById('resethtml');if(rsh)rsh.addEventListener('click',function(){var e=shadow.getElementById('htmled');if(e&&S.el&&document.contains(S.el))e.value=S.el.outerHTML;});
  var apc=shadow.getElementById('applycss');if(apc)apc.addEventListener('click',function(){var e=shadow.getElementById('cssed');if(!e||!e.value.trim())return;var s=document.createElement('style');s.textContent=e.value;document.head.appendChild(s);addLog('info','CSS injiziert');});
  var aps=shadow.getElementById('applystyle');if(aps)aps.addEventListener('click',function(){var e=shadow.getElementById('ised');if(!e||!S.el||!document.contains(S.el))return;S.el.style.cssText=e.value;addLog('info','Style angewendet');render();});
  shadow.querySelectorAll('[data-stor]').forEach(function(el){el.addEventListener('click',function(){S.stor=this.dataset.stor;render();});});
  shadow.querySelectorAll('[data-sdel]').forEach(function(el){el.addEventListener('click',function(){var k=this.dataset.sdel,t=this.dataset.stab;if(t==='local')localStorage.removeItem(k);else if(t==='session')sessionStorage.removeItem(k);else document.cookie=k+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';render();});});
  var sa=shadow.getElementById('sadd');if(sa)sa.addEventListener('click',function(){var nk=shadow.getElementById('snk'),nv=shadow.getElementById('snv');if(!nk||!nk.value.trim())return;if(S.stor==='local')localStorage.setItem(nk.value,nv?nv.value:'');else if(S.stor==='session')sessionStorage.setItem(nk.value,nv?nv.value:'');nk.value='';if(nv)nv.value='';render();});
  var cn2=shadow.getElementById('clearnet');if(cn2)cn2.addEventListener('click',function(){S.net=[];render();});
  var cs2=shadow.getElementById('csearch');if(cs2){cs2.addEventListener('input',function(){S.csearch=this.value;render();});}
  shadow.querySelectorAll('[data-runcmd]').forEach(function(el){el.addEventListener('click',function(){execCmd(this.dataset.runcmd);S.tab='console';render();});});
  var sfs=shadow.getElementById('sfs');if(sfs){sfs.addEventListener('input',function(){S.cfg.fontSize=Number(this.value);shadow.getElementById('sfsv').textContent=this.value+'px';saveSet();styleEl.textContent=css();});}
  var sop=shadow.getElementById('sop');if(sop){sop.addEventListener('input',function(){S.cfg.opacity=Number(this.value);shadow.getElementById('sopv').textContent=Math.round(Number(this.value)*100)+'%';saveSet();styleEl.textContent=css();});}
  var scol=shadow.getElementById('scol');if(scol){scol.addEventListener('input',function(){S.cfg.color=this.value;saveSet();render();});}
  var sts=shadow.getElementById('sts');if(sts){sts.addEventListener('change',function(){S.cfg.ts=this.value==='1';saveSet();});}
  var sw2=shadow.getElementById('sw');if(sw2){sw2.addEventListener('input',function(){S.w=Number(this.value);S.cfg.w=S.w;shadow.getElementById('swv').textContent=this.value+'px';saveSet();panelEl.style.width=S.w+'px';});}
  var rc=shadow.getElementById('resetcfg');if(rc)rc.addEventListener('click',function(){localStorage.removeItem(SKEY);S.cfg=loadSet();render();addLog('info','Einstellungen zurückgesetzt');});
  var el2=shadow.getElementById('exportlogs');if(el2)el2.addEventListener('click',function(){var b=new Blob([JSON.stringify(S.logs,null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='logs-'+Date.now()+'.json';a.click();});
  var ca=shadow.getElementById('clearact');if(ca)ca.addEventListener('click',function(){S.act=[];saveAct();render();});
  var ea=shadow.getElementById('exportact');if(ea)ea.addEventListener('click',function(){var b=new Blob([JSON.stringify(S.act,null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='activity-'+Date.now()+'.json';a.click();});
}
document.addEventListener('touchmove',function(e){
  if(S.drag.on){var t=e.touches[0];S.x=Math.max(0,Math.min(window.innerWidth-S.w,t.clientX-S.drag.ox));S.y=Math.max(0,Math.min(window.innerHeight-44,t.clientY-S.drag.oy));panelEl.style.left=S.x+'px';panelEl.style.top=S.y+'px';e.preventDefault();}
  if(S.rsz.on&&S.rsz.dir==='c'){
    S.w=Math.max(280,Math.min(window.innerWidth-S.x,S.rsz.ow+(e.touches[0].clientX-S.rsz.ox)));
    S.h=Math.max(200,Math.min(window.innerHeight-S.y,S.rsz.oh+(e.touches[0].clientY-S.rsz.oy)));
    panelEl.style.width=S.w+'px';panelEl.style.height=S.h+'px';e.preventDefault();
  }
},{passive:false});
document.addEventListener('touchend',function(){S.drag.on=false;S.rsz.on=false;});
document.addEventListener('mousemove',function(e){
  if(S.drag.on){S.x=Math.max(0,Math.min(window.innerWidth-S.w,e.clientX-S.drag.ox));S.y=Math.max(0,Math.min(window.innerHeight-44,e.clientY-S.drag.oy));panelEl.style.left=S.x+'px';panelEl.style.top=S.y+'px';}
  if(S.rsz.on&&S.rsz.dir==='c'){
    S.w=Math.max(280,Math.min(window.innerWidth-S.x,S.rsz.ow+(e.clientX-S.rsz.ox)));
    S.h=Math.max(200,Math.min(window.innerHeight-S.y,S.rsz.oh+(e.clientY-S.rsz.oy)));
    panelEl.style.width=S.w+'px';panelEl.style.height=S.h+'px';
  }
});
document.addEventListener('mouseup',function(){S.drag.on=false;S.rsz.on=false;});
render();
addLog('info','iPad DevTools v3 geladen - '+new Date().toLocaleTimeString());
addLog('info','Seite: '+location.href);
addLog('info','Viewport: '+window.innerWidth+'x'+window.innerHeight+' | dpr: '+window.devicePixelRatio);
addLog('info','Tipp: "help" fuer alle Commands');
trackAct('open','DevTools auf '+location.href);
})();