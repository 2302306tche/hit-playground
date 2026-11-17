const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let W,H,dpr;
function rs(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',rs);rs();

let img=null,objs=[],parts=[],rings=[],shake=0,flash=0,last=performance.now();
const off=document.createElement('canvas'),octx=off.getContext('2d');
const TYPES=['anvil','bat','banana','cord','code','number','paper','dynamite'];
const NAMES={anvil:['⚒️','모루'],bat:['🏏','배트'],banana:['🍌','바나나'],cord:['🔌','전선 코드'],code:['💻','코딩 코드'],number:['🔢','숫자'],paper:['📄','종이'],dynamite:['🧨','다이너마이트'],star:['⭐','별 레이저'],nuke:['☢️','핵폭탄']};
const counts={};let total=0,stars=[],nukes=[],nukeFlash=0,sel='random',bolts=[];
let AC=null,NB=null;const lastS={};
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
addEventListener('pointerdown',ac);addEventListener('keydown',ac);
function tone(f,d,type,v,t0,f2){const a=ac();if(!a)return;const t=a.currentTime+(t0||0),o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v||.2,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}
function noise(d,v,type,f,f2,t0){const a=ac();if(!a)return;if(!NB){NB=a.createBuffer(1,a.sampleRate*2,a.sampleRate);const c=NB.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=Math.random()*2-1}const s=a.createBufferSource();s.buffer=NB;s.loop=true;const fl=a.createBiquadFilter();fl.type=type;const t=a.currentTime+(t0||0);fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);const g=a.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(t);s.stop(t+d+.02)}
function sfx(t,o){
  const now=performance.now();if(now-(lastS[t]||0)<50)return;lastS[t]=now;
  if(t==='anvil'){[1180,1770,2490,3320].forEach((f,i)=>tone(f,.7-i*.12,'sine',.2/(i+1)));tone(590,.5,'triangle',.25);noise(.03,.4,'highpass',3000)}
  else if(t==='bat'){tone(140,.22,'sine',.7,0,45);noise(.09,.4,'lowpass',500,100)}
  else if(t==='banana'){tone(380,.14,'triangle',.25,0,120);noise(.1,.12,'lowpass',900)}
  else if(t==='cord'){tone(60,.35,'sawtooth',.15);tone(1800,.25,'square',.06,0,200);noise(.3,.18,'highpass',2500);for(let i=0;i<3;i++){tone(400+Math.random()*2000,.04,'square',.08,i*.04)}}
  else if(t==='number'){const f=400+o.num*70;tone(f,.12,'square',.12);tone(f*1.5,.12,'square',.08,.08)}
  else if(t==='paper'){noise(.28,.35,'bandpass',1500,4500);noise(.18,.22,'bandpass',3000,1200,.16)}
  else if(t==='dynamite'){noise(1,.8,'lowpass',2500,60);tone(90,.7,'sine',.9,0,28);noise(.05,.5,'highpass',2000)}
  else if(t==='code'){tone(900,.05,'square',.08);tone(1200,.05,'square',.08,.06);tone(1500,.08,'square',.08,.12)}
  else if(t==='slash'){noise(.18,.35,'bandpass',800,7000);tone(1600,.2,'sawtooth',.08,0,300);tone(2400,.25,'sine',.1,.05)}
  else if(t==='swfinal'){tone(70,.9,'sine',.9,0,25);noise(.8,.5,'lowpass',3000,80);[523,659,784,1047,1568].forEach((f,i)=>tone(f,.8,'triangle',.12,i*.03));noise(.4,.3,'highpass',3000)}
  else if(t==='star'){
    [0,2,4,7,9,12,14,16,19,21,24,26,28,31].forEach((s,i)=>{const f=880*Math.pow(2,s/12);tone(f,.35,'sine',.12,i*.055);tone(f*2,.2,'triangle',.05,i*.055)});
    for(let i=0;i<12;i++)tone(2093+Math.random()*1500,.15,'sine',.05,.8+i*.12);
    noise(.9,.08,'highpass',3000);
  }
}
function record(t){counts[t]=(counts[t]||0)+1;if(t!=='nuke')total++;render(t);if(t!=='nuke'&&total%1000===0)spawnNuke()}
function render(t){
  document.getElementById('total').textContent=total+'번 맞음';
  document.getElementById('nx').textContent='☢️ 핵폭탄까지 '+(1000-total%1000)+'번';
  if(t)document.getElementById('last').textContent='마지막: '+NAMES[t][0]+' '+NAMES[t][1]+'에 맞았어요!';
  document.getElementById('brk').innerHTML=Object.keys(NAMES).map(k=>'<span>'+NAMES[k][0]+' '+(counts[k]||0)+'</span>').join('');
}
render();
function spawnStar(){stars.push({a:Math.random()*Math.PI*2,t:0,hue:Math.random()*360,fired:false})}
function spawnNuke(){if(!nukes.length)nukes.push({t:0,ex:false,rn:0})}
let swords=[],swFlash=0,adminOn=false,kb='';
let pops=[],later=[],glitch=0,hideT=0,flick=0;
const SN=[{t:'echo Hello',k:'print'},{t:'rm -rf /',k:'rm'},{t:'while(true){}',k:'loop'},{t:'404',k:'404'},{t:'NaN',k:'nan'},{t:'bomb.explode()',k:'bomb'}];
function codeFx(o){
  const k=SN[o.sn].k,cx=W/2,cy=H/2;
  if(k==='print')pops.push({x:cx,y:cy,ch:'Hello, World!',t:0,c:'#4f8',mono:1,big:60});
  else if(k==='rm'){hideT=1;pops.push({x:cx,y:cy,ch:'rm -rf /',t:0,c:'#f55',mono:1,big:40});for(let n=0;n<30;n++){const a=Math.random()*6.28,sp=100+Math.random()*400;parts.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,r:3+Math.random()*4,c:'#f33'})}}
  else if(k==='loop'){for(let n=1;n<=6;n++)later.push({t:n*.18,f:()=>{rings.push({x:cx,y:cy,r:10,life:1,big:false,col:'#4f8'});flash=.6;shake=Math.max(shake,12)}})}
  else if(k==='404'){flick=1;pops.push({x:cx,y:cy,ch:'404',t:0,c:'#fa0'})}
  else if(k==='nan'){glitch=.7;pops.push({x:cx,y:cy,ch:'NaN',t:0,c:'#f5f',mono:1,big:200})}
  else if(k==='bomb'){sfx('dynamite');shake=Math.max(shake,40);rings.push({x:cx,y:cy,r:10,life:1,big:true});for(let n=0;n<50;n++){const a=Math.random()*6.28,sp=200+Math.random()*700;parts.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,r:3+Math.random()*7,c:n%2?'#ff6a00':'#ffd200'})}}
}
function spawnSword(){if(!swords.length)swords.push({t:0,sl:[],fin:false,base:Math.random()*Math.PI})}
function toggleAdmin(){
  adminOn=!adminOn;const b=document.getElementById('swb');if(b)b.style.display=adminOn?'':'none';
  if(!adminOn&&sel==='sword'){sel='random';panel.querySelectorAll('.w').forEach((x,j)=>x.classList.toggle('on',j===0))}
  document.getElementById('last').textContent=adminOn?'🗡️ ADMIN SWORD 해금!':'🗡️ ADMIN SWORD 잠금';
}
addEventListener('keydown',e=>{if(e.key&&e.key.length===1){kb=(kb+e.key.toLowerCase()).slice(-5);if(kb==='admin'){kb='';toggleAdmin()}}});
(function(){const tt=document.getElementById('total');tt.style.pointerEvents='auto';let tc=0,tl=0;tt.onclick=()=>{const n=Date.now();tc=n-tl<1500?tc+1:1;tl=n;if(tc>=5){tc=0;toggleAdmin()}}})();
const panel=document.createElement('div');panel.className='panel';
[['random','🎲','랜덤'],['anvil','⚒️','모루'],['bat','🏏','배트'],['banana','🍌','바나나'],['cord','🔌','전선 코드'],['code','💻','코딩 코드'],['number','🔢','숫자'],['paper','📄','종이'],['dynamite','🧨','다이너마이트'],['star','⭐','별 레이저'],['nuke','☢️','핵폭탄'],['sword','🗡️','어드민 소드']].forEach(([k,ic,nm])=>{
  const b=document.createElement('button');b.className='w'+(k===sel?' on':'');b.innerHTML=ic+'<small>'+nm+'</small>';if(k==='sword'){b.id='swb';b.style.display='none'}
  b.onclick=()=>{sel=k;panel.querySelectorAll('.w').forEach(x=>x.classList.toggle('on',x===b));b.blur();spawn()};
  panel.appendChild(b);
});
document.body.appendChild(panel);
const EMOJI={bat:'🏏',banana:'🍌',cord:'🔌',paper:'📄',dynamite:'🧨'};
const COLORS={anvil:['#888','#bbb'],bat:['#d9a066','#fff'],banana:['#ffe135','#fff6a0'],cord:['#4af','#ff0'],code:['#3f6','#9ff'],number:['#fff','#9cf'],paper:['#fff','#ddd'],dynamite:['#ff6a00','#ffd200','#f33']};

