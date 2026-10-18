import * as THREE from './vendor/three.module.js';
import { GameAudio } from './audio.js';
const sfx = new GameAudio();

const $ = id => document.getElementById(id);
const renderer = new THREE.WebGLRenderer({canvas:$('game'),antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.35;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x0d1714);scene.fog=new THREE.FogExp2(0x101c17,.023);
const camera=new THREE.PerspectiveCamera(73,innerWidth/innerHeight,.1,100);camera.rotation.order='YXZ';scene.add(camera);
const mats={};
function mat(name,color,roughness=.85){return mats[name]=new THREE.MeshStandardMaterial({color,roughness});}
mat('wall',0x626553);mat('trim',0x262d24);mat('wood',0x493728);mat('dark',0x151c18);mat('ceiling',0x74735e);mat('cloth',0x3b4940);mat('metal',0x454e4a,.35);mat('paper',0xaca184);mat('skin',0x78816a);mat('shirt',0x4d5144);mat('blood',0x48221b);
const floorMap=new THREE.TextureLoader().load('assets/wood_floor.jpg');floorMap.wrapS=floorMap.wrapT=THREE.RepeatWrapping;floorMap.repeat.set(8,8);floorMap.colorSpace=THREE.SRGBColorSpace;floorMap.anisotropy=renderer.capabilities.getMaxAnisotropy();
mats.floor=new THREE.MeshStandardMaterial({map:floorMap,color:0x897959,roughness:.84});
const FLOOR_HEIGHT=5,STAIR_RUN=10,STAIR_STEPS=25;
const walls=[],solids=[];
function box(w,h,d,x,y,z,material='wood',parent=scene){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof material==='string'?mats[material]:material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function solid(w,h,d,x,y,z,material='wall'){const m=box(w,h,d,x,y,z,material);solids.push({x,z,w,d,min:y-h/2,max:y+h/2});walls.push(m);return m;}
function wall(w,d,x,z,f){const y=f*FLOOR_HEIGHT,h=f===0?FLOOR_HEIGHT-.2:3.5;solid(w,h,d,x,y+h/2,z);box(w,.16,d+.16,x,y+.1,z,'trim');box(w,.12,d+.16,x,y+h-.08,z,'trim');box(w,.7,d+.16,x,y+.6,z,'trim');}
function facadeWall(f,z,frontDoor=false){const y=f*FLOOR_HEIGHT,h=f===0?FLOOR_HEIGHT-.2:3.5,holes=[[-9.75,-6.25,1,3],[-2,2,0,frontDoor?3.8:0],[6.25,9.75,1,3]].filter(a=>a[3]>a[2]).sort((a,b)=>a[0]-b[0]);let edge=-12;for(const [left,right,bottom,top]of holes){if(left>edge)solid(left-edge,h,.35,(left+edge)/2,y+h/2,z);if(bottom>0)solid(right-left,bottom,.35,(left+right)/2,y+bottom/2,z);if(top<h)solid(right-left,h-top,.35,(left+right)/2,y+(top+h)/2,z);edge=right;}if(edge<12)solid(12-edge,h,.35,(12+edge)/2,y+h/2,z);box(24,.16,.55,0,y+.1,z,'trim');box(24,.12,.55,0,y+h-.08,z,'trim');if(frontDoor){box(10,.7,.55,-7,y+.6,z,'trim');box(10,.7,.55,7,y+.6,z,'trim');}else box(24,.7,.55,0,y+.6,z,'trim');}
// A continuous central hall connects four rooms on each floor. Door openings are real geometry.
for(let f=0;f<2;f++){
 const y=f*FLOOR_HEIGHT;
 if(f===0)walls.push(box(24,.2,24,0,-.1,0,'floor'));
 else{walls.push(box(13,.22,24,-5.5,FLOOR_HEIGHT-.11,0,'floor'),box(8.5,.22,24,7.75,FLOOR_HEIGHT-.11,0,'floor'),box(2.5,.22,7,2.25,FLOOR_HEIGHT-.11,-8.5,'floor'),box(2.5,.22,7,2.25,FLOOR_HEIGHT-.11,8.5,'floor'));}
 box(24,.18,24,0,y+3.6,0,'ceiling').visible=f===1;
 facadeWall(f,-12);facadeWall(f,12,f===0);wall(.35,24,-12,0,f);wall(.35,24,12,0,f);
 for(const x of [-4,4]){wall(.22,4,x,-10,f);wall(.22,10,x,0,f);wall(.22,4,x,10,f);box(.3,.65,3,x,y+3.18,-6.5,'trim');box(.3,.65,3,x,y+3.18,6.5,'trim');for(const z of [-8,-5,5,8])box(.33,2.85,.14,x,y+1.43,z,'wood');}
 wall(8,.2,-8,0,f);wall(8,.2,8,0,f);
 // Wallpaper rails and framed, boarded moonlit windows.
 for(const x of [-8,8])for(const z of [-11.79,11.79]){
  const glass=new THREE.MeshStandardMaterial({color:0x506f69,emissive:0x446b6b,emissiveIntensity:.7,roughness:.25});
   walls.push(box(2.9,2,.08,x,y+2,z,glass));for(const dx of [-1.52,0,1.52])box(.11,2.2,.16,x+dx,y+2,z-.03,'trim');for(const dy of [-1.06,1.06])box(3.15,.12,.17,x,y+2+dy,z,'trim');
  for(let i=0;i<3;i++){const board=box(3.5,.2,.14,x,y+1.35+i*.54,z+(z<0?.13:-.13),'wood');board.rotation.z=(i-1)*.16;}
  const light=new THREE.PointLight(0x91bfc0,18,12,2);light.position.set(x,y+2,z+(z<0?1:-1));scene.add(light);
 }
 for(const z of [-8,1,9]){box(.16,.5,.25,-3.8,y+2.4,z,'metal');const bulb=box(.22,.32,.22,-3.65,y+2.5,z,new THREE.MeshStandardMaterial({color:0xffcf8b,emissive:0xffb965,emissiveIntensity:2}));const l=new THREE.PointLight(0xffbb72,13,8,2);l.position.set(-3.3,y+2.4,z);scene.add(l);}
 // Rugs, sofas, bookshelves, beds, tables and scattered papers.
 box(3.8,.035,18,-1.6,y+.02,0,new THREE.MeshStandardMaterial({color:0x49352c}));
 for(const z of [-6,6]){
   solid(1.7,.65,4,-10,y+.325,z,'cloth');box(.35,1.15,4.1,-10.8,y+.575,z,'cloth');for(const dz of [-1.8,1.8])box(1.9,.9,.28,-10,y+.45,z+dz,'cloth');
   solid(1.4,.65,2.4,-7.4,y+.325,z,'wood');box(1.5,.08,2.5,-7.4,y+.69,z,'wood');
   if(f===1){solid(3,.65,4,8,y+.325,z,'wood');box(2.9,.3,3.9,8,y+.8,z,'cloth');box(2.8,.18,.8,8,y+.98,z-1.4,'paper');box(3.2,1.3,.2,8,y+.65,z-2,'wood');}
   else{solid(3,.95,1.8,8,y+.475,z,'wood');box(3.2,.12,2,8,y+1,z,'wood');for(const dx of [-1,1])for(const dz of [-1.6,1.6]){box(.8,.12,.8,8+dx,y+.55,z+dz,'wood');box(.8,1.2,.12,8+dx,y+.6,z+dz+(dz>0?.4:-.4),'wood');}}
 }
 for(const x of [-11.45,11.45]){solid(.65,2.7,3,x,y+1.35,-2.2,'wood');for(let j=0;j<4;j++){box(.8,.1,3.1,x,y+.2+j*.65,-2.2,'trim');for(let k=0;k<9;k++)box(.5,.35+Math.random()*.15,.12,x,y+.43+j*.65,-3.45+k*.3,new THREE.MeshStandardMaterial({color:[0x5d4d38,0x364740,0x79674c,0x522d27][k%4]}));}}
}
// The front entrance sits on the inside face of the south wall, secured with three visible padlocks.
const frontDoor=new THREE.Group();frontDoor.position.z=11.58;scene.add(frontDoor);let frontDoorOpen=false;
const doorWood=new THREE.MeshStandardMaterial({color:0x30251d,roughness:.9}),doorPanel=new THREE.MeshStandardMaterial({color:0x493729,roughness:.88}),lockSteel=new THREE.MeshStandardMaterial({color:0xa8aaa6,metalness:.72,roughness:.3}),lockDark=new THREE.MeshStandardMaterial({color:0x171a1a,metalness:.45,roughness:.42});
for(const x of [-1.34,1.34])box(.2,3.9,.32,x,1.95,-.01,'wood',frontDoor);
box(2.9,.2,.32,0,3.92,-.01,'wood',frontDoor);box(2.9,.18,.32,0,.08,-.01,'wood',frontDoor);
const doorLeaf=new THREE.Group();doorLeaf.position.x=-1.275;frontDoor.add(doorLeaf);
const doorSlab=box(2.55,3.65,.18,1.275,1.83,0,doorWood,doorLeaf),doorSolid={x:0,z:11.58,w:2.55,d:.18,min:0,max:3.65};solids.push(doorSolid);walls.push(doorSlab);
for(const x of [.655,1.895])for(const y of [1.12,2.55])box(.78,1.05,.035,x,y,-.115,doorPanel,doorLeaf);
box(.1,.42,.08,2.195,1.85,-.15,lockSteel,doorLeaf);box(.16,.16,.12,2.195,1.79,-.23,'metal',doorLeaf);
const lockColors=[0xb8322b,0x9a9d9d,0x17191b],doorLockAssemblies=[];
for(let i=0;i<3;i++){
 const x=1.275+(i-1)*.48,body=new THREE.MeshStandardMaterial({color:lockColors[i],metalness:i===1?.68:.18,roughness:i===1?.32:.58}),assembly=new THREE.Group();doorLeaf.add(assembly);doorLockAssemblies.push(assembly);
 box(.32,.36,.12,x,1.83,-.17,body,assembly);
 const shackle=new THREE.Mesh(new THREE.TorusGeometry(.105,.025,7,14,Math.PI),lockSteel);shackle.position.set(x,2.02,-.19);assembly.add(shackle);shackle.castShadow=true;
 box(.045,.13,.05,x-.085,1.99,-.19,lockSteel,assembly);box(.045,.13,.05,x+.085,1.99,-.19,lockSteel,assembly);
 const keyhole=new THREE.Mesh(new THREE.CircleGeometry(.035,10),lockDark);keyhole.position.set(x,1.8,-.237);assembly.add(keyhole);
}
function setFrontDoorOpen(open){frontDoorOpen=open;doorLeaf.rotation.y=open?-Math.PI/2:0;if(open){const i=solids.indexOf(doorSolid);if(i>=0)solids.splice(i,1);const j=walls.indexOf(doorSlab);if(j>=0)walls.splice(j,1);}else{if(!solids.includes(doorSolid))solids.push(doorSolid);if(!walls.includes(doorSlab))walls.push(doorSlab);}}
// Stairwell: 5 m rise, 10 m run, unobstructed landings at both ends.
for(let i=0;i<STAIR_STEPS;i++){const h=(i+1)*FLOOR_HEIGHT/STAIR_STEPS,z=STAIR_RUN/2-.2-i*.4;box(2.5,h,.4,2.25,h/2,z,'wood');box(2.55,.04,.43,2.25,h,z,'trim');if([2,5,8,11,14,17,20,23].includes(i)){const paper=box(.24,.008,.22,i%2?2.75:1.75,h+.024,z,'paper');paper.rotation.y=(i%3-1)*.08;}}
for(const x of [1,3.5]){for(let i=0;i<=STAIR_STEPS;i++)box(.055,1,.055,x,.5+i*.2,STAIR_RUN/2-i*.4,'wood');const rail=box(.1,.1,Math.sqrt(STAIR_RUN*STAIR_RUN+FLOOR_HEIGHT*FLOOR_HEIGHT),x,FLOOR_HEIGHT/2+1,0,'wood');rail.rotation.x=Math.atan(FLOOR_HEIGHT/STAIR_RUN);solids.push({x,z:0,w:.1,d:STAIR_RUN,min:0,max:FLOOR_HEIGHT+1});}
const ambient=new THREE.HemisphereLight(0xb1c1a3,0x30241c,1.1);scene.add(ambient);
const moon=new THREE.DirectionalLight(0xb3cfca,.9);moon.position.set(3,10,7);scene.add(moon);
// Dust catches the light throughout the foyer.
const flashlight=new THREE.SpotLight(0xf4e6bd,48,23,.48,.6,1.5);flashlight.position.set(.15,-.15,-.15);flashlight.target.position.set(0,0,-10);camera.add(flashlight,flashlight.target);
const gun=new THREE.Group();camera.add(gun);gun.position.set(.28,-.26,-.48);
box(.13,.15,.4,0,0,0,'metal',gun);box(.12,.19,.13,0,-.14,.11,'dark',gun);box(.095,.07,.44,0,.085,-.025,'dark',gun);box(.04,.025,.035,0,.135,-.2,'metal',gun);box(.075,.075,.1,0,0,-.23,'dark',gun);box(.12,.12,.3,.015,-.18,.27,'skin',gun);box(.16,.16,.37,.035,-.2,.5,'cloth',gun);
const flash=new THREE.PointLight(0xffaf38,0,5);flash.position.set(0,.03,-.35);gun.add(flash);gun.visible=false;
const muzzle=box(.1,.1,.15,0,.03,-.35,new THREE.MeshBasicMaterial({color:0xffd486}),gun);muzzle.visible=false;
const ray=new THREE.Raycaster();let muted=false;let stepDistance=0;
function sound(...args){sfx.tone(...args);}
const state={started:false,active:false,dead:false,finished:false,bites:0,health:100,fallDamage:0,ammo:12,reserve:96,kills:0,wave:0,reload:0,cooldown:0,nextWave:2,spawn:0,pending:0,bossPending:false,time:0};
const player={x:-1.5,z:8,y:0,yaw:0,pitch:0,jumpHeight:0,jumpVelocity:0,jumpStartY:0,fallSlow:0,eyeHeight:1.65};const keys=new Set();let mouseDown=false,noticeTime=0,damageTime=0,hitTime=0;
function notify(message,time=2.5){$('notice').textContent=message;noticeTime=time;}

function movementMultiplier(){return state.bites>=2?.55:1;}
function shotInterval(){return state.bites>=3?.6:.23;}
function biteStatus(){
 if(state.bites>=5)return 'FATAL INFECTION';
 if(state.bites>=4)return 'SLOWED · SLOW FIRE · BLURRED VISION';
 if(state.bites>=3)return 'SLOWED · SLOW FIRE';
 if(state.bites>=2)return 'MOVEMENT SLOWED';
 return state.bites===1?'BITTEN · FIND A HEALTH KIT':'NO INFECTION';
}
function receiveBite(amount=1){
 if(state.dead)return;
 state.bites=Math.min(5,state.bites+amount);
 hud();
 if(state.bites===5||state.health<=0){die();return;}
 notify(`BITE ${state.bites} / 5  —  ${biteStatus()}`);
}

function blocked(x,z,y,r=.32,height=1.6){const exitLane=frontDoorOpen&&Math.abs(x)<1.7&&z>11.55&&z<15;if(Math.abs(x)>11.55||(Math.abs(z)>11.55&&!exitLane))return true;return solids.some(s=>y+.12<s.max&&y+height>s.min&&Math.abs(x-s.x)<s.w/2+r&&Math.abs(z-s.z)<s.d/2+r);}
function floorHeight(x,z,current){if(x>1&&x<3.5&&z>=-STAIR_RUN/2&&z<=STAIR_RUN/2)return (STAIR_RUN/2-z)*FLOOR_HEIGHT/STAIR_RUN;return current>=FLOOR_HEIGHT/2?FLOOR_HEIGHT:0;}
function canMove(x,z,current,height=1.6){const y=floorHeight(x,z,current);if(Math.abs(y-current)>.32)return false;return !blocked(x,z,y,.32,height);}
// Navigation graph includes collision-tested room grids and explicit stair links.
const nodes=[],lookup=new Map();const key=(x,z,f)=>`${x},${z},${f}`;
for(let f=0;f<2;f++)for(let x=-11;x<=11;x++)for(let z=-11;z<=11;z++){if(x>=1&&x<=3&&z>=-STAIR_RUN/2&&z<=STAIR_RUN/2)continue;const y=f*FLOOR_HEIGHT;if(blocked(x,z,y,.4))continue;const n={x,z,y,neighbors:[],id:nodes.length};nodes.push(n);lookup.set(key(x,z,f),n);}
for(const n of nodes)for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const other=lookup.get(key(n.x+dx,n.z+dz,Math.round(n.y/FLOOR_HEIGHT)));if(other)n.neighbors.push(other.id);}
let previous=lookup.get(key(2,STAIR_RUN/2+1,0));for(let i=0;i<=STAIR_RUN;i++){const n={x:2.25,z:STAIR_RUN/2-i,y:i*FLOOR_HEIGHT/STAIR_RUN,neighbors:[previous.id],id:nodes.length};previous.neighbors.push(n.id);nodes.push(n);previous=n;}const top=lookup.get(key(2,-STAIR_RUN/2-1,1));previous.neighbors.push(top.id);top.neighbors.push(previous.id);
function nearest(x,y,z){let best=nodes[0],dist=Infinity;for(const n of nodes){const d=(n.x-x)**2+(n.z-z)**2+4*(n.y-y)**2;if(d<dist){dist=d;best=n;}}return best;}
function pathToPlayer(zombie){const start=nearest(zombie.group.position.x,zombie.group.position.y,zombie.group.position.z),goal=nearest(player.x,player.y,player.z);const queue=[start.id],came=new Map([[start.id,-1]]);for(let i=0;i<queue.length;i++){const id=queue[i];if(id===goal.id)break;for(const next of nodes[id].neighbors)if(!came.has(next)){came.set(next,id);queue.push(next);}}if(!came.has(goal.id))return[];const path=[];let id=goal.id;while(id!==start.id){path.unshift(nodes[id]);id=came.get(id);}return path;}
const zombies=[];
function makeZombie(x,z,y,decorative=false,bossLevel=0){const g=new THREE.Group();scene.add(g);g.position.set(x,y,z);const isBoss=bossLevel>0;if(isBoss)g.scale.setScalar(1.3+(bossLevel-1)*.15);box(.55,.68,.29,0,1.03,0,'shirt',g);box(.42,.43,.38,0,1.61,0,'skin',g);box(.3,.07,.025,0,1.49,.198, 'blood',g);const eye=new THREE.MeshBasicMaterial({color:0xe5af61});for(const ex of [-.11,.11])box(.055,.035,.018,ex,1.65,.2,eye,g);const legs=[],arms=[];for(const side of [-1,1]){const leg=new THREE.Group();leg.position.set(side*.16,.73,0);g.add(leg);box(.2,.65,.22,0,-.3,0,'dark',leg);box(.22,.15,.35,0,-.64,.06,'dark',leg);legs.push(leg);const arm=new THREE.Group();arm.position.set(side*.36,1.29,0);g.add(arm);box(.18,.55,.18,0,-.24,0,'shirt',arm);box(.16,.28,.16,0,-.57,0,'skin',arm);arm.rotation.x=-1;arms.push(arm);}box(.12,.23,.015,.13,1.06,.153,'blood',g);const zombie={group:g,legs,arms,hp:isBoss?10:4,path:[],repath:0,attack:0,voiceDelay:1+Math.random()*3,phase:Math.random()*6,decorative,boss:isBoss,bossLevel};g.traverse(m=>{if(m.isMesh)m.userData.zombie=zombie;});zombies.push(zombie);return zombie;}
const previewZombie=makeZombie(-1.3,-4.7,0,true);previewZombie.group.rotation.y=.3;
const supplies=[];for(const [x,z,y] of [[-8,-8,0],[9,9,0],[-8,8,FLOOR_HEIGHT],[8,-8,FLOOR_HEIGHT]]){const g=new THREE.Group();g.position.set(x,y+.2,z);scene.add(g);box(.6,.4,.4,0,0,0,'cloth',g);box(.11,.27,.025,0,0,.212,'paper',g);box(.3,.09,.025,0,0,.214,'paper',g);supplies.push({group:g,used:false});}
const keyNames=['RED','GRAY','BLACK'],keyColors=[0xc8342e,0xb8bdbb,0x242729],collectedKeys=new Set(),unlockedLocks=new Set(),droppedKeys=[];
function dropKey(x,y,z,index){const g=new THREE.Group();g.position.set(x,y+.32,z);scene.add(g);const color=keyColors[index],glowColor=index===2?0xd8e6ed:color,keyMat=new THREE.MeshStandardMaterial({color,emissive:index===2?0x9aabb3:color,emissiveIntensity:1.4,metalness:.25,roughness:.3}),markerMat=new THREE.MeshBasicMaterial({color:glowColor,transparent:true,opacity:.85,depthWrite:false}),ring=new THREE.Mesh(new THREE.TorusGeometry(.18,.045,8,20),keyMat);ring.position.x=-.18;ring.rotation.x=Math.PI/2;g.add(ring);box(.5,.08,.08,.12,0,0,keyMat,g);box(.09,.18,.08,.3,-.06,0,keyMat,g);box(.09,.15,.08,.07,-.055,0,keyMat,g);const halo=new THREE.Mesh(new THREE.TorusGeometry(.42,.025,6,28),markerMat);halo.rotation.x=Math.PI/2;halo.position.y=-.27;g.add(halo);const light=new THREE.PointLight(glowColor,2.2,5);light.position.y=.15;g.add(light);droppedKeys.push({group:g,index,baseY:g.position.y,phase:Math.random()*Math.PI*2});}
function hud(){state.health=Math.max(0,(5-state.bites)*20-state.fallDamage);$('bites').textContent=state.bites;$('bite-status').textContent=biteStatus();$('key-status').textContent=`KEYS ${keyNames.map((name,i)=>unlockedLocks.has(i)?`${name[0]}✓`:collectedKeys.has(i)?`${name[0]}•`:'·').join('  ')}`;document.body.classList.toggle('infected-vision',state.bites>=4);$('health').textContent=Math.ceil(state.health);$('healthbar').style.width=state.health+'%';$('ammo').textContent=state.reload?'··':String(state.ammo).padStart(2,'0');$('reserve').textContent=state.reserve;$('wave').textContent=String(state.wave).padStart(2,'0');$('remaining').textContent=zombies.filter(z=>!z.decorative).length+state.pending+(state.bossPending?1:0);}
function reset(){keys.clear();adminCodeIndex=0;adminCodeUsed=false;adminCodeStarted=0;allKeysCodeIndex=0;allKeysCodeUsed=false;allKeysCodeStarted=0;mouseDown=false;damageTime=0;hitTime=0;noticeTime=0;$('damage').style.opacity=0;$('hitmarker').style.opacity=0;$('notice').textContent='';sfx.stopAll();sfx.setPaused(true);stepDistance=0;for(const z of zombies)scene.remove(z.group);zombies.length=0;for(const key of droppedKeys)scene.remove(key.group);droppedKeys.length=0;collectedKeys.clear();unlockedLocks.clear();doorLockAssemblies.forEach(lock=>lock.visible=true);setFrontDoorOpen(false);$('credits-screen').hidden=true;Object.assign(state,{started:true,active:false,dead:false,finished:false,bites:0,health:100,fallDamage:0,ammo:12,reserve:96,kills:0,wave:0,reload:0,cooldown:0,nextWave:1,spawn:0,pending:0,bossPending:false,time:0});Object.assign(player,{x:-1.5,z:8,y:0,yaw:0,pitch:0,jumpHeight:0,jumpVelocity:0,jumpStartY:0,fallSlow:0,eyeHeight:1.65});for(const s of supplies){s.used=false;s.group.visible=true;}flashlight.visible=true;gun.visible=true;$('menu').hidden=true;$('scene-label').hidden=true;$('hud').hidden=false;document.body.classList.add('playing');hud();}
function pause(){sfx.setPaused(true);state.active=false;keys.clear();mouseDown=false;if(!state.dead){$('overlay-title').textContent='PAUSED';$('overlay-description').textContent='Take a breath. They can wait.';$('resume').textContent='BACK TO THE HOUSE';} $('overlay').hidden=false;}
async function lock(){void sfx.unlock();try{await renderer.domElement.requestPointerLock();}catch{pause();$('overlay-description').textContent='Mouse capture was blocked. Open the game in its own browser tab, then try again.';}}
$('start').onclick=()=>{reset();sound(160,.2);lock();};$('resume').onclick=()=>{if(state.dead)reset();lock();};$('play-again').onclick=()=>{reset();sound(160,.2);lock();};$('home-from-pause').onclick=()=>{window.location.href='./';};$('home-from-credits').onclick=()=>{window.location.href='./';};document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement===renderer.domElement){state.active=true;sfx.setPaused(false);$('overlay').hidden=true;}else if(state.started&&!state.finished)pause();});
document.addEventListener('mousemove',e=>{if(!state.active)return;player.yaw-=e.movementX*.002;player.pitch=THREE.MathUtils.clamp(player.pitch-e.movementY*.002,-1.4,1.4);});
const adminCode=['ArrowUp','ArrowLeft','ArrowRight','ArrowUp'],allKeysCode=['ArrowUp','ArrowUp','ArrowUp'];let adminCodeIndex=0,adminCodeUsed=false,adminCodeStarted=0,allKeysCodeIndex=0,allKeysCodeUsed=false,allKeysCodeStarted=0;
function advanceCheatCode(code,sequence,index,started,now){if(index&&now-started>3000){index=0;started=0;}if(code===sequence[index]){if(index===0)started=now;index++;}else if(code===sequence[0]){index=1;started=now;}else{index=0;started=0;}return{index,started,complete:index===sequence.length};}
document.addEventListener('keydown',e=>{if(!state.started||state.dead||state.finished||e.repeat||!e.code.startsWith('Arrow'))return;const now=performance.now();if(!allKeysCodeUsed){const step=advanceCheatCode(e.code,allKeysCode,allKeysCodeIndex,allKeysCodeStarted,now);allKeysCodeIndex=step.index;allKeysCodeStarted=step.started;if(step.complete){allKeysCodeUsed=true;for(let i=0;i<keyNames.length;i++)if(!collectedKeys.has(i)&&!unlockedLocks.has(i)&&!droppedKeys.some(drop=>drop.index===i))dropKey(player.x+(i-1)*.8,player.y,player.z,i);allKeysCodeIndex=0;allKeysCodeStarted=0;notify('ALL KEYS DROPPED  /  PICK THEM UP',3);}}if(!adminCodeUsed){const step=advanceCheatCode(e.code,adminCode,adminCodeIndex,adminCodeStarted,now);adminCodeIndex=step.index;adminCodeStarted=step.started;if(step.complete){adminCodeUsed=true;for(const z of [...zombies])if(!z.decorative){scene.remove(z.group);zombies.splice(zombies.indexOf(z),1);}state.wave=5;state.pending=24;state.bossPending=true;state.spawn=.1;state.nextWave=5;state.kills=0;adminCodeIndex=0;adminCodeStarted=0;notify('ADMIN CODE ACCEPTED  /  STAGE 05',3);hud();}}});
document.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(!state.active)return;if(e.code==='Space'&&!e.repeat&&player.jumpHeight===0&&!keys.has('ShiftLeft')&&!keys.has('ShiftRight')){player.jumpStartY=player.y;player.jumpVelocity=5.2;}keys.add(e.code);if(e.code==='KeyR')reload();if(e.code==='KeyF'&&!e.repeat){flashlight.visible=!flashlight.visible;sound(300,.04);}if(e.code==='KeyE')collect();});document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();mouseDown=false;if(state.active){document.exitPointerLock();pause();}});document.addEventListener('mousedown',e=>{if(state.active&&e.button===0)mouseDown=true;});document.addEventListener('mouseup',()=>mouseDown=false);document.addEventListener('contextmenu',e=>e.preventDefault());
function reload(){if(state.reload||state.ammo===12||state.reserve===0)return;state.reload=1.5;sfx.play('reload',{volume:.65,duration:1.5});notify('RELOADING',1.5);hud();}
function collect(){
 const keyIndex=droppedKeys.findIndex(k=>k.group.position.distanceTo(new THREE.Vector3(player.x,player.y+.55,player.z))<2);
 if(keyIndex>=0){const [drop]=droppedKeys.splice(keyIndex,1);scene.remove(drop.group);collectedKeys.add(drop.index);hud();notify(`${keyNames[drop.index]} KEY ACQUIRED / RETURN TO THE FRONT DOOR`,3);sound(650,.2);return;}
 if(Math.hypot(player.x,player.z-11.58)<2.2&&player.y<1.5){const lockIndex=[0,1,2].find(i=>!unlockedLocks.has(i));if(lockIndex!==undefined){if(!collectedKeys.has(lockIndex))notify(`FRONT DOOR LOCKED / ${keyNames[lockIndex]} KEY REQUIRED`,2);else{collectedKeys.delete(lockIndex);unlockedLocks.add(lockIndex);doorLockAssemblies[lockIndex].visible=false;hud();if(unlockedLocks.size===3){setFrontDoorOpen(true);notify('ALL THREE LOCKS OPEN / WALK THROUGH THE DOOR',4);}else notify(`${keyNames[lockIndex]} LOCK UNLOCKED / ${unlockedLocks.size} OF 3`,3);sound(480,.25);}}else{setFrontDoorOpen(true);notify('DOOR IS OPEN / WALK THROUGH TO ESCAPE',3);}return;}
 const s=supplies.find(s=>!s.used&&s.group.position.distanceTo(new THREE.Vector3(player.x,player.y+.55,player.z))<2);if(!s){notify('FIND A SUPPLY KIT IN THE ROOMS',1.5);return;}s.used=true;s.group.visible=false;const healedBite=state.bites>0;if(healedBite)state.bites--;else state.fallDamage=Math.max(0,state.fallDamage-20);state.cooldown=Math.min(state.cooldown,shotInterval());state.reserve+=36;notify(healedBite?'−1 BITE  /  +36 ROUNDS':'+20 HEALTH  /  +36 ROUNDS');sound(650,.2);hud();}
