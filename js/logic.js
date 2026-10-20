// 論理演算（式ツリー）。真理値表・正解判定・回路図の出力計算はすべてここを使う。
const Logic=(()=>{
const G={AND:(...a)=>+a.every(Boolean),OR:(...a)=>+a.some(Boolean),NOT:a=>a^1,NAND:(...a)=>+!a.every(Boolean),NOR:(...a)=>+!a.some(Boolean),XOR:(...a)=>a.reduce((x,y)=>x^y),XNOR:(...a)=>a.reduce((x,y)=>x^y)^1};
const mk=(op,...args)=>({op,args});
const ev=(n,e)=>typeof n==='string'?e[n]:G[n.op](...n.args.map(c=>ev(c,e)));
const vars=n=>typeof n==='string'?[n]:[...new Set(n.args.flatMap(vars))].sort();
const envs=vs=>Array.from({length:1<<vs.length},(_,i)=>Object.fromEntries(vs.map((v,j)=>[v,(i>>(vs.length-1-j))&1])));
const table=(n,vs=vars(n))=>envs(vs).map(e=>ev(n,e));
const sig=(n,vs)=>table(n,vs).join('');
const gates=(n,a=[])=>{if(typeof n!=='string'){n.args.forEach(c=>gates(c,a));a.push(n)}return a};
return{G,mk,ev,vars,envs,table,sig,gates};
})();
if(typeof module!=='undefined')module.exports=Logic;
