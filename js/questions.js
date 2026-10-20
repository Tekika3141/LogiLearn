// 問題データ。式ツリーから表示・正解をすべて計算で生成する（手書きの正解なし）。
const Q=(()=>{
const {mk,ev,vars,envs,sig,gates}=Logic,fmt=R.fmt;
const OPS=['AND','OR','NOT','NAND','NOR','XOR','XNOR'];
const JP={AND:'AND（論理積）',OR:'OR（論理和）',NOT:'NOT（否定）',NAND:'NAND（否定論理積）',NOR:'NOR（否定論理和）',XOR:'XOR（排他的論理和）',XNOR:'XNOR（否定排他的論理和）'};
const EXP={AND:'ANDは、AとBの両方が1のときだけ出力が1になります。',OR:'ORは、AとBの少なくとも一方が1のとき出力が1になり、両方0のときだけ0になります。',NOT:'NOTは入力を反転します。0なら1、1なら0です。',NAND:'NANDはANDの出力を反転したもので、AとBが両方1のときだけ0、それ以外は1です。',NOR:'NORはORの出力を反転したもので、AとBが両方0のときだけ1です。',XOR:'XORは、AとBが異なる値のときだけ1になります。',XNOR:'XNORはXORの反転で、AとBが同じ値のとき1になります。'};
const NEG=['NOT','NAND','NOR','XNOR'],PART={AND:'NAND',NAND:'AND',OR:'NOR',NOR:'OR',XOR:'XNOR',XNOR:'XOR'};
const gate=op=>op==='NOT'?mk('NOT','A'):mk(op,'A','B');
const near=op=>op==='NOT'?[mk('NOT','A'),'A',gate('AND'),gate('NAND')]:[gate(op),gate(PART[op]),...['AND','OR','XOR'].filter(x=>x!==op&&x!==PART[op]).slice(0,2).map(gate)];
const out=[];
const add=(mode,type,level,prompt,material,choices,answer,exp,src)=>out.push({id:'Q'+String(out.length+1).padStart(3,'0'),mode,type,level,prompt,material,choices,answer,exp,src});
const names=OPS.map(o=>({k:o,h:JP[o]})),B01=[{k:'0',h:'0'},{k:'1',h:'1'}];
const fch=(ts,vs)=>ts.map(t=>({k:sig(t,vs),h:fmt(t)}));
const envText=e=>Object.entries(e).map(([k,v])=>k+'＝'+v).join('、');
const pk=(t,n)=>{const E=envs(vars(t));return[...new Set([...Array(n)].map((_,k)=>(k*5+3)%E.length))].map(i=>E[i])};
const steps=(t,e)=>`（${envText(e)}）入力側のゲートから順に出力を求めます。`+gates(t).map(g=>`${fmt(g)}＝${ev(g,e)}`).join('、')+`。したがってF＝${ev(t,e)}です。`;
const N=(x)=>mk('NOT',x);
// モードA：基本ゲート7種 × 形式
OPS.forEach((op,i)=>{const t=gate(op),vs=vars(t),ng=NEG.includes(op)?'小さな丸（○）やオーバーバーは否定を表します。':'';
 add('A','真理値表→名称',1,'次の真理値表が表す論理ゲートはどれか。',{kind:'table',cols:[{name:'F',tree:t}],vs},names,op,EXP[op]+'表のFの列はこの動作と一致するため、'+op+'です。');
 add('A','論理式→名称',1,'次の論理式が表す論理ゲートはどれか。',{kind:'formula',tree:t},names,op,EXP[op]+ng);
 add('A','回路記号→名称',1,'次の回路記号が表す論理ゲートはどれか。',{kind:'symbol',tree:t},names,op,EXP[op]+ng);
 add('A','名称→論理式',2,`${JP[op]}を表す論理式はどれか。`,[],fch(near(op),['A','B']),sig(t,['A','B']),EXP[op]+'オーバーバーがかかる範囲（式全体か個別の文字か）に注意します。',t);
 add('A','ベン図→論理式',2,'ベン図の青い領域が1に対応します。この領域を表す論理式はどれか。',{kind:'venn',tree:t},fch(near(op),['A','B']),sig(t,['A','B']),EXP[op]+'青い領域が1になる条件と式が一致します。',t);
 const E=envs(vs),e=E[(i*3+1)%E.length];
 add('A','式→真理値',1,`${envText(e)} のとき、F の値はどれか。`,{kind:'formula',tree:t},B01,String(ev(t,e)),EXP[op]+`この入力ではF＝${ev(t,e)}です。`);
});
// モードB：応用回路
const HA={S:mk('XOR','A','B'),C:mk('AND','A','B')};
const FA={S:mk('XOR','A','B','Cin'),C:mk('OR',mk('AND','A','B'),mk('AND','Cin',mk('XOR','A','B')))};
const MAJ=mk('OR',mk('AND','A','B'),mk('AND','B','C'),mk('AND','C','A')),CMP=mk('XNOR','A','B');
const n2=[['HA','半加算器'],['FA','全加算器'],['MAJ','多数決回路'],['CMP','一致回路（比較回路）']].map(([k,h])=>({k,h}));
const tq=(cols,vs,a,x)=>add('B','真理値表→回路',2,'次の真理値表が表す回路はどれか。',{kind:'table',cols,vs},n2,a,x);
tq([{name:'S（和）',tree:HA.S},{name:'C（桁上げ）',tree:HA.C}],['A','B'],'HA','半加算器は1ビット同士の加算で、和S＝A⊕B、桁上げC＝A・Bを出力します。1＋1でS=0、C=1になるのが特徴です。');
tq([{name:'S（和）',tree:FA.S},{name:'Cout（桁上げ）',tree:FA.C}],['A','B','Cin'],'FA','全加算器は下位からの桁上げCinも加えた A+B+Cin を2進数（Cout,S）で出力します。入力が3つあるのが半加算器との違いです。');
tq([{name:'F',tree:MAJ}],['A','B','C'],'MAJ','多数決回路は、3入力のうち2つ以上が1のときに出力が1になります。');
tq([{name:'F',tree:CMP}],['A','B'],'CMP','一致回路は、AとBが同じ値のとき1を出力します。これはXNORと同じ動作です。');
const x2=['XOR','AND','OR','XNOR'].map(gate),x3=[mk('XOR','A','B','Cin'),mk('AND','A','B','Cin'),mk('OR','A','B','Cin'),mk('XNOR','A','B','Cin')];
add('B','論理式の選択',2,'半加算器の和Sを表す論理式はどれか。',[],fch(x2,['A','B']),sig(HA.S,['A','B']),'和Sは、AとBが異なるときだけ1になるのでXOR（A⊕B）です。',HA.S);
add('B','論理式の選択',2,'半加算器の桁上げCを表す論理式はどれか。',[],fch(x2,['A','B']),sig(HA.C,['A','B']),'桁上げは両方が1のときだけ発生するのでAND（A・B）です。',HA.C);
add('B','論理式の選択',3,'全加算器の和Sを表す論理式はどれか。',[],fch(x3,['A','B','Cin']),sig(FA.S,['A','B','Cin']),'和Sは1の入力が奇数個のとき1になる、3入力のXOR（A⊕B⊕Cin）です。',FA.S);
add('B','論理式の選択',3,'全加算器の桁上げCoutを表す論理式はどれか。',[],fch([FA.C,mk('OR',mk('AND','A','B'),mk('AND','Cin',mk('XNOR','A','B'))),mk('AND',mk('OR','A','B'),'Cin'),FA.S],['A','B','Cin']),sig(FA.C,['A','B','Cin']),'A・B（上位へ桁上げ）、またはCinとA⊕B（下位からの桁上げ）のどちらかが1のとき、Coutが1になります。',FA.C);
pk(HA.S,2).forEach(e=>{const s=ev(HA.S,e),c=ev(HA.C,e);add('B','加算器の出力',2,`入力が ${envText(e)} のとき、半加算器の出力はどれか。`,[{kind:'circuit',tree:HA.S,env:e,lbl:'S'},{kind:'circuit',tree:HA.C,env:e,lbl:'C'}],[0,1].flatMap(a=>[0,1].map(b=>({k:`S=${a}, C=${b}`,h:`S＝${a}、C＝${b}`}))),`S=${s}, C=${c}`,`S＝${fmt(HA.S)}＝${s}、C＝${fmt(HA.C)}＝${c}です。`)});
pk(FA.S,3).forEach(e=>{const s=ev(FA.S,e),c=ev(FA.C,e);add('B','加算器の出力',3,`入力が ${envText(e)} のとき、全加算器の出力はどれか。`,[{kind:'circuit',tree:FA.S,env:e,lbl:'S'},{kind:'circuit',tree:FA.C,env:e,lbl:'Cout'}],[0,1].flatMap(a=>[0,1].map(b=>({k:`S=${a}, Cout=${b}`,h:`S＝${a}、Cout＝${b}`}))),`S=${s}, Cout=${c}`,`A+B+Cin＝${e.A+e.B+e.Cin} を2進数で表すと、Cout＝${c}、S＝${s}です。`)});
[[MAJ,'多数決回路'],[CMP,'一致回路']].forEach(([t,nm])=>pk(t,2).forEach(e=>add('B','回路図→出力F',2,`入力が ${envText(e)} のとき、${nm}の出力Fはどれか。`,{kind:'circuit',tree:t,env:e},B01,String(ev(t,e)),steps(t,e))));
// モードC：回路図の解析
const CI=[[1,mk('NAND','A','B')],[1,mk('NOR','A','B')],[2,mk('AND',N('A'),'B')],[2,N(mk('OR',mk('AND','A','B'),'C'))],[2,mk('OR',mk('XOR','A','B'),'C')],
 [3,mk('XOR',mk('AND','A','B'),mk('OR','C','D'))],[3,mk('NOR',mk('AND','A','B'),mk('XNOR','C','D'))],[3,mk('AND',mk('OR','A','B'),mk('NAND',N('C'),'D'))],
 [4,mk('OR',mk('AND','A','B','C'),mk('NOR','D','E'))],[4,mk('XOR',mk('NAND','A','B','C'),mk('OR',N('D'),'E'))]];
CI.forEach(([lv,t])=>pk(t,2).forEach(e=>add('C','回路図→出力F',lv,`入力が ${envText(e)} のとき、出力Fはどれか。`,{kind:'circuit',tree:t,env:e},B01,String(ev(t,e)),steps(t,e))));
CI.filter(([lv])=>lv==2||lv==3).forEach(([lv,t])=>{const e=pk(t,2).pop();add('A','式→真理値（複数段）',lv,`${envText(e)} のとき、F の値はどれか。`,{kind:'formula',tree:t},B01,String(ev(t,e)),steps(t,e))});
const dm=(t,c,x)=>add('C','ド・モルガンの法則',5,'次の式と同じ論理を表す式はどれか。',{kind:'formula',tree:t},fch(c,['A','B']),sig(t,['A','B']),x,t);
const dmx='ド・モルガンの法則では、全体の否定を各項の否定に分けると、ANDとORが入れ替わります。';
dm(mk('NAND','A','B'),[mk('OR',N('A'),N('B')),mk('AND',N('A'),N('B')),mk('AND','A','B'),mk('OR','A','B')],dmx+`${fmt(mk('NAND','A','B'))}＝${fmt(mk('OR',N('A'),N('B')))}です。`);
dm(mk('NOR','A','B'),[mk('AND',N('A'),N('B')),mk('OR',N('A'),N('B')),mk('XOR','A','B'),mk('AND','A','B')],dmx+`${fmt(mk('NOR','A','B'))}＝${fmt(mk('AND',N('A'),N('B')))}です。`);
dm(N(mk('AND',N('A'),'B')),[mk('OR','A',N('B')),mk('OR',N('A'),'B'),mk('AND','A',N('B')),mk('AND',N('A'),N('B'))],dmx+'Aの否定の否定は元のAに戻るため、A＋B̅になります。');
return{all:out,HA,FA,MAJ,CMP};
})();
if(typeof module!=='undefined')module.exports=Q;
