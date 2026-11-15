import * as THREE from 'three';
import './style.css';

const $ = (id) => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101d20);
scene.fog = new THREE.FogExp2(0x101d20, 0.0095);
const camera = new THREE.PerspectiveCamera(67, innerWidth / innerHeight, 0.1, 900);
camera.position.set(0, 2.75, 8);
camera.lookAt(0, 2.1, -65);
const renderer = new THREE.WebGLRenderer({ canvas: $('scene'), antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
scene.add(new THREE.HemisphereLight(0x91b4b0, 0x171719, 1.8));
const keyLight = new THREE.PointLight(0xd0e9ce, 42, 90, 2); keyLight.position.set(0, 4.1, -9); scene.add(keyLight);
const headlight = new THREE.SpotLight(0xe4f0d7, 85, 145, Math.PI / 7, .65, 1.2);
headlight.position.set(0, 2.45, 5); headlight.target.position.set(0, .5, -45); scene.add(headlight, headlight.target);
const world = new THREE.Group(); scene.add(world);
const mat = (color, roughness = .8, metalness = 0, emissive = 0, intensity = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: intensity });
const floorMat = mat(0x202a2c, .94), steel = mat(0x778383, .29, .82), sleeperMat = mat(0x352f2b, .96), wallMat = mat(0x293438, .9), edgeMat = mat(0xc08d50, .58, .2, 0x583516, .22), greenGlow = mat(0x83e8a4, .35, .1, 0x39e878, 3.3), warmGlow = mat(0xffc475, .35, .05, 0xf2a544, 3.5), redGlow = mat(0xf47159, .35, 0, 0xe44522, 3.5), darkSignal = mat(0x251d18);
const box = (parent, w,h,d,material,x,y,z) => {const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);parent.add(o);return o;};
// A broad, arched station tunnel with deep-set ribs.
box(world, 18, .35, 650, floorMat, 0, -.2, -285);
box(world, 1.1, 4.8, 650, wallMat, -7.05, 2.15, -285);
box(world, 1.1, 4.8, 650, wallMat, 7.05, 2.15, -285);
const roofVertices=[], roofIndices=[];
const roofSteps=28, roofLength=650, roofRows=65;
for(let r=0;r<=roofRows;r++){const z=40-r*10;for(let i=0;i<=roofSteps;i++){const a=Math.PI*i/roofSteps;roofVertices.push(7*Math.cos(a),2.15+7*Math.sin(a),z);if(r<roofRows&&i<roofSteps){const n=r*(roofSteps+1)+i;roofIndices.push(n,n+roofSteps+1,n+1,n+1,n+roofSteps+1,n+roofSteps+2);}}}
const roofGeo=new THREE.BufferGeometry();roofGeo.setAttribute('position',new THREE.Float32BufferAttribute(roofVertices,3));roofGeo.setIndex(roofIndices);roofGeo.computeVertexNormals();world.add(new THREE.Mesh(roofGeo,mat(0x354043,.94)));
// Rails and their moving sleepers.
for(const x of [-.88,.88]){const rail=box(world,.13,.17,650,steel,x,.07,-285);rail.castShadow=false;}
const sleepers=[];
for(let i=0;i<70;i++){const o=box(world,2.7,.16,1.05,sleeperMat,0,-.045,12-i*9);sleepers.push(o);}
// Tunnel ribs, overhead lights, and wall lamps are recycled as the train advances.
const ribs=[], ceilingLights=[], sideLights=[];
for(let i=0;i<34;i++){
  const z=8-i*18, rib=new THREE.Group();
  const curve=new THREE.EllipseCurve(0,0,6.65,6.65,0,Math.PI,false,0);
  const pts=curve.getPoints(32).map(p=>new THREE.Vector3(p.x,2+p.y,0));
  const ribMesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),64,.09,5,false),mat(0x515b59,.63,.24));rib.add(ribMesh);rib.position.z=z;world.add(rib);ribs.push(rib);
  const light=box(world,1.65,.09,.38,warmGlow,0,7.4,z-22);ceilingLights.push(light);
  for(const s of [-1,1]){const l=box(world,.12,.43,.28,warmGlow,s*6.43,3.55,z-22);sideLights.push(l);}
}
// A signal visible down the line: aspect changes with station approach and speed.
const signal=new THREE.Group();signal.position.set(2.35,0,-67);world.add(signal);
box(signal,.16,3.1,.18,steel,0,1.65,0);box(signal,.7,1.6,.38,mat(0x101817),0,3.25,0);
const signalLamp= new THREE.Mesh(new THREE.SphereGeometry(.19,16,12),greenGlow);signalLamp.position.set(0,3.65,.23);signal.add(signalLamp);
const signalLamp2=new THREE.Mesh(new THREE.SphereGeometry(.14,16,12),mat(0x251d18));signalLamp2.position.set(0,3.23,.23);signal.add(signalLamp2);
function signTexture(text, small='NORTH LOOP'){
 const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');
 x.fillStyle='#122522';x.fillRect(0,0,512,128);x.fillStyle='#baf3ca';x.fillRect(0,0,7,128);
 x.fillStyle='#9ce1ab';x.font='500 18px monospace';x.fillText(small,28,37);
 x.fillStyle='#f0f0e2';x.font='bold 44px sans-serif';x.fillText(text.toUpperCase(),28,91);
 x.fillStyle='#bf9865';x.fillRect(455,35,3,58);x.fillStyle='#f2c07b';x.font='bold 25px sans-serif';x.fillText('N',472,76);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const stationGroup=new THREE.Group();world.add(stationGroup);
const platformParts=[];
const stationNames=['HARBOR POINT','OLD TOWN','MUSEUM QUARTER','GRAND CENTRAL'];
for(let i=0;i<2;i++){
 const s=new THREE.Group();stationGroup.add(s);platformParts.push(s);
 for(const side of [-1,1]){
  box(s,2.15,.42,26,mat(0x545754,.92),side*4.25,.25,0);
  box(s,2.25,.13,26,edgeMat,side*4.25,.52,0);
  box(s,.18,.09,26,warmGlow,side*3.23,.62,0);
  box(s,.16,3.3,26,mat(0x273337,.91),side*6.43,2.1,0);
  box(s,.22,.11,21,warmGlow,side*6.26,3.54,0);
  // Poster panels add scale and texture to the station walls.
  for(let p=0;p<3;p++){
   const poster=box(s,.035,1.05,1.55,mat(p===1?0x704e3a:0x284746,.8,.05),side*6.3,2.05,-8+p*8);
   box(s,.045,.07,.07,greenGlow,side*6.27,2.49,-8+p*8);
  }
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.5,1.05),new THREE.MeshBasicMaterial({map:signTexture(stationNames[i],i===0?'NEXT STOP · N1':'NORTHBOUND · N1'),side:THREE.DoubleSide}));
  sign.position.set(side*5.2,3.13,-1);sign.rotation.y=side<0?Math.PI/2:-Math.PI/2;s.add(sign);
 }
 s.visible=false;
}
// Small, understated train nose at the lower edge of the windscreen.
const nose= new THREE.Group();world.add(nose);
box(nose,4.2,.22,1.1,mat(0x374543,.42,.3),0,.1,3.2);
box(nose,3.8,.075,.08,mat(0xb9f1c2,.32,.2,0x57c67a,1.8),0,.23,2.68);
for(const x of [-1.4,1.4]){const lamp=new THREE.Mesh(new THREE.SphereGeometry(.12,12,10),mat(0xffe6ad,.3,.1,0xffd57b,2.8));lamp.position.set(x,.12,2.55);nose.add(lamp);}

