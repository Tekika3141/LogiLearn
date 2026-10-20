// 出題管理・画面遷移・復習。得点やランキングは持たない。
const $=s=>document.querySelector(s),app=$('#app');
const MODES={ALL:'すべて（総合）',A:'モードA：基本問題',B:'モードB：応用回路',C:'モードC：回路図の解析'};
const sel={mode:'ALL',n:10};let S;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
// 発展問題(level>=3)は出現しにくくする重み付き抽出
const pick=(pool,n)=>pool.map(q=>({q,k:Math.pow(Math.random(),1/(q.level>=3?.5:1))})).sort((a,b)=>b.k-a.k).slice(0,n).map(x=>x.q);
function home(){
 app.innerHTML=`<h1>論理回路学習</h1><section class="card"><h2>学習モード</h2>${Object.entries(MODES).map(([k,v])=>`<label class="opt"><input type="radio" name="m" value="${k}" ${sel.mode==k?'checked':''}> ${v}</label>`).join('')}</section><section class="card"><h2>出題数</h2>${[5,10,20,0].map(n=>`<label class="opt"><input type="radio" name="n" value="${n}" ${sel.n==n?'checked':''}> ${n?n+'問':'全問題'}</label>`).join('')}</section><section class="card"><h2>回路記号の規格</h2><select id="sy">${['ANSI','JIS'].map(k=>`<option value="${k}" ${Symbols.current==k?'selected':''}>${Symbols.names[k]}</option>`).join('')}</select><p class="note">標準はANSI系です。表示だけを切り替える設定で、問題や正解判定には影響しません。</p></section><button id="go" class="pri">学習開始</button>`;
 $('#go').onclick=()=>{sel.mode=$('[name=m]:checked').value;sel.n=+$('[name=n]:checked').value;Symbols.current=$('#sy').value;
  const pool=Q.all.filter(q=>sel.mode=='ALL'||q.mode==sel.mode);begin(pick(pool,sel.n||pool.length))};
}
function begin(qs,review){S={qs,i:0,ok:new Map(),review};show()}
function show(){const q=S.qs[S.i],N=S.qs.length;
 app.innerHTML=`<div class="bar"><span>${S.review?'復習　':''}第 ${S.i+1} 問 / ${N} 問</span><span>残り ${N-S.i-1} 問</span></div><section class="card"><p class="q">${q.prompt}</p>${[].concat(q.material||[]).map(R.mat).join('')}</section><div>${shuffle(q.choices).map(c=>`<button class="ch" data-k="${c.k}">${c.h}</button>`).join('')}</div><div id="fb"></div>`;
 document.querySelectorAll('.ch').forEach(b=>b.onclick=()=>answer(q,b));window.scrollTo(0,0)}
function answer(q,b){const ok=b.dataset.k===q.answer;S.ok.set(q.id,ok);
 document.querySelectorAll('.ch').forEach(x=>{x.disabled=true;if(x.dataset.k===q.answer)x.classList.add('right');else if(x===b)x.classList.add('wrong')});
 const last=S.i==S.qs.length-1;
 $('#fb').innerHTML=`<div class="fb ${ok?'ok':'ng'}"><b>${ok?'正解です':'不正解です'}</b>${ok?'':`<p>正解：${q.choices.find(c=>c.k===q.answer).h}</p>`}<p>${q.exp}</p></div><button id="nx" class="pri">${last?'結果を見る':'次の問題'}</button>`;
 $('#nx').onclick=()=>{S.i++;last?result():show()};$('#nx').scrollIntoView({block:'nearest'})}
function result(){const qs=S.qs,w=qs.filter(q=>!S.ok.get(q.id));
 app.innerHTML=`<h1>${S.review?'復習の結果':'結果'}</h1><section class="card"><p>出題数：${qs.length}問　正解数：${qs.length-w.length}問　間違えた問題数：${w.length}問</p></section><section class="card"><h2>間違えた問題</h2>${w.length?`<ol>${w.map(q=>`<li>${q.id}（${q.type}）${q.prompt}</li>`).join('')}</ol>`:'<p>間違えた問題はありません。</p>'}</section>${w.length?'<button id="rv" class="pri">間違えた問題を復習する</button>':''}<button id="hm" class="ch">トップに戻る</button>`;
 if(w.length)$('#rv').onclick=()=>begin(shuffle(w),true);$('#hm').onclick=home}
home();