function shoot(){if(state.cooldown||state.reload)return;if(state.ammo<=0){reload();state.cooldown=.25;return;}state.ammo--;state.cooldown=shotInterval();flash.intensity=14;muzzle.visible=true;sfx.play('gunshot',{volume:.65,rate:.97+Math.random()*.06});gun.rotation.x=.11;ray.setFromCamera(new THREE.Vector2(),camera);const hits=ray.intersectObjects([...walls,...zombies.map(z=>z.group)],true);if(hits.length&&hits[0].object.userData.zombie){const z=hits[0].object.userData.zombie,head=hits[0].point.y-z.group.position.y>1.4*z.group.scale.y;z.hp-=z.boss?(head?2:1):(head?2:1);hitTime=.12;if(z.hp<=0){if(z.boss){dropKey(z.group.position.x,z.group.position.y,z.group.position.z,z.bossLevel-1);notify(`BOSS DEFEATED  /  ${keyNames[z.bossLevel-1]} KEY DROPPED`,3);}for(const voice of [...sfx.voices])if(voice.position===z.group.position)voice.stop();scene.remove(z.group);zombies.splice(zombies.indexOf(z),1);state.kills++;if(head&&!z.boss)notify('HEADSHOT',.65);}}hud();}
function finishGame(){state.dead=true;state.finished=true;state.active=false;sfx.setPaused(true);$('hud').hidden=true;$('overlay').hidden=true;$('credits-screen').hidden=false;document.exitPointerLock();}
function die(){adminCodeIndex=0;adminCodeUsed=false;sfx.setPaused(true);state.dead=true;state.active=false;document.exitPointerLock();$('overlay-title').textContent='OVERRUN';$('overlay-description').textContent=`You survived ${Math.floor(state.time)} seconds, reached wave ${state.wave}, and took down ${state.kills} zombies.`;$('resume').textContent='TRY AGAIN';$('overlay').hidden=false;}
function update(dt){state.time+=dt;state.cooldown=Math.max(0,state.cooldown-dt);player.fallSlow=Math.max(0,player.fallSlow-dt);if(state.reload){state.reload=Math.max(0,state.reload-dt);if(!state.reload){const count=Math.min(12-state.ammo,state.reserve);state.ammo+=count;state.reserve-=count;hud();}}
 const crouched=keys.has('ShiftLeft')||keys.has('ShiftRight'),wasAirborne=player.jumpHeight>0||player.jumpVelocity>0;player.jumpVelocity-=14*dt;player.jumpHeight+=player.jumpVelocity*dt;const landed=wasAirborne&&player.jumpHeight<=0;if(player.jumpHeight<=0){player.jumpHeight=0;player.jumpVelocity=0;}player.eyeHeight=THREE.MathUtils.lerp(player.eyeHeight,crouched?1.05:1.65,1-Math.exp(-dt*14));
 let forward=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0),side=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);const len=Math.hypot(forward,side)||1;forward/=len;side/=len;const speed=(keys.has('ControlLeft')||keys.has('ControlRight')?5:3)*movementMultiplier()*(crouched?.62:1)*(player.fallSlow>0?.58:1)*dt;
 const dx=(-Math.sin(player.yaw)*forward+Math.cos(player.yaw)*side)*speed,dz=(-Math.cos(player.yaw)*forward-Math.sin(player.yaw)*side)*speed;
 const oldX=player.x,oldZ=player.z;
 // Jumping clears the stair rails and can land on either floor; solid geometry still blocks movement.
  const bodyHeight=crouched?1.05:1.6,canStep=(x,z)=>player.jumpHeight>0?!blocked(x,z,player.y+player.jumpHeight,.32,bodyHeight):canMove(x,z,player.y,bodyHeight),steps=Math.max(3,Math.ceil(Math.hypot(dx,dz)/.08));
  for(let i=0;i<steps;i++){if(canStep(player.x+dx/steps,player.z))player.x+=dx/steps;player.y=floorHeight(player.x,player.z,player.y);if(canStep(player.x,player.z+dz/steps))player.z+=dz/steps;player.y=floorHeight(player.x,player.z,player.y);}
 if(landed){const drop=player.jumpStartY-player.y;if(drop>1.5){const damage=Math.min(60,Math.round(18+(drop-1.5)*12));state.fallDamage=Math.min(100,state.fallDamage+damage);player.fallSlow=5;damageTime=.55;notify(`HARD LANDING  /  -${damage} HEALTH`,2);hud();if(state.health<=0){die();return;}}}
 const moved=Math.hypot(player.x-oldX,player.z-oldZ);
 if(frontDoorOpen&&player.z>11.8){finishGame();}
 if(moved>.0001){stepDistance+=moved;if(stepDistance>=1.35){stepDistance%=1.35;sfx.play('footstep',{volume:(keys.has('ControlLeft')||keys.has('ControlRight'))?.55:.35,rate:.92+Math.random()*.16});}}else stepDistance=1;
 sfx.update(player);
 camera.position.set(player.x,player.y+player.eyeHeight+player.jumpHeight+((forward||side)?Math.sin(state.time*11)*(crouched?.012:.025):0),player.z);camera.rotation.set(player.pitch,player.yaw,0);camera.updateMatrixWorld();
 gun.position.y=state.reload?-.26-Math.sin(state.reload/1.5*Math.PI)*.27:-.26+Math.sin(state.time*7)*.006;gun.rotation.x*=Math.exp(-dt*15);flash.intensity*=Math.exp(-dt*45);if(flash.intensity<1)muzzle.visible=false;
 if(mouseDown)shoot();
 if(!zombies.length&&!state.pending&&!state.bossPending){if(state.wave>=15){if(state.nextWave!==Infinity){state.nextWave=Infinity;notify('ALL 15 WAVES CLEARED  /  FIND THE THREE KEYS',4);}}else{state.nextWave-=dt;if(state.nextWave<=0){state.wave++;state.pending=8+(state.wave-1)*4;state.bossPending=state.wave%5===0;state.spawn=.1;state.nextWave=5;if(state.wave>1){state.reserve+=24;for(const s of supplies){s.used=false;s.group.visible=true;}}notify(state.bossPending?`BOSS WAVE ${String(state.wave).padStart(2,'0')}`:`WAVE ${String(state.wave).padStart(2,'0')}  /  THEY’RE INSIDE`,3);hud();}}}
 if(state.pending){state.spawn-=dt;if(state.spawn<=0){const spots=[[-10,-9,0],[10,-9,0],[-10,9,FLOOR_HEIGHT],[10,-9,FLOOR_HEIGHT],[10,9,0]];const valid=spots.filter(([x,z,y])=>Math.hypot(x-player.x,z-player.z,y-player.y)>7);const [x,z,y]=(valid.length?valid:spots)[Math.floor(Math.random()*(valid.length||spots.length))];makeZombie(x,z,y);state.pending--;state.spawn=1.2;hud();}}
 if(state.bossPending&&state.pending===0&&!zombies.some(z=>!z.decorative)){const spots=[[-10,-9,0],[10,-9,0],[-10,9,FLOOR_HEIGHT],[10,-9,FLOOR_HEIGHT],[10,9,0]],spawn=spots.reduce((best,s)=>Math.hypot(s[0]-player.x,s[1]-player.z,s[2]-player.y)>Math.hypot(best[0]-player.x,best[1]-player.z,best[2]-player.y)?s:best,spots[0]);makeZombie(spawn[0],spawn[1],spawn[2],false,state.wave/5);state.bossPending=false;notify(`BOSS ${state.wave/5}  /  5 HEADSHOTS OR 10 BODY SHOTS`,4);hud();}
 for(const drop of droppedKeys){drop.group.rotation.y+=dt*1.5;drop.group.position.y=drop.baseY+Math.sin(state.time*2+drop.phase)*.09;}
 for(const z of zombies){z.voiceDelay-=dt;if(z.voiceDelay<=0){if(z.group.position.distanceTo(new THREE.Vector3(player.x,player.y,player.z))<19)sfx.play('zombie',{volume:.65,rate:.82+Math.random()*.3,position:z.group.position,listener:player});z.voiceDelay=4+Math.random()*5;}z.repath-=dt;z.attack-=dt;const p=z.group.position;if(z.repath<=0){z.path=pathToPlayer(z);z.repath=.65+Math.random()*.4;}let target=z.path[0];const dist=Math.hypot(p.x-player.x,p.z-player.z);if(dist<1.6&&Math.abs(p.y-player.y)<.5)target={x:player.x,y:player.y,z:player.z};if(target){const dx=target.x-p.x,dz=target.z-p.z,dy=target.y-p.y,d=Math.hypot(dx,dz,dy);if(d<.12)z.path.shift();else if(dist>.85||Math.abs(p.y-player.y)>.5){const pace=1.3+(state.wave-1)*.15+(z.boss?.8+z.bossLevel*.45:0),step=Math.min(d,dt*pace),steps=Math.max(1,Math.ceil(step/.08));let moved=false;for(let i=1;i<=steps;i++){const nx=p.x+dx/d*step*i/steps,nz=p.z+dz/d*step*i/steps,ny=p.y+dy/d*step*i/steps;if(blocked(nx,nz,ny,.3,1.8))break;p.set(nx,ny,nz);moved=true;}if(!moved)z.repath=0;z.group.rotation.y=Math.atan2(dx,dz);}}z.phase+=dt*5;z.legs.forEach((l,i)=>l.rotation.x=Math.sin(z.phase+i*Math.PI)*.35);z.arms.forEach((a,i)=>a.rotation.x=-1+Math.sin(z.phase+i)*.12);if(dist<1.25&&Math.abs(p.y-(player.y+player.jumpHeight))<.55&&z.attack<=0){ray.set(new THREE.Vector3(p.x,p.y+1.1,p.z),new THREE.Vector3(player.x-p.x,player.jumpHeight,player.z-p.z).normalize());const cover=ray.intersectObjects(walls);if(!cover.length||cover[0].distance>dist){receiveBite(z.boss?z.bossLevel:1);z.attack=z.boss?Math.max(.45,1.1-z.bossLevel*.2):1;damageTime=.4;sfx.play('zombie',{volume:.9,rate:1.2,position:z.group.position,listener:player});if(state.dead)break;}}}
 const room=player.x<-4?(player.z<0?'LIBRARY':'SITTING ROOM'):player.x>4?(player.y>2?'BEDROOM':player.z<0?'DINING ROOM':'KITCHEN'):'FOYER';$('room').textContent=`${player.y>2?'UPPER':'GROUND'} FLOOR · ${room}`;
 const nearKey=droppedKeys.find(k=>k.group.position.distanceTo(new THREE.Vector3(player.x,player.y+.55,player.z))<2);if(nearKey&&noticeTime<.1)notify(`[ E ]  PICK UP ${keyNames[nearKey.index]} KEY`,.15);else if(Math.hypot(player.x,player.z-11.58)<2.2&&noticeTime<.1){const nextLock=[0,1,2].find(i=>!unlockedLocks.has(i));notify(nextLock===undefined?'[ E ]  ESCAPE':collectedKeys.has(nextLock)?`[ E ]  USE ${keyNames[nextLock]} KEY`:`NEED ${keyNames[nextLock]} KEY`,.15);}else{const near=supplies.find(s=>!s.used&&s.group.position.distanceTo(new THREE.Vector3(player.x,player.y+.55,player.z))<2);if(near&&noticeTime<.1)notify('[ E ]  MEDICAL KIT + AMMUNITION',.15);}
 noticeTime=Math.max(0,noticeTime-dt);if(!noticeTime)$('notice').textContent='';damageTime=Math.max(0,damageTime-dt);hitTime=Math.max(0,hitTime-dt);$('damage').style.opacity=damageTime*2;$('hitmarker').style.opacity=hitTime?1:0;
}
let last=performance.now();function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.04);last=now;if(state.active)update(dt);else if(!state.started){camera.position.set(-2.9,1.8,10.3);camera.rotation.set(-.025,Math.sin(now*.00008)*.04-.12,0);previewZombie.arms[0].rotation.x=-.9+Math.sin(now*.001)*.1;}renderer.render(scene,camera);}requestAnimationFrame(frame);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});$('sound').onclick=()=>{muted=!muted;sfx.setMuted(muted);if(!muted)void sfx.unlock();$('sound').textContent=muted?'SOUND OFF':'SOUND ON';};$('credits').onclick=()=>$('credits-dialog').showModal();$('close-credits').onclick=()=>$('credits-dialog').close();$('loading').textContent='READY TO PLAY';

