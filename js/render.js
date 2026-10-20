// 表示（オーバーバー式・真理値表・ベン図・回路図）。論理は Logic に委譲。
const R=(()=>{
const ob=s=>`<span class="ob">${s}</span>`;
const SY={AND:'・',OR:'＋',XOR:'⊕'},BS={NAND:'AND',NOR:'OR',XNOR:'XOR'},PR={OR:1,XOR:2,AND:3};
const inner=(n,op)=>n.args.map(c=>{const s=fmt(c);return typeof c!=='string'&&PR[c.op]<PR[op]?`(${s})`:s}).join(SY[op]);
function fmt(n){if(typeof n==='string')return n;if(n.op==='NOT')return ob(fmt(n.args[0]));return BS[n.op]?ob(inner(n,BS[n.op])):inner(n,n.op)}
const table=(cols,vs)=>`<table class="tt"><tr>${vs.map(v=>`<th>${v}</th>`).join('')}${cols.map(c=>`<th class="o">${c.name}</th>`).join('')}</tr>${Logic.envs(vs).map(e=>`<tr>${vs.map(v=>`<td>${e[v]}</td>`).join('')}${cols.map(c=>`<td class="o">${Logic.ev(c.tree,e)}</td>`).join('')}</tr>`).join('')}</table>`;
const venn=t=>{const vs=Logic.vars(t),one=vs.length==1,f=(a,b)=>Logic.ev(t,one?{[vs[0]]:a}:{[vs[0]]:a,[vs[1]]:b}),c=v=>v?'var(--on)':'var(--bg)',s='stroke="var(--fg)" stroke-width="2"';
 return one?`<svg class="venn" viewBox="0 0 160 110"><rect x="2" y="2" width="156" height="106" fill="${c(f(0))}" ${s}/><circle cx="80" cy="55" r="38" fill="${c(f(1))}" ${s}/><text x="74" y="60" class="lt">A</text></svg>`
 :`<svg class="venn" viewBox="0 0 200 110"><defs><clipPath id="ca"><circle cx="75" cy="55" r="38"/></clipPath></defs><rect x="2" y="2" width="196" height="106" fill="${c(f(0,0))}" ${s}/><circle cx="75" cy="55" r="38" fill="${c(f(1,0))}"/><circle cx="125" cy="55" r="38" fill="${c(f(0,1))}"/><circle cx="125" cy="55" r="38" fill="${c(f(1,1))}" clip-path="url(#ca)"/><circle cx="75" cy="55" r="38" fill="none" ${s}/><circle cx="125" cy="55" r="38" fill="none" ${s}/><text x="50" y="60" class="lt">A</text><text x="141" y="60" class="lt">B</text></svg>`};
const diagram=(t,env,lbl='F')=>{
 let slot=0;const W=[],Gs=[],CW=110,RW=50;
 const h=n=>typeof n==='string'?0:1+Math.max(...n.args.map(h));
 function lay(n){
  if(typeof n==='string'){const y=slot++*RW+30;W.push(`<text x="0" y="${y+5}" class="lt">${n}${env?'＝'+env[n]:''}</text>`);return{x:58,y}}
  const k=n.args.map(lay),gx=90+(h(n)-1)*CW,y=k.reduce((s,c)=>s+c.y,0)/k.length,s=Symbols.draw(n.op),m=k.length,ys=m==1?[20]:m==2?[10,30]:[6,20,34];
  k.forEach((c,i)=>{const iy=y-20+ys[i];W.push(`<path class="w" d="M${c.x},${c.y}H${gx-16}V${iy}H${gx+4}"/>`)});
  Gs.push(`<g class="g" transform="translate(${gx},${y-20})">${s.s}</g>`);
  return{x:gx+s.w,y};
 }
 const r=lay(t);W.push(`<path class="w" d="M${r.x},${r.y}h30"/><text x="${r.x+36}" y="${r.y+5}" class="lt">${lbl}</text>`);
 const w=r.x+80;
 return `<svg class="dg" viewBox="0 0 ${w} ${slot*RW+10}" width="${w}">${W.join('')}${Gs.join('')}</svg>`;
};
const mat=m=>{switch(m.kind){
 case'table':return table(m.cols,m.vs);
 case'formula':return `<div class="fm">${m.lhs||'F'} ＝ ${fmt(m.tree)}</div>`;
 case'symbol':return `<div class="sc">${diagram(m.tree,null)}</div><p class="note">回路記号：${Symbols.names[Symbols.current]}。出力側の小さな丸（○）は否定を表します。</p>`;
 case'circuit':return `<div class="sc">${diagram(m.tree,m.env||null,m.lbl)}</div>`;
 case'venn':return venn(m.tree)+'<p class="note">青く塗られた領域が 1（真）に対応します。</p>';
 default:return m.html||''}};
return{ob,fmt,table,venn,diagram,mat};
})();
if(typeof module!=='undefined')module.exports=R;
