const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
function app(phone){const els={},modes=['producer','primary','secondary','overview'].map(mode=>({dataset:{mode},setAttribute(){}}));
function el(id){return els[id]??={value:0,checked:false,innerHTML:'',textContent:'',style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},setAttribute(k,v){this[k]=v},querySelectorAll(){return[]},scrollIntoView(){},getBoundingClientRect(){return{top:0}},clientWidth:360}}
const c={document:{getElementById:el,querySelectorAll:()=>modes,addEventListener(){}},window:{matchMedia:()=>({matches:phone,addEventListener(){}}),scrollTo(){},scrollY:0,innerHeight:800},setTimeout(){},clearTimeout(){}};vm.createContext(c);for(const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],c);return{els,modes}}
const phone=app(true),desktop=app(false);
for(let mode=0;mode<4;mode++){
phone.modes[mode].onclick();desktop.modes[mode].onclick();
for(let step=0;step<4;step++){
assert.equal(phone.els.canvas['data-layout'],'landscape','Phone keeps the horizontal flow');
assert.equal(phone.els.diagram.viewBox,desktop.els.diagram.viewBox);
assert.equal(phone.els.diagram.innerHTML,desktop.els.diagram.innerHTML,'Same teaching positions, arrows and labels on phone and desktop');
phone.els.next.onclick();desktop.els.next.onclick();}
}
assert.equal(phone.els['fit-view'].textContent,'放大细看');phone.els['fit-view'].onclick();assert.equal(phone.els['fit-view'].textContent,'完整画面');assert.equal(phone.els.canvas['data-layout'],'landscape');
console.log('PASS: 手机默认横向、分步位置与桌面一致、放大查看不切换为竖向');