function setImg(file){
  if(!file||!file.type.startsWith('image/'))return;
  const i=new Image();i.onload=()=>{img=i};i.src=URL.createObjectURL(file);
}
document.getElementById('f').onchange=e=>setImg(e.target.files[0]);
addEventListener('dragover',e=>e.preventDefault());
addEventListener('drop',e=>{e.preventDefault();setImg(e.dataTransfer.files[0])});

function size(){return Math.min(W,H*0.7,340)}
function spawn(){
  const hold=arguments[0]===true;
  if(sel==='star'){if(!(hold&&stars.length))spawnStar();return}
  if(sel==='sword'){spawnSword();return}
  if(sel==='nuke'){spawnNuke();return}
  if(sel==='random'&&Math.random()*(TYPES.length+(hold?0.02:0.2))>=TYPES.length&&!(hold&&stars.length)){spawnStar();return}
  const type=sel==='random'?TYPES[Math.random()*TYPES.length|0]:sel;
  objs.push({type,a:Math.random()*Math.PI*2,t:0,dur:.5+Math.random()*.25,
    rot:Math.random()*6.28,spin:(Math.random()<.5?-1:1)*(8+Math.random()*10),
    num:(Math.random()*10|0),sn:Math.random()*SN.length|0});
}
let held=false,acc=0;
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();if(!e.repeat){held=true;spawn()}}});
addEventListener('keyup',e=>{if(e.code==='Space'){e.preventDefault();held=false}});
addEventListener('blur',()=>{held=false});
const goBtn=document.getElementById('go');
goBtn.onpointerdown=()=>{held=true;spawn()};
['pointerup','pointerleave','pointercancel'].forEach(ev=>goBtn.addEventListener(ev,()=>{held=false}));

