const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),ctx={};
vm.createContext(ctx);vm.runInContext(html.match(/<script id="lesson-model">([\s\S]*?)<\/script>/)[1]+';this.L=Lessons;this.M=typeof MobileLayout!=="undefined"?MobileLayout:null;',ctx);
assert.ok(ctx.M,'Phone lessons need a portrait layout instead of shrinking the desktop canvas');
for(const mode of ['producer','primary','secondary'])for(const period of [false,true]){
 const original=ctx.L.build(mode,period),snapshot=JSON.stringify(original),layout=ctx.M.build(original,mode);
 assert.equal(layout.width,420);
 assert.deepEqual(Array.from(layout.nodes,n=>n.id),Array.from(original.nodes,n=>n.id));
 for(const n of layout.nodes){const old=original.nodes.find(v=>v.id===n.id);assert.equal(n.show,old.show);assert.equal(n.value,old.value);assert.equal(n.text,old.text);assert.ok(n.x>=0&&n.x<=420)}
 assert.deepEqual(Array.from(layout.edges,e=>[e.from,e.to,e.show]),Array.from(original.edges,e=>[e.from,e.to,e.show]));
 let previousHeight=0;
 for(let step=0;step<original.steps.length;step++){
  const h=layout.heightAt(step);assert.ok(h>=previousHeight,'Expansion must not move or crop prior content');previousHeight=h;
  for(const n of layout.nodes.filter(n=>n.show<=step))assert.ok(n.y+(n.sprite>=0?110:60)<h,`Visible node ${n.id} must fit`);
 }
 assert.ok(layout.heightAt(0)<450,'Opening phone scene should fit roughly one phone viewport');
 assert.equal(JSON.stringify(original),snapshot,'Portrait layout must not mutate teaching data');
}
console.log('PASS: portrait scenes retain biological data, cumulative stages, visible extents and a compact opening');
