(function(){
const THREE=window.THREE;const C=window.WEDDING;


const $=id=>document.getElementById(id);
$('gName').textContent=C.groom;$('bName').textContent=C.bride;
$('sign').textContent=`${C.groom} & ${C.bride}`;
$('venue').textContent=C.venue;$('addr').textContent=C.address;$('mapLink').href=C.map;
if(C.message)$('msg').textContent=C.message;
if(C.time){$('time').hidden=false;$('time').textContent=C.time}
if(C.dress){$('dressSec').hidden=false;$('dress').textContent=C.dress}
if(C.rsvpText||C.rsvpLink){$('rsvpSec').hidden=false;$('rsvpText').textContent=C.rsvpText;C.rsvpLink?$('rsvpLink').href=C.rsvpLink:$('rsvpLink').remove()}
const d=new Date(C.date);
const f=(o)=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',...o}).format(d);
$('dow').textContent=f({weekday:'long'});$('day').textContent=f({day:'numeric'});$('mon').textContent=f({month:'long',year:'numeric'});
const tick=()=>{let s=Math.max(0,Math.floor((d-Date.now())/1000));
  $('cdD').textContent=Math.floor(s/86400);$('cdH').textContent=Math.floor(s%86400/3600);
  $('cdM').textContent=Math.floor(s%3600/60);$('cdS').textContent=s%60};
tick();setInterval(tick,1000);

/* open the envelope */
$('openBtn').addEventListener('click',()=>{
  document.body.classList.add('open');
  setTimeout(()=>{document.body.classList.remove('locked');document.querySelectorAll('#hero [data-r]').forEach((e,i)=>setTimeout(()=>e.classList.add('in'),i*350))},1700);
},{once:true});

/* reveal on scroll */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!e.target.closest('#hero')){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.3});
document.querySelectorAll('[data-r]').forEach(e=>io.observe(e));

/* petals: WebGL */
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const canvas=$('gl');
let r;
try{r=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true})}catch(error){return}
r.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x170b13,6,22);
const cam=new THREE.PerspectiveCamera(55,1,.1,50);cam.position.z=8;
const shape=new THREE.Shape();
shape.moveTo(0,0);shape.bezierCurveTo(.5,.25,.55,.95,0,1.2);shape.bezierCurveTo(-.55,.95,-.5,.25,0,0);
const geo=new THREE.ShapeGeometry(shape,10);geo.translate(0,-.6,0);geo.scale(.55,.55,.55);
const mat=new THREE.MeshBasicMaterial({side:THREE.DoubleSide,transparent:true,opacity:.9,fog:true});
const N=matchMedia('(max-width:700px)').matches?70:130;
const mesh=new THREE.InstancedMesh(geo,mat,N);scene.add(mesh);
const pal=['#e0909f','#f3c4cc','#c9748a','#f2e8d5','#c9a45c'].map(c=>new THREE.Color(c));
const P=[];
for(let i=0;i<N;i++){
  P.push({x:(Math.random()-.5)*22,y:(Math.random()-.5)*26,z:-8+Math.random()*13,
    s:.5+Math.random()*1,rx:Math.random()*6,ry:Math.random()*6,rz:Math.random()*6,
    vx:(Math.random()-.5)*.25,vy:-.12-Math.random()*.3,vr:.3+Math.random()*.9,ph:Math.random()*6});
  mesh.setColorAt(i,pal[i%pal.length].clone().multiplyScalar(.6+Math.random()*.5));
}
const o=new THREE.Object3D();let mx=0,my=0,scroll=0,sm=0;
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
addEventListener('scroll',()=>{scroll=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)},{passive:true});
function size(){const w=innerWidth,h=innerHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
addEventListener('resize',size);size();
const clock=new THREE.Clock();
function frame(){
  const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
  sm+=(scroll-sm)*.05;
  cam.position.x+=(mx*1.2-cam.position.x)*.03;
  cam.position.y+=(-my*.8-sm*9-cam.position.y)*.05;   // camera glides down through the petals as you scroll
  cam.position.z=8-sm*3;cam.lookAt(0,cam.position.y*.9,0);
  for(let i=0;i<N;i++){const p=P[i];
    if(!reduce){p.y+=p.vy*dt*3;p.x+=(p.vx+Math.sin(t*.6+p.ph)*.12)*dt*3;p.rx+=p.vr*dt;p.ry+=p.vr*.7*dt;p.rz+=p.vr*.4*dt;
      if(p.y<cam.position.y-13)p.y=cam.position.y+13;if(p.y>cam.position.y+14)p.y=cam.position.y-12}
    o.position.set(p.x,p.y,p.z);o.rotation.set(p.rx,p.ry,p.rz);o.scale.setScalar(p.s);o.updateMatrix();mesh.setMatrixAt(i,o.matrix)}
  mesh.instanceMatrix.needsUpdate=true;
  r.render(scene,cam);requestAnimationFrame(frame)
}
frame();

})();