function pos(o){
  const far=Math.hypot(W,H)*0.6,near=size()*0.32;
  const d=near+(far-near)*(1-o.t*o.t);
  return [W/2+Math.cos(o.a)*d,H/2+Math.sin(o.a)*d];
}
function hit(o){
  record(o.type);sfx(o.type,o);
  const big=o.type==='dynamite';
  flash=1;shake=big?44:20;
  const [x,y]=pos(o),cols=COLORS[o.type];
  const n=big?70:34;
  for(let i=0;i<n;i++){
    const a=Math.random()*6.28,s=(big?500:300)*Math.random()+80;
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,r:2+Math.random()*(big?7:4),c:cols[i%cols.length]});
  }
  rings.push({x,y,r:10,life:1,big});
  if(big)rings.push({x,y,r:0,life:1,big,delay:true});
  if(o.type==='cord'){
    for(let k=0;k<3;k++){
      const a0=Math.random()*6.28,len=120+Math.random()*220;let px=k%3===0?W/2:x,py=k%3===0?H/2:y;const p=[[px,py]];
      for(let j=1;j<=10;j++){const a=a0+(Math.random()-.5)*1.1;px+=Math.cos(a)*len/10;py+=Math.sin(a)*len/10;p.push([px,py])}
      bolts.push({p,life:1});
    }
  }
  if(o.type==='code')codeFx(o);
  if(o.type==='number'){
    pops.push({x,y,ch:String(o.num),t:0,c:'#8cf'});for(let n=0;n<0;n++){const a=Math.random()*6.28,sp=150+Math.random()*450;parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-100,life:1.2,r:4+Math.random()*(n<4?10:4),c:n%2?'#8cf':'#fff',ch:String(o.num)})}
  }
}

