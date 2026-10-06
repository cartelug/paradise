import type {LeopardMotion} from './leopard-motion';

/** A photographic mesh fallback for browsers with WebGL disabled. */
export function createCanvasLeopard(scene:HTMLElement,canvas:HTMLCanvasElement,background:HTMLImageElement):LeopardMotion|null {
  let ctx:CanvasRenderingContext2D|null=null;
  try { ctx=canvas.getContext('2d',{alpha:true}); } catch { /* Keep the HTML artwork visible. */ }
  if(!ctx){scene.dataset.leopardMotion='fallback';return null;}
  const small=window.matchMedia('(max-width: 900px)');
  const source=document.createElement('canvas'); source.width=1536; source.height=1024;
  const paint=source.getContext('2d'); if(!paint){scene.dataset.leopardMotion='fallback';return null;}
  const cols=6,rows=18,left=810,cellX=(1536-left)/cols,cellY=1024/rows;
  const points:{x:number,y:number,chest:number,head:number,l:number,r:number}[]=[];
  const positions=new Float32Array((cols+1)*(rows+1)*2);
  const smooth=(a:number,b:number,v:number)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
  for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){
    const px=left+x*cellX,py=y*cellY,u=px/1536,v=py/1024;
    points.push({x:px,y:py,chest:Math.exp(-(((v-.73)/.22)**2))*smooth(.52,.76,u),head:1-smooth(.47,.72,v),
      l:1-smooth(.35,1,Math.hypot((u-.679)/.090,(v-.171)/.113)),
      r:1-smooth(.35,1,Math.hypot((u-.931)/.081,(v-.157)/.106))});
  }
  let available=false,active=false,reduced=false,frame=0,last=0,lastDraw=0,time=0,lastStatus=0;
  let scale=1,offsetX=0,offsetY=0,density=1,lookX=0,lookY=0,targetX=0,targetY=0;
  let open:HTMLImageElement,closed:HTMLImageElement;
  scene.dataset.leopardMotion='loading';scene.dataset.leopardRenderer='canvas';
  const pulse=(period:number,offset:number,duration:number)=>{
    const p=(time+offset)%period;return p<duration?Math.sin(p/duration*Math.PI):0;
  };
  const load=(url:string|undefined)=>new Promise<HTMLImageElement>((resolve,reject)=>{
    if(!url){reject(new Error('Missing artwork'));return;}
    const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=url;
  });

  function triangle(a:number,b:number,c:number) {
    const p=points[a],q=points[b],r=points[c];
    const ax=positions[a*2],ay=positions[a*2+1],bx=positions[b*2],by=positions[b*2+1],cx=positions[c*2],cy=positions[c*2+1];
    const det=p.x*(q.y-r.y)+q.x*(r.y-p.y)+r.x*(p.y-q.y);
    const m00=(ax*(q.y-r.y)+bx*(r.y-p.y)+cx*(p.y-q.y))/det;
    const m10=(ay*(q.y-r.y)+by*(r.y-p.y)+cy*(p.y-q.y))/det;
    const m01=(ax*(r.x-q.x)+bx*(p.x-r.x)+cx*(q.x-p.x))/det;
    const m11=(ay*(r.x-q.x)+by*(p.x-r.x)+cy*(q.x-p.x))/det;
    const tx=ax-m00*p.x-m01*p.y,ty=ay-m10*p.x-m11*p.y;
    ctx!.save();ctx!.beginPath();
    // A fractional overlap closes raster seams without changing the mesh pose.
    const midX=(ax+bx+cx)/3,midY=(ay+by+cy)/3;
    for(const [i,x,y] of [[0,ax,ay],[1,bx,by],[2,cx,cy]]){
      const length=Math.hypot(x-midX,y-midY)||1;
      const vx=x+(x-midX)/length*.45,vy=y+(y-midY)/length*.45;
      if(i===0)ctx!.moveTo(vx,vy);else ctx!.lineTo(vx,vy);
    }
    ctx!.closePath();ctx!.clip();
    ctx!.setTransform(m00*density,m10*density,m01*density,m11*density,tx*density,ty*density);
    const minX=Math.max(0,Math.floor(Math.min(p.x,q.x,r.x))-1),minY=Math.max(0,Math.floor(Math.min(p.y,q.y,r.y))-1);
    const w=Math.min(1536-minX,Math.ceil(cellX)+3),h=Math.min(1024-minY,Math.ceil(cellY)+3);
    ctx!.drawImage(source,minX,minY,w,h,minX,minY,w,h);ctx!.restore();
  }
  function draw() {
    if(!available) return;
    const renderStarted=performance.now();
    const t=reduced?0:time,lx=reduced?0:lookX,ly=reduced?0:lookY;
    const blink=reduced?0:Math.max(pulse(6.3,4.7,.26),pulse(17.1,9.1,.24),pulse(17.1,8.72,.20));
    paint!.clearRect(0,0,1536,1024);paint!.drawImage(open,0,0,1536,1024);
    const gazeX=lx*2.3+Math.sin(t*.37)*1.4,gazeY=ly*1.5;
    if(blink<.4)for(const [x,y] of [[1129,301],[1319,294]]){
      paint!.save();paint!.beginPath();paint!.ellipse(x,y,17,18,0,0,Math.PI*2);paint!.clip();
      paint!.drawImage(open,gazeX,gazeY,1536,1024);paint!.restore();
    }
    if(blink>0){
      paint!.save();paint!.beginPath();
      for(const [x,y] of [[1129,301],[1319,294]]){paint!.moveTo(x+58,y);paint!.ellipse(x,y,58,40,0,0,Math.PI*2);}
      paint!.clip();paint!.globalAlpha=blink;paint!.drawImage(closed,0,0,1536,1024);paint!.restore();
    }
    const breath=Math.sin(t*1.46),turn=Math.sin(t*.43)*.042+Math.sin(t*.79)*.012+lx*.018;
    const ct=Math.cos(turn),st=Math.sin(turn),yaw=1+Math.sin(t*.39)*.055;
    const headX=Math.sin(t*.54)*13+lx*8,headY=Math.sin(t*.63)*7+ly*5;
    const earL=reduced?0:pulse(8.9,4.1,.55)*.14,earR=reduced?0:-pulse(11.3,7.3,.7)*.12;
    const cl=Math.cos(earL),sl=Math.sin(earL),cr=Math.cos(earR),sr=Math.sin(earR);
    points.forEach((p,i)=>{
      let x=p.x+(p.x-1260)*breath*.027*p.chest,y=p.y-breath*6*p.chest;
      const dx=x-1250,dy=y-635;
      const movedX=1250+(ct*dx-st*dy)*yaw+headX,movedY=635+st*dx+ct*dy+headY;
      x+=(movedX-x)*p.head;y+=(movedY-y)*p.head;
      let ex=x-1107,ey=y-264;
      x+=(1107+cl*ex-sl*ey-x)*p.l;y+=(264+sl*ex+cl*ey-y)*p.l;
      ex=x-1390;ey=y-249;
      x+=(1390+cr*ex-sr*ey-x)*p.r;y+=(249+sr*ex+cr*ey-y)*p.r;
      positions[i*2]=x*scale+offsetX;positions[i*2+1]=y*scale+offsetY;
    });
    ctx!.setTransform(1,0,0,1,0,0);ctx!.clearRect(0,0,canvas.width,canvas.height);ctx!.setTransform(density,0,0,density,0,0);
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const i=y*(cols+1)+x;triangle(i,i+1,i+cols+1);triangle(i+1,i+cols+2,i+cols+1);
    }
    if(time-lastStatus>.25){scene.dataset.leopardPose=t.toFixed(2);scene.dataset.leopardBlinkValue=blink.toFixed(2);scene.dataset.leopardRenderMs=(performance.now()-renderStarted).toFixed(1);lastStatus=time;}
  }
  function resize() {
    if(!available) return;
    const width=Math.max(1,scene.clientWidth),height=Math.max(1,scene.clientHeight);
    density=Math.min(window.devicePixelRatio||1,1.15,1500/width,1200/height);
    canvas.width=Math.max(1,Math.round(width*density));canvas.height=Math.max(1,Math.round(height*density));
    if(small.matches){
      const cover=Math.max(width/1024,height/1536),phone=window.matchMedia('(max-width: 760px)').matches;
      scale=.70*cover;offsetX=(width-1024*cover)*(phone?1:.5)-95*cover;offsetY=(height-1536*cover)*(phone?.5:.2)+735*cover;
    }else{
      const cover=Math.max(width/1536,height/1024);scale=.90*cover;offsetX=(width-1536*cover)*.5+195*cover;offsetY=(height-1024*cover)*.2+41*cover;
    }
    draw();
  }
  function tick(now:number){
    frame=0;if(!active||reduced||!available) return;
    if(!last){last=now;lastDraw=now;}
    const elapsed=Math.min((now-last)/1000,.064);time+=elapsed;last=now;
    const easing=1-Math.exp(-elapsed*3);lookX+=(targetX-lookX)*easing;lookY+=(targetY-lookY)*easing;
    const interval=1000/(small.matches?20:24);
    if(now-lastDraw>=interval){draw();lastDraw=now-(now-lastDraw)%interval;}
    frame=requestAnimationFrame(tick);
  }
  function sync(){
    cancelAnimationFrame(frame);frame=0;last=0;if(!available) return;
    scene.dataset.leopardMotion=reduced?'reduced':active?'running':'paused';draw();
    scene.dataset.leopardPose=(reduced?0:time).toFixed(2);
    if(active&&!reduced)frame=requestAnimationFrame(tick);
  }
  const ready=(async()=>{
    try{
      [open,closed]=await Promise.all([
        load(small.matches?scene.dataset.leopardOpenSmall:scene.dataset.leopardOpen),
        load(small.matches?scene.dataset.leopardBlinkSmall:scene.dataset.leopardBlink),background.decode()
      ]);
      available=true;resize();sync();scene.classList.add('leopard-ready');
      new ResizeObserver(resize).observe(scene);
    }catch{scene.dataset.leopardMotion='fallback';}
  })();
  return {ready,setActive(value,reduce){if(active===value&&reduced===reduce)return;active=value;reduced=reduce;sync();},setLook(x,y){targetX=Math.max(-1,Math.min(1,x));targetY=Math.max(-1,Math.min(1,y));}};
}
