// 回路記号の描画のみ（論理演算とは独立）。標準はANSI系。JIS系(IEC長方形形)に切替可。
const Symbols=(()=>{
const P={AND:'M0,0H26A20,20 0 0 1 26,40H0Z',OR:'M0,0C18,0 38,6 50,20C38,34 18,40 0,40C10,28 10,12 0,0Z',NOT:'M0,0L40,20L0,40Z'};
const B={NAND:'AND',NOR:'OR',XNOR:'XOR',NOT:'NOT'},NEG=op=>op in B,base=op=>B[op]||op;
const ansi=op=>{const b=base(op);let w={AND:46,OR:50,XOR:58,NOT:40}[b],s=`<path d="${P[b==='XOR'?'OR':b]}" transform="translate(${b==='XOR'?8:0})"/>`;
 if(b==='XOR')s+='<path class="nf" d="M0,0C10,12 10,28 0,40"/>';
 if(NEG(op)){s+=`<circle cx="${w+4}" cy="20" r="4"/>`;w+=8}
 return{s,w}};
const L={AND:'&amp;',OR:'≥1',XOR:'=1',NOT:'1'};
const jis=op=>{let w=44,s=`<rect width="44" height="40"/><text x="22" y="26" text-anchor="middle">${L[base(op)]}</text>`;
 if(NEG(op)){s+=`<circle cx="48" cy="20" r="4"/>`;w=52}
 return{s,w}};
return{ANSI:ansi,JIS:jis,current:'ANSI',draw(op){return this[this.current](op)},
 names:{ANSI:'ANSI系（標準）',JIS:'JIS系（JIS C 0617／IEC長方形形）'}};
})();
if(typeof module!=='undefined')module.exports=Symbols;
