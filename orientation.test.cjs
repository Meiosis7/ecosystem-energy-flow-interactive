const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const source=html.match(/<script id="mobile-guidance">([\s\S]*?)<\/script>/);
assert.ok(source,'Mobile orientation guidance must be present');
function start(portrait,storage=new Map(),blocked=false){
 const elements={};
 for(const id of ['orientation-tip','orientation-dismiss','orientation-portrait','explanation-toggle','step-explanation']) elements[id]={hidden:true,textContent:'',attrs:{},setAttribute(k,v){this.attrs[k]=v},classList:{toggle(k,v){this[k]=v}}};
 const media={matches:portrait,addEventListener(_,fn){this.change=fn}};
 vm.runInNewContext(source[1],{document:{getElementById:id=>elements[id]},window:{matchMedia:()=>media,sessionStorage:{getItem(k){if(blocked)throw Error('blocked');return storage.get(k)},setItem(k,v){if(blocked)throw Error('blocked');storage.set(k,v)}}}});
 return{elements,rotate(p){media.matches=p;media.change()}};
}
const session=new Map(),phone=start(true,session);
assert.equal(phone.elements['orientation-tip'].hidden,false,'Portrait first visit shows a non-blocking tip');
phone.elements['orientation-portrait'].onclick();
assert.equal(phone.elements['orientation-tip'].hidden,true);
assert.equal(start(true,session).elements['orientation-tip'].hidden,true,'Dismissal survives same-session reload');
const rotate=start(true);rotate.rotate(false);assert.equal(rotate.elements['orientation-tip'].hidden,true);rotate.rotate(true);assert.equal(rotate.elements['orientation-tip'].hidden,true,'Rotation does not repeatedly prompt');
assert.equal(start(false).elements['orientation-tip'].hidden,true,'Landscape and desktop do not prompt');
const privateMode=start(true,new Map(),true);privateMode.elements['orientation-dismiss'].onclick();privateMode.rotate(false);privateMode.rotate(true);assert.equal(privateMode.elements['orientation-tip'].hidden,true,'Blocked storage still allows dismissal');
phone.elements['explanation-toggle'].onclick();assert.equal(phone.elements['explanation-toggle'].attrs['aria-expanded'],'true');phone.elements['explanation-toggle'].onclick();assert.equal(phone.elements['explanation-toggle'].attrs['aria-expanded'],'false');
console.log('PASS: 首次竖屏提示、会话内关闭记忆、旋转自动消失、存储受限降级、说明展开收起');
