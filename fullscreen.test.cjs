const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),source=html.match(/<script id="mobile-guidance">([\s\S]*?)<\/script>/)[1];
function start(native='supported'){
 const classes=new Set(),els={},events={},stats={requests:0,exits:0};
 for(const id of ['orientation-tip','orientation-dismiss','orientation-portrait','orientation-start','landscape-toggle','explanation-toggle','step-explanation','lesson-page','fullscreen','presentation-exit'])els[id]={hidden:true,textContent:'',attrs:{},setAttribute(k,v){this.attrs[k]=v},classList:{toggle(){}}};
 const doc={getElementById:id=>els[id],body:{classList:{toggle(k,v){v?classes.add(k):classes.delete(k)},contains:k=>classes.has(k)}},documentElement:{},addEventListener(k,f){events[k]=f}};
 if(native!=='unsupported')doc.documentElement.requestFullscreen=()=>{stats.requests++;if(native==='rejected')return Promise.reject(Error('not allowed'));doc.fullscreenElement=doc.documentElement;events.fullscreenchange?.();return Promise.resolve()};
 doc.exitFullscreen=()=>{stats.exits++;doc.fullscreenElement=null;events.fullscreenchange?.();return Promise.resolve()};
 const win={innerWidth:390,innerHeight:844,matchMedia:()=>({matches:true,addEventListener(){}}),addEventListener(k,f){events[k]=f},sessionStorage:{getItem(){},setItem(){}}};
 vm.runInNewContext(source,{document:doc,window:win});
 return{els,classes,stats,rotate(){win.innerWidth=844;win.innerHeight=390;events.resize?.()},escape(){doc.fullscreenElement=null;events.fullscreenchange?.()}};
}
(async()=>{
 const app=start();app.els['orientation-start'].onclick();
 assert.equal(app.classes.has('presentation-mode'),true,'Landscape entry must fill the viewport with the teaching stage');
 assert.equal(app.stats.requests,1,'A user click should request browser fullscreen');
 app.rotate();assert.equal(app.classes.has('manual-landscape'),false);assert.equal(app.classes.has('presentation-mode'),true,'Natural rotation retains the fullscreen teaching stage');
 app.els['presentation-exit'].onclick();assert.equal(app.classes.has('presentation-mode'),false);assert.equal(app.stats.exits,1);
 app.els.fullscreen.onclick();app.escape();assert.equal(app.classes.has('presentation-mode'),false,'Browser fullscreen exit also restores normal reading');
 for(const mode of ['unsupported','rejected']){const fallback=start(mode);fallback.els['orientation-start'].onclick();await Promise.resolve();assert.equal(fallback.classes.has('presentation-mode'),true,'Unsupported/rejected native fullscreen must still fill the browser viewport');fallback.els['presentation-exit'].onclick();assert.equal(fallback.classes.has('manual-landscape'),false)}
 console.log('PASS: native fullscreen, denied/unsupported fallback, rotation continuity and both exits');
})().catch(e=>{console.error(e);process.exitCode=1});