const stations=[{name:'HARBOR POINT',distance:1240},{name:'OLD TOWN',distance:2780},{name:'MUSEUM QUARTER',distance:4200},{name:'GRAND CENTRAL',distance:5660}];
let speed=0, traveled=0, throttle=0, brake=0, running=false, paused=false, headlightsOn=true, doorOpen=false, dwell=0, score=0, stationIndex=0, last=performance.now(), elapsed=0, hornUntil=0, toastTimeout=0, arrivalUntil=0;
const keys=new Set();
const mphFromMs=v=>v*2.236936;
const currentStation=()=>stations[stationIndex];
function remaining(){const s=currentStation();return s?s.distance-traveled:0;}
function showToast(message){const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.remove('show'),1900);}
function updateObjective(title,text){$('objective-title').textContent=title;$('objective-text').textContent=text;}
function routeInit(){const line=$('route-line');line.innerHTML='';stations.forEach((s,i)=>{const dot=document.createElement('i');dot.className='route-stop'+(i===0?' active':'');dot.style.left=`${i*100/(stations.length-1)}%`;dot.title=s.name;line.appendChild(dot);});}
routeInit();
function stationAction(){if(!running||paused)return;const d=remaining(),v=mphFromMs(speed);
 if(!doorOpen){if(Math.abs(d)<30&&v<1.6){doorOpen=true;dwell=0;score+=Math.max(0,Math.round(550-Math.abs(d)*14));$('door-status').textContent='OPEN';$('arrival-score').textContent=`STOP ACCURACY +${Math.max(0,Math.round(550-Math.abs(d)*14))}`;$('arrival-banner').classList.add('show');arrivalUntil=performance.now()+2400;updateObjective('DOORS OPEN · BOARDING','Hold here while passengers board. Press E to close.');showToast('Doors open · passengers boarding');}else if(Math.abs(d)<45&&v>=1.6){showToast('Bring the train to a complete stop first');}else{showToast('Doors are locked between stations');}}
 else {doorOpen=false;$('door-status').textContent='LOCKED';dwell=0;completeStation();showToast('Doors closed · ready to depart');}
}
function completeStation(){score+=250;stationIndex++;if(stationIndex>=stations.length){$('route-name').textContent='NORTHBOUND · SERVICE COMPLETE';updateObjective('SHIFT COMPLETE · WELL DONE',`Final score ${score.toLocaleString()} · Thanks for riding Nightline.`);$('screen-stop').textContent='END OF LINE';$('next-station').textContent='END OF LINE';$('route-count').textContent='04 / 04';showToast(`Shift complete · score ${score.toLocaleString()}`);return;}
 const dots=[...document.querySelectorAll('.route-stop')];dots.forEach((dot,i)=>dot.className='route-stop'+(i<stationIndex?' done':i===stationIndex?' active':''));showToast(`${stations[stationIndex-1].name} · +250 SERVICE BONUS`);
}
function horn(){if(!running||paused)return;try{const ctx=horn.ctx||(horn.ctx=new AudioContext());const now=ctx.currentTime;const gain=ctx.createGain();gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.12,now+.05);gain.gain.exponentialRampToValueAtTime(.0001,now+.72);gain.connect(ctx.destination);[196,247].forEach((freq,i)=>{const osc=ctx.createOscillator();osc.type='triangle';osc.frequency.value=freq;osc.connect(gain);osc.start(now+i*.018);osc.stop(now+.74);});hornUntil=performance.now()+450;}catch{}}
function setThrottle(on){if(on&&running&&!paused)throttle=1;else if(!on)throttle=0;}
function setBrake(on){if(on&&running&&!paused)brake=1;else if(!on)brake=0;}
$('start-button').addEventListener('click',()=>{$('start-screen').classList.add('hidden');running=true;last=performance.now();showToast('Service 01 · all signals clear');});
$('resume-button').addEventListener('click',()=>{paused=false;$('pause-screen').classList.remove('show');last=performance.now();});
$('mobile-throttle').addEventListener('pointerdown',e=>{e.preventDefault();setThrottle(true);});$('mobile-throttle').addEventListener('pointerup',()=>setThrottle(false));$('mobile-throttle').addEventListener('pointerleave',()=>setThrottle(false));
$('mobile-brake').addEventListener('pointerdown',e=>{e.preventDefault();setBrake(true);});$('mobile-brake').addEventListener('pointerup',()=>setBrake(false));$('mobile-brake').addEventListener('pointerleave',()=>setBrake(false));$('mobile-horn').addEventListener('pointerdown',e=>{e.preventDefault();horn();});
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown',' '].includes(k))e.preventDefault();if(k==='escape'&&running){paused=!paused;$('pause-screen').classList.toggle('show',paused);if(!paused)last=performance.now();return;}if(k==='w'||k==='arrowup')setThrottle(true);if(k==='s'||k==='arrowdown'||k===' ')setBrake(true);if(k==='h'&&!e.repeat)horn();if(k==='f'&&!e.repeat){headlightsOn=!headlightsOn;headlight.intensity=headlightsOn?85:0;showToast(headlightsOn?'Headlights · high beam':'Headlights · off');}if(k==='e'&&!e.repeat)stationAction();keys.add(k);});
window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='w'||k==='arrowup')setThrottle(false);if(k==='s'||k==='arrowdown'||k===' ')setBrake(false);keys.delete(k);});window.addEventListener('blur',()=>{setThrottle(false);setBrake(false);});