function drawObj(o){
  const [x,y]=pos(o),s=84;
  ctx.save();ctx.translate(x,y);ctx.rotate(o.rot+o.spin*o.t);
  if(o.type==='anvil'){
    ctx.fillStyle='#3b3f47';ctx.strokeStyle='#8a8f9a';ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(-44,-24);ctx.lineTo(40,-24);ctx.lineTo(54,-12);ctx.lineTo(24,-6);
    ctx.lineTo(16,8);ctx.lineTo(30,26);ctx.lineTo(-30,26);ctx.lineTo(-16,8);
    ctx.lineTo(-24,-6);ctx.lineTo(-44,-6);ctx.closePath();ctx.fill();ctx.stroke();
  }else if(o.type==='code'){
    const tx=SN[o.sn].t;ctx.font='700 22px monospace';const w=ctx.measureText(tx).width+28;
    ctx.fillStyle='#0b1a10';ctx.strokeStyle='#3f6';ctx.lineWidth=2;ctx.beginPath();ctx.rect(-w/2,-22,w,44);ctx.fill();ctx.stroke();
    ctx.fillStyle='#4f8';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(tx,0,1);
  }else{
    ctx.font=s+'px serif';ctx.textAlign='center';ctx.textBaseline='middle';
    if(o.type==='number'){ctx.font='900 90px sans-serif';ctx.fillStyle='#8cf';ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.strokeText(o.num,0,0);ctx.fillText(o.num,0,0)}
    else ctx.fillText(EMOJI[o.type],0,0);
  }
  ctx.restore();
}

function drawPhoto(){
  const S=size();
  let w=S,h=S;
  if(img){const r=img.width/img.height;if(r>1)h=S/r;else w=S*r}
  off.width=Math.ceil(w);off.height=Math.ceil(h);
  octx.clearRect(0,0,w,h);
  if(img)octx.drawImage(img,0,0,w,h);
  else{octx.fillStyle='#3a3a46';octx.beginPath();octx.arc(w/2,h/2,w/2,0,6.28);octx.fill();
    octx.font=(w*.55)+'px serif';octx.textAlign='center';octx.textBaseline='middle';octx.fillText('😐',w/2,h/2+4)}
  if(flash>0){octx.globalCompositeOperation='source-atop';octx.fillStyle='rgba(255,255,255,'+Math.min(1,flash*1.4)+')';octx.fillRect(0,0,w,h);octx.globalCompositeOperation='source-over'}
  const j=shake>0.3?Math.sin(performance.now()/16)*shake*.3:0;
  ctx.save();ctx.translate(W/2+j,H/2+(shake>0.3?Math.cos(performance.now()/13)*shake*.25:0));
  ctx.rotate(shake>0.3?Math.sin(performance.now()/20)*shake*.0015:0);
  if(flash>0){ctx.shadowColor='#fff';ctx.shadowBlur=40*flash}
  let al=1;
  if(hideT>0)al=hideT>.8?(hideT-.8)/.2:hideT>.25?0:1-hideT/.25;
  if(flick>0&&Math.floor(flick*14)%2)al*=.15;
  ctx.globalAlpha=al;
  if(glitch>0){const n=8,sh=h/n;for(let q=0;q<n;q++){const dx=(Math.random()-.5)*60*glitch;ctx.drawImage(off,0,q*sh,w,sh,-w/2+dx,-h/2+q*sh,w,sh)}}
  else ctx.drawImage(off,-w/2,-h/2);
  ctx.restore();
}

