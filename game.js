'use strict';
const canvas=document.querySelector('#game'), ctx=canvas.getContext('2d'),hud=document.querySelector('#hud');
const keys=new Set(),ground=400,world=6600;
let p,blocks,enemies,coins,score,time,camera,state,last=0,acc=0,audio,sound=false;
const gaps=[[1216,1312],[2624,2720],[4096,4208]];
function reset(){p={x:70,y:300,w:26,h:36,vx:0,vy:0,on:false};score=0;time=300;camera=0;state='ready';keys.clear();blocks=[];coins=[];enemies=[];
for(const x of [400,432,464,496,850,882,1550,1582,1614,2000,2032,3100,3132,3164,3550,3582,4500,4532])blocks.push({x,y:280,w:32,h:32,gold:x%3!==0,used:false});
for(const [x,h] of [[660,64],[1050,96],[1750,64],[2350,96],[3300,64],[3900,96],[4750,64]])blocks.push({x,y:ground-h,w:64,h,pipe:true});
for(let i=0;i<7;i++)blocks.push({x:5300+i*32,y:ground-(i+1)*32,w:32,h:(i+1)*32,stone:true});
for(const x of [570,960,1500,1900,2200,2950,3450,3700,4400,4950])enemies.push({x,y:374,w:28,h:26,vx:-55,alive:true});
for(const x of [750,1450,1850,2850,3000,4300,4650,5050])coins.push({x,y:330,taken:false});}
function tone(f){if(!sound)return;audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.04,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.13);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.14);}
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function floorAt(x){return x>=0&&x<=world&&!gaps.some(([a,b])=>x>a&&x<b);}
function start(){if(state==='ready'||state==='paused'){state='play';last=0;acc=0;}canvas.focus({preventScroll:true});}
function jump(){if(state==='play'&&p.on){p.vy=-600;p.on=false;tone(420);}}
function step(dt){if(state!=='play')return;time-=dt;if(time<=0){state='lost';return;}
const dir=(keys.has('ArrowRight')||keys.has('KeyD')?1:0)-(keys.has('ArrowLeft')||keys.has('KeyA')?1:0);p.vx=dir*(keys.has('ShiftLeft')||keys.has('ShiftRight')?290:210);
const oldY=p.y;p.x+=p.vx*dt;p.x=Math.max(0,Math.min(world-p.w,p.x));for(const b of blocks)if(overlap(p,b))p.x=p.vx>0?b.x-p.w:b.x+b.w;
p.vy+=1350*dt;p.y+=p.vy*dt;p.on=false;
for(const b of blocks){if(!overlap(p,b))continue;if(p.vy>=0&&oldY+p.h<=b.y+1){p.y=b.y-p.h;p.vy=0;p.on=true;}else if(p.vy<0&&oldY>=b.y+b.h-1){p.y=b.y+b.h;p.vy=0;if(b.gold&&!b.used){b.used=true;score+=100;tone(880);}}}
if(p.vy>=0&&oldY+p.h<=ground+1&&p.y+p.h>=ground&&(floorAt(p.x+3)||floorAt(p.x+p.w-3))){p.y=ground-p.h;p.vy=0;p.on=true;}
for(const e of enemies){if(!e.alive)continue;e.x+=e.vx*dt;if(!floorAt(e.x+(e.vx>0?e.w+2:-2))||blocks.some(b=>overlap(e,b))) {e.x-=e.vx*dt;e.vx=-e.vx;}if(overlap(p,e)){if(p.vy>0&&oldY+p.h<=e.y+8){e.alive=false;p.vy=-330;score+=200;tone(180);}else state='lost';}}
for(const c of coins)if(!c.taken&&overlap(p,{x:c.x-8,y:c.y-12,w:16,h:24})){c.taken=true;score+=100;tone(880);}
if(p.y>550)state='lost';if(p.x>6200){state='won';tone(660);}camera=Math.max(0,Math.min(world-960,p.x-300));}
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function draw(){ctx.fillStyle='#88d3ec';ctx.fillRect(0,0,960,480);
for(let i=0;i<13;i++){let x=i*430-camera*.3;ctx.fillStyle='#e8f7ed';ctx.beginPath();ctx.ellipse(x+100,90+(i%3)*30,55,20,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#74bca9';ctx.beginPath();ctx.moveTo(x-100,400);ctx.lineTo(x+130,220);ctx.lineTo(x+350,400);ctx.fill();}
ctx.save();ctx.translate(-Math.round(camera),0);
for(let x=0;x<world;x+=32)if(floorAt(x+16)){rect(x,400,32,80,'#b56d44');rect(x,400,32,9,'#5eaa67');rect(x+3,421,23,3,'#935336');rect(x+14,445,15,3,'#935336');}
for(const b of blocks){rect(b.x,b.y,b.w,b.h,b.pipe?'#278b72':b.used?'#94795f':b.gold?'#efb841':'#b57451');if(b.pipe){rect(b.x-4,b.y,72,14,'#39aa87');rect(b.x+8,b.y+15,9,b.h-15,'#53bb96');}else{ctx.strokeStyle='#725639';ctx.strokeRect(b.x+2,b.y+2,b.w-4,b.h-4);if(b.gold&&!b.used){ctx.fillStyle='#fff0b5';ctx.font='bold 24px monospace';ctx.fillText('?',b.x+8,b.y+25);}}}
for(const c of coins)if(!c.taken){ctx.fillStyle='#ffe37a';ctx.beginPath();ctx.ellipse(c.x,c.y,7,11,0,0,Math.PI*2);ctx.fill();}
for(const e of enemies)if(e.alive){rect(e.x,e.y+8,28,18,'#9b4e64');rect(e.x+4,e.y,20,12,'#bf6880');rect(e.x+4,e.y+9,5,5,'#fff');rect(e.x+19,e.y+9,5,5,'#fff');rect(e.x+5,e.y+11,2,3,'#243746');rect(e.x+20,e.y+11,2,3,'#243746');}
rect(6240,145,5,255,'#edf0de');ctx.fillStyle='#e57965';ctx.beginPath();ctx.moveTo(6245,150);ctx.lineTo(6320,174);ctx.lineTo(6245,198);ctx.fill();rect(6380,288,150,112,'#7b8f9a');rect(6410,253,30,40,'#7b8f9a');rect(6475,253,30,40,'#7b8f9a');rect(6435,340,40,60,'#263f50');
rect(p.x+3,p.y,21,9,'#e88749');rect(p.x+7,p.y+9,18,10,'#ffe0aa');rect(p.x+3,p.y+19,22,12,'#245a78');rect(p.x,p.y+17,7,11,'#e88749');rect(p.x+3,p.y+31,9,5,'#323f4d');rect(p.x+17,p.y+31,9,5,'#323f4d');rect(p.x+20,p.y+11,3,3,'#203a50');ctx.restore();
document.querySelector('#start').textContent=state==='paused'?'继续游戏':state==='play'?'游戏进行中':'开始游戏';
hud.textContent=`金币 ${score} · 时间 ${Math.max(0,Math.ceil(time))}`;
if(state!=='play'){ctx.fillStyle='#102533cc';ctx.fillRect(0,0,960,480);ctx.textAlign='center';ctx.fillStyle='#fff0bb';ctx.font='bold 40px system-ui';ctx.fillText(state==='ready'?'晨光冒险 · 第一关':state==='paused'?'游戏已暂停':state==='won'?'第一关完成！':'再试一次！',480,205);ctx.font='20px system-ui';ctx.fillText(state==='ready'?'点击开始游戏 · 方向键移动 · 空格跳跃':state==='paused'?'点击继续游戏或游戏画面':`得分 ${score} · 点击重新开始或按 R`,480,255);ctx.textAlign='left';}}
function frame(t){if(!last)last=t;acc+=Math.min((t-last)/1000,.05);last=t;while(acc>=1/120){step(1/120);acc-=1/120;}draw();requestAnimationFrame(frame);}
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','Space','KeyA','KeyD','KeyW','Enter'].includes(e.code))start();if(['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(e.code))e.preventDefault();keys.add(e.code);if(!e.repeat&&['Space','KeyW','ArrowUp'].includes(e.code))jump();if(e.code==='KeyR')reset();});
window.addEventListener('keyup',e=>{keys.delete(e.code);if(['Space','KeyW','ArrowUp'].includes(e.code)&&p.vy< -420)p.vy=-420;});function pause(){keys.clear();if(state==='play')state='paused';}window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});canvas.addEventListener('pointerdown',start);
document.querySelector('#start').onclick=start;document.querySelector('#restart').onclick=()=>{reset();start();};document.querySelector('#sound').onclick=()=>{sound=!sound;document.querySelector('#sound').textContent=`音效：${sound?'开':'关'}`;if(sound)tone(440);};
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();start();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);if(b.dataset.key==='Space')jump();});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys.delete(b.dataset.key));}
reset();requestAnimationFrame(frame);