const lerp=(a,b,t)=>a+(b-a)*t;
function update(dt,now){if(running&&!paused){elapsed+=dt;if(!doorOpen){const accel=throttle?2.45:0, decel=brake?4.8:0;speed=Math.max(0,Math.min(20.1,speed+(accel-decel-(throttle?0:.08))*dt));traveled+=speed*dt;}else{speed=Math.max(0,speed-6*dt);dwell+=dt;if(dwell>5.5)stationAction();}
 }
 const advance=speed*dt*.12;
 for(const t of sleepers){t.position.z+=advance;if(t.position.z>15)t.position.z-=70*9;}
 for(const r of ribs){r.position.z+=advance;if(r.position.z>18)r.position.z-=34*18;}
 for(let i=0;i<ceilingLights.length;i++){const l=ceilingLights[i];l.position.z+=advance;if(l.position.z>15)l.position.z-=34*18;sideLights[i*2].position.z=l.position.z;sideLights[i*2+1].position.z=l.position.z;}
 const s=currentStation(), d=s?remaining():0;const approaching=s&&d<430&&d>-30;
 platformParts.forEach((p,i)=>{p.visible=!!(approaching&&i===Math.min(stationIndex,1));if(p.visible)p.position.z=-d*.12;});
 if(s&&d < -80&&!doorOpen){score=Math.max(0,score-150);const missedName=s.name;stationIndex++;const dots=[...document.querySelectorAll('.route-stop')];dots.forEach((dot,i)=>dot.className='route-stop'+(i<stationIndex?' done':i===stationIndex?' active':''));showToast(`${missedName} missed · continue to the next stop`);}
 if(s){$('next-station').textContent=s.name;$('screen-stop').textContent=s.name.replace(' QUARTER',' QTR.').replace(' POINT',' PT.');const km=Math.max(0,d/1000);$('screen-distance').textContent=km<1?`${Math.max(0,Math.round(d))} M`:`${km.toFixed(1)} KM`;$('distance-label').textContent=d>0?`${Math.round(d).toLocaleString()} m ahead`:d>-30?'STOP ZONE · OPEN DOORS':'STATION PASSED';$('route-count').textContent=`${String(stationIndex+1).padStart(2,'0')} / 04`;document.querySelector('.screen-track').style.setProperty('--progress',`${Math.max(0,Math.min(100,traveled/s.distance*100))}%`);document.querySelector('.route-line').style.setProperty('--progress',`${(stationIndex/(stations.length-1))*100}%`);}
 const mph=mphFromMs(speed), limit=d<280&&d>0?25:45;$('speed-value').textContent=Math.round(mph);$('limit-value').textContent=limit;
 document.querySelector('.speed-ring').style.setProperty('--speed-angle',`${-135+Math.min(mph/limit,1)*270}deg`);
 $('throttle-fill').style.setProperty('--level',`${throttle*85}%`);$('throttle-knob').style.setProperty('--level',`${throttle*85}%`);$('throttle-label').textContent=throttle?'POWER 1':'IDLE';$('power-status').textContent=throttle?'ACTIVE':'READY';$('brake-fill').style.setProperty('--level',`${brake*75}%`);$('brake-knob').style.setProperty('--level',`${brake*75}%`);$('brake-label').textContent=brake?'BRAKING':'RELEASED';
 $('warning').classList.toggle('show',mph>limit+1);signalLamp.material=mph>limit+1?redGlow:(d<280&&d>0?warmGlow:greenGlow);signalLamp2.material=d<220&&d>0?warmGlow:darkSignal;
 if(running&&!doorOpen){if(d<0&&d>-60)updateObjective('STATION PASSED · RECOVER','Brake and continue carefully to the next stop.');else if(d<300&&d>0)updateObjective('BRAKE FOR '+s.name,'Stop within the marked station zone, then press E.');else if(d<700&&d>300)updateObjective('APPROACHING '+s.name,'Ease off the power. Line limit drops to 25 mph.');else if(!stationIndex&&traveled<25)updateObjective('READY FOR DEPARTURE','Throttle up to leave the terminal.');else updateObjective('CRUISE · LINE LIMIT 45 MPH','Keep a smooth pace. Brake early for the next stop.');}
 if(doorOpen&&running)updateObjective('DOORS OPEN · BOARDING',`Passengers boarding · ${Math.max(0,Math.ceil(5.5-dwell))} sec remaining.`);
 if(mph>limit+1&&now%2300<dt*1000)showToast('Overspeed · reduce power and brake');if(now>arrivalUntil)$('arrival-banner').classList.remove('show');
 const totalSec=Math.floor(elapsed)+23*3600+48*60+6;const h=Math.floor(totalSec/3600)%24,m=Math.floor(totalSec/60)%60,sec=totalSec%60;$('clock').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
 camera.position.y=2.75+Math.sin(now*.0018)*.009+Math.min(mph/45,.5)*.025;camera.position.x=Math.sin(now*.00032)*.018;camera.lookAt(Math.sin(now*.00032)*.04,2.1,-65);
 nose.position.y=-.12+Math.sin(now*.002)*.008;
}
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000||0);last=now;update(dt,now);renderer.render(scene,camera);}
requestAnimationFrame(frame);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));});