// Opt-in browser smoke checks exercise the actual world and gameplay state.
if(new URLSearchParams(location.search).has('test')){
 const results=[];const check=(name,condition)=>{results.push(`${condition?'PASS':'FAIL'} ${name}`);};muted=true;sfx.setMuted(true);reset();
 const visited=new Set([0]),queue=[0];for(let i=0;i<queue.length;i++)for(const n of nodes[queue[i]].neighbors)if(!visited.has(n)){visited.add(n);queue.push(n);}check('All navigable rooms and both floors are connected',visited.size===nodes.length);
 for(const f of [0,FLOOR_HEIGHT])for(const x of [-9,9])for(const z of [-9,9])check(`Zombie route from room ${x},${z},floor ${f/FLOOR_HEIGHT}`,pathToPlayer({group:{position:new THREE.Vector3(x,f,z)}}).length>0);
 let stairY=0,stairOK=true;for(let z=STAIR_RUN/2+.1;z>=-STAIR_RUN/2-.1;z-=.05){if(!canMove(2.25,z,stairY))stairOK=false;stairY=floorHeight(2.25,z,stairY);}check('Stairs can be climbed continuously',stairOK&&stairY===FLOOR_HEIGHT);
 check('Exterior walls block movement',!canMove(12,8,0));
 update(.04);for(let i=0;i<50;i++)update(.04);check('First wave spawns zombies',state.wave===1&&zombies.length>0);
 state.ammo=0;reload();for(let i=0;i<40;i++)update(.04);check('Reload transfers ammunition',state.ammo===12&&state.reserve===84);
 player.x=-8;player.z=-8;player.y=0;state.bites=3;hud();collect();check('Supply kits remove one bite and restore ammunition',state.bites===2&&state.health===60&&state.reserve===120&&supplies[0].used);
 reset();check('Restart clears enemies and restores player',zombies.length===0&&state.health===100&&state.wave===0&&state.ammo===12);
 state.active=true;for(const code of ['ArrowUp','ArrowLeft','ArrowRight','ArrowDown'])document.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true}));check('Admin code rejects an incorrect final arrow',state.wave===0&&!state.bossPending);
 let cheatStep={index:0,started:0};for(const [code,now] of [['ArrowUp',0],['ArrowLeft',700],['ArrowRight',1400],['ArrowUp',2100]])cheatStep=advanceCheatCode(code,adminCode,cheatStep.index,cheatStep.started,now);check('Admin code completes within three seconds',cheatStep.complete);
 cheatStep={index:0,started:0};for(const [code,now] of [['ArrowUp',0],['ArrowLeft',1100],['ArrowRight',2200],['ArrowUp',3100]])cheatStep=advanceCheatCode(code,adminCode,cheatStep.index,cheatStep.started,now);check('Admin code times out after three seconds',!cheatStep.complete);
 cheatStep={index:0,started:0};for(const now of [0,1500,3001])cheatStep=advanceCheatCode('ArrowUp',allKeysCode,cheatStep.index,cheatStep.started,now);check('All keys code times out after three seconds',!cheatStep.complete);
 state.active=false;for(const code of ['ArrowUp','KeyW','ArrowLeft','ArrowRight','ArrowUp'])document.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true}));check('Admin arrow sequence works while paused and ignores other keys',state.wave===5&&state.pending===24&&state.bossPending&&state.nextWave===5&&adminCodeUsed);
 state.wave=2;state.pending=0;state.bossPending=false;for(const code of adminCode)document.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true}));check('Admin code stays spent until restart',state.wave===2&&state.pending===0&&!state.bossPending);
 reset();check('Restart resets the admin code',!adminCodeUsed);

 receiveBite();check('First bite is tracked without penalties',state.bites===1&&movementMultiplier()===1&&shotInterval()===.23&&$('bites').textContent==='1');
 receiveBite();keys.add('KeyW');const beforeZ=player.z;update(.04);keys.clear();check('Second bite slows actual movement',Math.abs(beforeZ-player.z-3*.55*.04)<.0001);
 receiveBite();state.cooldown=0;shoot();check('Third bite slows actual firing',state.cooldown===.6&&state.ammo===11);
 receiveBite();check('Fourth bite blurs the world but leaves HUD readable',document.body.classList.contains('infected-vision')&&getComputedStyle($('game')).filter.includes('blur')&&getComputedStyle($('hud')).filter==='none');
 player.x=-8;player.z=-8;collect();check('Healing four to three bites clears blur',state.bites===3&&!document.body.classList.contains('infected-vision')&&shotInterval()===.6);
 player.x=9;player.z=9;collect();check('Healing three to two restores firing speed',state.bites===2&&shotInterval()===.23&&state.cooldown<=.23);
 player.x=-8;player.z=8;player.y=4;collect();check('Healing two to one restores movement',state.bites===1&&movementMultiplier()===1);
 player.x=8;player.z=-8;collect();collect();check('Healing cannot reduce bites below zero',state.bites===0&&state.health===100);
 for(let i=0;i<5;i++)receiveBite();check('Fifth bite kills and displays five bites',state.dead&&state.health===0&&$('bites').textContent==='5'&&!$('overlay').hidden);
 reset();check('Restart removes all bite effects',state.bites===0&&!state.dead&&!document.body.classList.contains('infected-vision')&&movementMultiplier()===1&&shotInterval()===.23);
 unlockedLocks.add(0);unlockedLocks.add(1);unlockedLocks.add(2);player.x=0;player.z=10;collect();player.z=11.9;update(.01);check('Walking through the open front door shows the ending credits',state.finished&&$('credits-screen').hidden===false&&$('overlay').hidden&&$('hud').hidden);
 const report=document.createElement('pre');report.id='test-results';report.textContent=results.join('\n');report.style.cssText='position:fixed;inset:100px 20px;background:#101810;color:white;z-index:99;padding:30px;overflow:auto';document.body.append(report);
}