function frame(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  ctx.clearRect(0,0,W,H);
  if(held){acc+=dt;while(acc>=0.035){acc-=0.035;spawn(true)}}else acc=0;
  if(shake>0){shake*=Math.pow(.02,dt)}
  flash=Math.max(0,flash-dt*3.2);
  // screen shake
  ctx.save();
  if(shake>0.3)ctx.translate((Math.random()-.5)*shake*.35,(Math.random()-.5)*shake*.35);
  drawPhoto();
  for(let i=objs.length-1;i>=0;i--){
    const o=objs[i];o.t+=dt/o.dur;
    if(o.t>=1){o.t=1;hit(o);objs.splice(i,1);continue}
    drawObj(o);
  }
  for(let i=swords.length-1;i>=0;i--){
    const s=swords[i];s.t+=dt;
    const S0=.8,GAP=.28,FIN=S0+8*GAP+.4,L=size()*.85,cx=W/2,cy=H/2;
    if(s.t<S0){
      const k=s.t/S0,sy=cy-170-120*(1-k);
      ctx.save();ctx.translate(cx,sy);ctx.globalAlpha=Math.min(1,k*2);ctx.shadowColor='#d46bff';ctx.shadowBlur=30;
      const gr=ctx.createLinearGradient(0,0,0,130);gr.addColorStop(0,'#ff7ad9');gr.addColorStop(1,'#8a4dff');
      ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(0,130);ctx.lineTo(-14,0);ctx.lineTo(14,0);ctx.fill();
      ctx.fillStyle='#ffd1f5';ctx.fillRect(-38,-8,76,12);ctx.fillRect(-5,-48,10,40);
      ctx.beginPath();ctx.arc(0,-54,9,0,6.28);ctx.fill();ctx.restore();
    }
    const fade=s.t>=FIN?Math.max(0,1-(s.t-FIN)/.5):1;
    for(let k=0;k<8;k++){
      const age=s.t-(S0+k*GAP);if(age<0)break;
      const a=s.base+((k*3)%8)*Math.PI/8,dx=Math.cos(a),dy=Math.sin(a);
      if(!s.sl[k]){
        s.sl[k]=true;sfx('slash');flash=Math.max(flash,.7);shake=Math.max(shake,16);
        const cols=['#ff5fd2','#b266ff','#fff','#ff9be8'];
        for(let n=0;n<36;n++){const tt=(Math.random()*2-1)*L,px=cx+dx*tt,py=cy+dy*tt,sp=100+Math.random()*500,dir=Math.random()<.5?1:-1;parts.push({x:px,y:py,vx:-dy*sp*dir+(Math.random()-.5)*100,vy:dx*sp*dir+(Math.random()-.5)*100,life:1,r:2+Math.random()*4,c:cols[n%4]})}
      }
      if(fade<=0)continue;
      const p=Math.min(age/.22,1),head=-L+2*L*p,tail=age<.22?Math.max(-L,head-L*.9):-L;
      const al=(age<.22?1:Math.max(.55,1-(age-.22)*1.5))*fade;
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.shadowColor='#ff5fd2';ctx.shadowBlur=24;
      [[16,'rgba(255,80,200,'+al*.45+')'],[7,'rgba(170,90,255,'+al+')'],[2.5,'rgba(255,255,255,'+al+')']].forEach(([w,c])=>{ctx.lineWidth=w;ctx.strokeStyle=c;ctx.beginPath();ctx.moveTo(cx+dx*tail,cy+dy*tail);ctx.lineTo(cx+dx*head,cy+dy*head);ctx.stroke()});
      ctx.restore();
    }
    if(s.t>=FIN){
      const e=s.t-FIN;
      if(!s.fin){
        s.fin=true;sfx('swfinal');
        const cs=['#ff5fd2','#b266ff','#fff','#ff9be8'];
        for(let n=0;n<260;n++){const a=Math.random()*6.28,sp=200+Math.random()*1300;parts.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1.5,r:3+Math.random()*9,c:cs[n%4]})}
        for(let r=0;r<4;r++)rings.push({x:cx,y:cy,r:10,life:1,big:true,sp:1500+r*350,col:r%2?'#ff5fd2':'#b266ff'});
        for(const k in counts)delete counts[k];total=0;render();
        document.getElementById('last').textContent='🗡️ 어드민 소드로 모든 타격이 초기화됐어요!';
      }
      swFlash=Math.max(swFlash,1-e/.8);flash=Math.max(flash,1-e/.8);shake=Math.max(shake,46*Math.max(0,1-e/1.2));
    }
    if(s.t>FIN+1.2)swords.splice(i,1);
  }
  for(let i=nukes.length-1;i>=0;i--){
    const s=nukes[i];s.t+=dt;
    const F0=1.0,EX=2.2;
    if(s.t<F0){
      ctx.fillStyle='rgba(255,0,0,'+(.12+.12*(Math.sin(s.t*20)*.5+.5))+')';ctx.fillRect(-60,-60,W+120,H+120);
      ctx.fillStyle='#fff';ctx.font='800 '+Math.min(48,W/12)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('☢️ 핵폭탄 투하 ☢️',W/2,H*0.25);
    }else if(s.t<EX){
      const k=(s.t-F0)/(EX-F0),y=-120+(H/2+120)*k*k;
      ctx.save();ctx.translate(W/2,y);
      ctx.fillStyle='#4b5563';ctx.beginPath();ctx.ellipse(0,0,26,62,0,0,6.28);ctx.fill();
      ctx.fillStyle='#facc15';ctx.fillRect(-26,-6,52,12);
      ctx.fillStyle='#b91c1c';
      ctx.beginPath();ctx.moveTo(-24,-40);ctx.lineTo(-50,-82);ctx.lineTo(-8,-58);ctx.fill();
      ctx.beginPath();ctx.moveTo(24,-40);ctx.lineTo(50,-82);ctx.lineTo(8,-58);ctx.fill();
      ctx.restore();
      for(let n=0;n<4;n++)parts.push({x:W/2+(Math.random()-.5)*20,y:y-70,vx:(Math.random()-.5)*80,vy:-60-Math.random()*120,life:.7,r:4+Math.random()*5,c:n%2?'#ffb347':'#ff4500'});
    }else{
      const e=s.t-EX;
      if(!s.ex){
        s.ex=true;record('nuke');
        const cs=['#fff','#ffd200','#ff6a00','#f33'];
        for(let n=0;n<320;n++){const a=Math.random()*6.28,sp=200+Math.random()*1400;parts.push({x:W/2,y:H/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1.6,r:3+Math.random()*10,c:cs[n%4]})}
      }
      while(s.rn<6&&e>s.rn*.2){rings.push({x:W/2,y:H/2,r:10,life:1,big:true,sp:1800+s.rn*300});s.rn++}
      shake=Math.max(shake,60*Math.max(0,1-e/2.5));
      flash=Math.max(flash,Math.max(0,1-e/1.2));
      nukeFlash=Math.max(nukeFlash,1-e/1.0);
      if(e<1.5)for(let n=0;n<10;n++){const a=Math.random()*6.28,sp=300+Math.random()*900;parts.push({x:W/2,y:H/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-200,life:1,r:3+Math.random()*7,c:n%2?'#ffb347':'#ff4500'})}
      const R=Math.max(1,Math.min(W,H)*0.75*(1-Math.pow(1-Math.min(e/1.4,1),3)));
      const al=Math.max(0,1-Math.max(0,e-1.2)/2.5);
      const g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,R);
      g.addColorStop(0,'rgba(255,255,230,'+al+')');g.addColorStop(.4,'rgba(255,190,40,'+al*.9+')');g.addColorStop(.75,'rgba(255,80,0,'+al*.7+')');g.addColorStop(1,'rgba(120,20,0,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(W/2,H/2,R,0,6.28);ctx.fill();
      if(e>.4){
        const m=Math.min((e-.4)/1.2,1),cy=H/2-m*Math.min(H*.3,240)-30,cr=30+m*Math.min(W,H)*.14;
        ctx.fillStyle='rgba(90,40,20,'+al*.8+')';ctx.fillRect(W/2-cr*.22,cy,cr*.44,H/2-cy);
        [[0,0,1,'rgba(255,120,20,'],[-.7,.3,.7,'rgba(230,80,10,'],[.7,.3,.7,'rgba(230,80,10,'],[0,-.5,.7,'rgba(255,170,40,']].forEach(([dx,dy,sc,c])=>{ctx.fillStyle=c+al*.9+')';ctx.beginPath();ctx.arc(W/2+dx*cr,cy+dy*cr*.6,cr*sc,0,6.28);ctx.fill()});
      }
    }
    if(s.t>EX+4.5)nukes.splice(i,1);
  }
  for(let i=stars.length-1;i>=0;i--){
    const s=stars[i];s.t+=dt;
    if(s.t>=3.4){stars.splice(i,1);continue}
    const orbit=size()*0.75+90,far=Math.hypot(W,H)*0.6;
    const d=s.t<0.5?far+(orbit-far)*(1-Math.pow(1-s.t/0.5,3)):orbit;
    const x=W/2+Math.cos(s.a)*d,y=H/2+Math.sin(s.a)*d;
    const charge=s.t>=0.5&&s.t<1.2,fire=s.t>=1.2&&s.t<3.0;
    let sc=s.t>=3.0?1-(s.t-3.0)/0.4:1;
    if(charge){
      const k=(s.t-.5)/.7;sc*=1+k*.4;
      ctx.strokeStyle='hsl('+(s.t*500%360)+',100%,70%)';ctx.lineWidth=4;
      ctx.beginPath();ctx.arc(x,y,160*(1-k)+30,0,6.28);ctx.stroke();
    }
    if(fire){
      if(!s.fired){s.fired=true;record('star');sfx('star')}
      s.hue=(s.hue+700*dt)%360;
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
      const ws=[70,44,22,9],cs=[0,60,120,-1];
      ws.forEach((w,j)=>{
        ctx.lineWidth=w*(0.8+Math.random()*.4);
        ctx.strokeStyle=cs[j]<0?'#fff':'hsla('+((s.hue+cs[j])%360)+',100%,60%,.55)';
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(W/2,H/2);ctx.stroke();
      });
      ctx.restore();
      shake=Math.max(shake,30);
      if(Math.random()<.4)flash=.9;
      for(let n=0;n<8;n++){
        const t=Math.random(),px=x+(W/2-x)*t,py=y+(H/2-y)*t,a=Math.random()*6.28,sp=200+Math.random()*500;
        parts.push({x:px,y:py,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.8,r:2+Math.random()*5,c:'hsl('+(Math.random()*360)+',100%,65%)'});
      }
      for(let n=0;n<10;n++){
        const a=Math.random()*6.28,sp=300+Math.random()*700;
        parts.push({x:W/2,y:H/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,r:3+Math.random()*7,c:n%2?'#fff':'hsl('+(Math.random()*360)+',100%,60%)'});
      }
      if(Math.random()<.25)rings.push({x:W/2+(Math.random()-.5)*120,y:H/2+(Math.random()-.5)*120,r:10,life:1,big:Math.random()<.4});
    }
    ctx.save();ctx.translate(x,y);ctx.rotate(s.t*6);ctx.scale(sc,sc);
    ctx.shadowColor='hsl('+s.hue+',100%,60%)';ctx.shadowBlur=fire||charge?60:25;
    ctx.font='120px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('⭐',0,0);
    ctx.restore();
  }
  for(let i=bolts.length-1;i>=0;i--){
    const b=bolts[i];b.life-=dt*3;if(b.life<=0){bolts.splice(i,1);continue}
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineJoin='round';
    ctx.globalAlpha=Math.min(1,b.life*(.5+Math.random()*.6));
    [[6,'#4af'],[2,'#fff']].forEach(([w,c])=>{ctx.lineWidth=w;ctx.strokeStyle=c;ctx.beginPath();b.p.forEach((q,j)=>j?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()});
    ctx.restore();
  }
  hideT=Math.max(0,hideT-dt);flick=Math.max(0,flick-dt*1.3);glitch=Math.max(0,glitch-dt);
  for(let i=later.length-1;i>=0;i--){later[i].t-=dt;if(later[i].t<=0){later[i].f();later.splice(i,1)}}
  for(let i=pops.length-1;i>=0;i--){
    const p=pops[i];p.t+=dt*1.6;if(p.t>=1){pops.splice(i,1);continue}
    const k=1-Math.pow(1-p.t,3);
    ctx.save();ctx.globalAlpha=1-p.t;ctx.translate(p.x,p.y);
    ctx.font='900 '+(60+k*(p.big||320))+'px '+(p.mono?'monospace':'sans-serif');ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle=p.c||'#fff';ctx.fillText(p.ch,0,0);ctx.restore();
  }
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];p.life-=dt*1.4;if(p.life<=0){parts.splice(i,1);continue}
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.vx*=.98;
    ctx.globalAlpha=p.life;ctx.fillStyle=p.c;
    if(p.ch){ctx.font='800 '+(p.r*4*p.life+10)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.ch,p.x,p.y)}
    else{ctx.beginPath();ctx.arc(p.x,p.y,p.r*p.life+1,0,6.28);ctx.fill()}
  }
  ctx.globalAlpha=1;
  for(let i=rings.length-1;i>=0;i--){
    const r=rings[i];r.life-=dt*2.2;if(r.life<=0){rings.splice(i,1);continue}
    r.r+=(r.sp||(r.big?700:420))*dt;
    ctx.globalAlpha=r.life;ctx.strokeStyle=r.col||(r.big?'#ffb347':'#fff');ctx.lineWidth=6*r.life+1;
    ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,6.28);ctx.stroke();
  }
  if(nukeFlash>0){ctx.globalAlpha=Math.min(1,nukeFlash);ctx.fillStyle='#fff';ctx.fillRect(-60,-60,W+120,H+120);nukeFlash=0}
  if(swFlash>0){const g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.hypot(W,H)/2);g.addColorStop(0,'#fff');g.addColorStop(.35,'#ff7ad9');g.addColorStop(1,'#7a3dff');ctx.globalAlpha=Math.min(1,swFlash)*.85;ctx.fillStyle=g;ctx.fillRect(-60,-60,W+120,H+120);swFlash=0}
  ctx.globalAlpha=1;ctx.restore();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
