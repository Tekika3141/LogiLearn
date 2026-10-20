const assert=require('assert');
global.Logic=require('../js/logic.js');global.Symbols=require('../js/symbols.js');global.R=require('../js/render.js');
const Q=require('../js/questions.js'),{mk,sig,ev,envs}=Logic;
const T={AND:'0001',OR:'0111',NAND:'1110',NOR:'1000',XOR:'0110',XNOR:'1001'};
for(const[k,v]of Object.entries(T))assert.strictEqual(sig(mk(k,'A','B')),v,k);
assert.strictEqual(sig(mk('NOT','A')),'10');
assert.strictEqual(new Set([...Object.values(T),'10']).size,7);
for(const e of envs(['A','B','Cin']))assert.strictEqual(ev(Q.FA.S,e)+2*ev(Q.FA.C,e),e.A+e.B+e.Cin);
for(const e of envs(['A','B']))assert.strictEqual(ev(Q.HA.S,e)+2*ev(Q.HA.C,e),e.A+e.B);
for(const e of envs(['A','B','C']))assert.strictEqual(ev(Q.MAJ,e),+(e.A+e.B+e.C>=2));
// オーバーバーの範囲
const nand=R.fmt(mk('NAND','A','B')),nn=R.fmt(mk('AND',mk('NOT','A'),mk('NOT','B')));
assert.strictEqual(nand,'<span class="ob">A・B</span>');assert.notStrictEqual(nand,nn);
assert.strictEqual(R.fmt(mk('XNOR','A','B')),'<span class="ob">A⊕B</span>');
assert.strictEqual(R.fmt(mk('NOR','A','B')),'<span class="ob">A＋B</span>');
// 問題
const ids=new Set();let c=0;
for(const style of['ANSI','JIS']){Symbols.current=style;
 for(const q of Q.all){
  if(style==='ANSI'){assert(!ids.has(q.id));ids.add(q.id);
   const ks=q.choices.map(x=>x.k);assert.strictEqual(new Set(ks).size,ks.length,q.id+' 選択肢の重複');assert(ks.includes(q.answer),q.id+' 正解なし');
   if(q.src)assert.strictEqual(sig(q.src,Logic.vars(q.src).includes('Cin')?['A','B','Cin']:['A','B']),q.answer,q.id);
   const ms=[].concat(q.material||[]);
   if(ms.length===1&&ms[0].kind==='circuit'&&q.choices.length===2)assert.strictEqual(q.answer,String(ev(ms[0].tree,ms[0].env)),q.id);}
  [].concat(q.material||[]).forEach(m=>{assert(R.mat(m).length>0);c++});}}
console.log('OK 問題数',Q.all.length,'描画',c);
