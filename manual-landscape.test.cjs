const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const source=html.match(/<script id="mobile-guidance">([\s\S]*?)<\/script>/)[1];
function start(){
 const elements={},classes=new Set(),events={},media={matches:true,addEventListener(_,fn){this.change=fn}};
 for(const id of ['orientation-tip','orientation-dismiss','orientation-portrait','orientation-start','landscape-toggle','explanation-toggle','step-explanation','lesson-page'])elements[id]={hidden:true,textContent:'',attrs:{},setAttribute(k,v){this.attrs[k]=v},classList:{toggle(){}}};
 const win={innerWidth:390,innerHeight:844,matchMedia:()=>media,sessionStorage:{getItem(){return null},setItem(){}},addEventListener(k,fn){events[k]=fn}};
 const doc={getElementById:id=>elements[id],body:{classList:{toggle(k,v){v?classes.add(k):classes.delete(k)},contains:k=>classes.has(k)}}};
 vm.runInNewContext(source,{document:doc,window:win});
 return{elements,classes,rotate(){win.innerWidth=844;win.innerHeight=390;media.matches=false;events.resize?.();media.change?.()}};
}
const app=start();
assert.equal(typeof app.elements['orientation-start'].onclick,'function','The portrait hint must offer a working landscape button');
app.elements['orientation-start'].onclick();
assert.equal(app.classes.has('manual-landscape'),true,'Manual landscape must work with a portrait-locked viewport');
assert.equal(app.elements['landscape-toggle'].attrs['aria-pressed'],'true');
assert.equal(app.elements['landscape-toggle'].textContent,'退出横屏');
assert.equal(app.elements['orientation-tip'].hidden,true);
app.elements['landscape-toggle'].onclick();
assert.equal(app.classes.has('manual-landscape'),false,'An exit must restore portrait');
assert.equal(app.elements['landscape-toggle'].attrs['aria-pressed'],'false');
app.elements['landscape-toggle'].onclick();app.rotate();
assert.equal(app.classes.has('manual-landscape'),false,'Physical rotation must avoid rotating an already landscape viewport twice');
console.log('PASS: portrait-lock fallback, visible exit and natural rotation handoff');
