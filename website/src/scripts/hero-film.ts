/** One continuous photograph: motion never separates the animal from its setting. */
export interface LeopardMotion {
  ready: Promise<void>;
  setActive(active: boolean, reduced: boolean): void;
  setLook(x: number, y: number): void;
}
type Area = [number, number, number, number];
type Profile = {head: Area; chest: Area; leftEye: Area; rightEye: Area; leftEar: Area; rightEar: Area; water: [number, number, number, number]};
const desktop: Profile = {
  head: [.801,.426,.111,.206], chest: [.870,.660,.105,.105],
  leftEye: [.754,.384,.023,.030], rightEye: [.832,.372,.023,.030],
  leftEar: [.727,.303,.038,.066], rightEar: [.875,.255,.034,.065], water: [.488,.704,.04,.64]
};
const portrait: Profile = {
  head: [.731,.615,.155,.108], chest: [.824,.758,.110,.057],
  leftEye: [.657,.597,.032,.021], rightEye: [.771,.592,.030,.021],
  leftEar: [.616,.549,.050,.039], rightEar: [.816,.525,.047,.043], water: [.637,.807,0,.46]
};
const vertex = `
attribute vec2 a_position;
varying vec2 v_uv;
void main(){gl_Position=vec4(a_position,0.,1.);v_uv=vec2((a_position.x+1.)*.5,(1.-a_position.y)*.5);}`;
const fragment = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_open, u_closed;
uniform vec4 u_crop, u_head, u_chest, u_leftEye, u_rightEye, u_leftEar, u_rightEar, u_water;
uniform vec2 u_texel, u_look, u_ears;
uniform float u_time, u_blink, u_aspect;
float area(vec2 p,vec4 a){return 1.-smoothstep(.42,1.,length((p-a.xy)/a.zw));}
vec2 turn(vec2 p,vec2 centre,float a){vec2 d=p-centre;d.x*=u_aspect;float c=cos(a),s=sin(a);d=vec2(c*d.x-s*d.y,s*d.x+c*d.y);d.x/=u_aspect;return centre+d;}
void main(){
  float zoom=1.+.018*(1.-cos(u_time*.16));
  vec2 q=(v_uv-.5)/zoom+.5;
  vec2 uv=u_crop.xy+q*u_crop.zw;
  // Sub-pixel camera response is applied to the whole scene, including contact shadows.
  uv-=u_look*u_texel*1.2;
  float head=area(uv,u_head),chest=area(uv,u_chest);
  float breath=sin(u_time*1.13);
  uv-=vec2(breath*3.8,breath*1.25)*u_texel*chest;
  vec2 moved=turn(uv,u_head.xy,sin(u_time*.29)*.012+u_look.x*.0025);
  uv=mix(uv,moved,head);
  uv=mix(uv,turn(uv,u_leftEar.xy,u_ears.x),area(uv,u_leftEar));
  uv=mix(uv,turn(uv,u_rightEar.xy,u_ears.y),area(uv,u_rightEar));
  float water=smoothstep(u_water.x,u_water.x+.035,uv.y)*(1.-smoothstep(u_water.y-.035,u_water.y,uv.y))*(1.-smoothstep(u_water.z,u_water.w,uv.x));
  float wave=sin(uv.y*310.+uv.x*44.-u_time*.82)*sin(uv.x*77.+u_time*.28);
  uv.x+=water*wave*u_texel.x*.72;
  uv.y+=water*sin(uv.x*133.+uv.y*95.-u_time*.58)*u_texel.y*.65;
  float eyes=max(area(uv,u_leftEye),area(uv,u_rightEye));
  vec4 leftIris=vec4(u_leftEye.xy,u_leftEye.zw*.37),rightIris=vec4(u_rightEye.xy,u_rightEye.zw*.37);
  float iris=max(area(uv,leftIris),area(uv,rightIris));
  vec3 color=texture2D(u_open,uv-u_look*u_texel*.6*iris*(1.-u_blink)).rgb;
  color=mix(color,texture2D(u_closed,uv).rgb,u_blink*eyes);
  color*=1.+water*wave*.013;
  // The complete frame is opaque. There is no animal matte or silhouette seam.
  gl_FragColor=vec4(color,1.);
}`;
const clamp = (v:number,a:number,b:number) => Math.min(b,Math.max(a,v));
export function createLeopardMotion(scene: HTMLElement|null): LeopardMotion|null {
  const canvas=scene?.querySelector<HTMLCanvasElement>('[data-leopard-canvas]');
  const photograph=scene?.querySelector<HTMLImageElement>('[data-leopard-background]');
  if(!scene||!canvas||!photograph)return null;
  let gl:WebGLRenderingContext|null=null,ctx:CanvasRenderingContext2D|null=null;
  try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});}catch{/* Try the photographic 2D fallback. */}
  if(!gl){try{ctx=canvas.getContext('2d',{alpha:false});}catch{/* HTML remains fully readable. */}}
  if(!gl&&!ctx){scene.dataset.leopardMotion='fallback';return null;}
  scene.dataset.leopardRenderer=gl?'webgl':'canvas';scene.dataset.leopardMotion='loading';
  const small=window.matchMedia('(max-width: 1100px)');
  let program:WebGLProgram|null=null, buffer:WebGLBuffer|null=null;
  const shaders:WebGLShader[]=[],textures:WebGLTexture[]=[],uniforms:Record<string,WebGLUniformLocation|null>={};
  let failed=false,available=false,active=false,reduced=false,frame=0,last=0,lastDraw=0,time=0;
  let width=1,height=1,density=1,crop:Area=[0,0,1,1],profile=desktop;
  let lookX=0,lookY=0,targetX=0,targetY=0,closed:HTMLImageElement,revision=0,lastStatus=-1;
  let observer:ResizeObserver|undefined;
  function fail(){
    failed=true;available=false;revision++;cancelAnimationFrame(frame);frame=0;
    scene!.classList.remove('leopard-ready');scene!.dataset.leopardMotion='fallback';observer?.disconnect();
    if(gl){for(const s of shaders)gl.deleteShader(s);for(const t of textures)gl.deleteTexture(t);if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);}
    shaders.length=0;textures.length=0;buffer=null;program=null;
  }
  function compile(type:number,source:string){
    const shader=gl!.createShader(type);if(!shader)throw Error('No shader');shaders.push(shader);
    gl!.shaderSource(shader,source);gl!.compileShader(shader);
    if(!gl!.getShaderParameter(shader,gl!.COMPILE_STATUS))throw Error('Shader unavailable');return shader;
  }
  function image(url:string|undefined):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{
    if(!url){reject(Error('Missing eyelid frame'));return;}const img=new Image();img.decoding='async';
    img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Image unavailable'));img.src=url;
  });}
  function upload(img:HTMLImageElement,unit:number){
    gl!.activeTexture(gl!.TEXTURE0+unit);gl!.bindTexture(gl!.TEXTURE_2D,textures[unit]);
    gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_MIN_FILTER,gl!.LINEAR);gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_MAG_FILTER,gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_WRAP_S,gl!.CLAMP_TO_EDGE);gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_WRAP_T,gl!.CLAMP_TO_EDGE);
    gl!.texImage2D(gl!.TEXTURE_2D,0,gl!.RGBA,gl!.RGBA,gl!.UNSIGNED_BYTE,img);
  }
  const pulse=(period:number,offset:number,duration:number)=>{
    const phase=(time+offset)%period;return phase<duration?Math.sin(Math.PI*phase/duration)**2:0;
  };
  function draw(){
    if(!available||failed)return;
    const t=reduced?0:time,lx=reduced?0:lookX,ly=reduced?0:lookY;
    const blink=reduced?0:Math.max(pulse(7.7,5.9,.30),pulse(19.3,11.1,.25),pulse(19.3,10.69,.21));
    if(gl){
      gl.uniform1f(uniforms.u_time,t);gl.uniform1f(uniforms.u_blink,blink);gl.uniform2f(uniforms.u_look,lx,ly);
      gl.uniform2f(uniforms.u_ears,reduced?0:pulse(13.1,7.4,.6)*.018,reduced?0:-pulse(17.3,4.7,.65)*.016);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }else if(ctx){
      const zoom=1+.018*(1-Math.cos(t*.16));
      const box:Area=[crop[0]+crop[2]*(1-1/zoom)*.5,crop[1]+crop[3]*(1-1/zoom)*.5,crop[2]/zoom,crop[3]/zoom];
      const w=photograph!.naturalWidth||1672,h=photograph!.naturalHeight||941;
      ctx.setTransform(density,0,0,density,0,0);ctx.globalAlpha=1;
      ctx.drawImage(photograph!,box[0]*w,box[1]*h,box[2]*w,box[3]*h,0,0,width,height);
      if(blink>0){
        ctx.save();ctx.beginPath();
        for(const eye of [profile.leftEye,profile.rightEye]){
          const x=(eye[0]-box[0])/box[2]*width,y=(eye[1]-box[1])/box[3]*height;
          const rx=eye[2]/box[2]*width,ry=eye[3]/box[3]*height;
          ctx.moveTo(x+rx,y);ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
        }
        ctx.clip();ctx.globalAlpha=blink;
        const cw=closed.naturalWidth||w,ch=closed.naturalHeight||h;
        ctx.drawImage(closed,box[0]*cw,box[1]*ch,box[2]*cw,box[3]*ch,0,0,width,height);ctx.restore();
      }
    }
    if(time-lastStatus>.2||reduced){scene!.dataset.leopardPose=t.toFixed(2);scene!.dataset.leopardBlinkValue=blink.toFixed(3);lastStatus=time;}
  }
  function resize(){
    if(!available||failed)return;
    width=Math.max(1,scene!.clientWidth);height=Math.max(1,scene!.clientHeight);
    density=Math.min(window.devicePixelRatio||1,gl?1.5:1.15,2400/width,1800/height);
    canvas!.width=Math.max(1,Math.round(width*density));canvas!.height=Math.max(1,Math.round(height*density));
    profile=small.matches?portrait:desktop;
    const sourceW=photograph!.naturalWidth||(small.matches?1024:1672),sourceH=photograph!.naturalHeight||(small.matches?1536:941);
    const scale=Math.max(width/sourceW,height/sourceH),positionX=small.matches?.83:.85,positionY=small.matches?.5:.3;
    crop=[(sourceW-width/scale)*positionX/sourceW,(sourceH-height/scale)*positionY/sourceH,width/scale/sourceW,height/scale/sourceH];
    if(gl){
      gl.viewport(0,0,canvas!.width,canvas!.height);gl.uniform4f(uniforms.u_crop,...crop);
      gl.uniform2f(uniforms.u_texel,1/sourceW,1/sourceH);gl.uniform1f(uniforms.u_aspect,sourceW/sourceH);
      for(const key of ['head','chest','leftEye','rightEye','leftEar','rightEar','water'] as const){
        const value=profile[key];gl.uniform4f(uniforms['u_'+key],value[0],value[1],value[2],value[3]);
      }
    }
    draw();
  }
  function tick(now:number){
    frame=0;if(!available||!active||reduced||failed)return;
    if(!last){last=now;lastDraw=now;}const elapsed=clamp((now-last)/1000,0,.064);last=now;time+=elapsed;
    const easing=1-Math.exp(-elapsed*2.5);lookX+=(targetX-lookX)*easing;lookY+=(targetY-lookY)*easing;
    const interval=1000/(gl?30:small.matches?20:24);
    if(now-lastDraw>=interval){draw();lastDraw=now-(now-lastDraw)%interval;}
    frame=requestAnimationFrame(tick);
  }
  function sync(){
    cancelAnimationFrame(frame);frame=0;last=0;if(!available||failed)return;
    scene!.dataset.leopardMotion=reduced?'reduced':active?'running':'paused';draw();
    if(active&&!reduced)frame=requestAnimationFrame(tick);
  }
  async function loadArtwork(){
    if(failed)return;const attempt=++revision;
    const url=small.matches?scene!.dataset.leopardBlinkPortrait:scene!.dataset.leopardBlink;
    try{
      const [,nextClosed]=await Promise.all([photograph!.decode(),image(url)]);
      if(failed||attempt!==revision)return;
      if(gl?.isContextLost())throw Error('Context lost');
      closed=nextClosed;if(gl){upload(photograph!,0);upload(closed,1);}
      available=true;resize();sync();scene!.classList.add('leopard-ready');
    }catch{if(attempt===revision)fail();}
  }
  const ready=(async()=>{
    try{
      if(gl){
        program=gl.createProgram();if(!program)throw Error('No program');
        gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
        if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('No program');gl.useProgram(program);
        for(const name of ['u_crop','u_head','u_chest','u_leftEye','u_rightEye','u_leftEar','u_rightEar','u_water','u_texel','u_look','u_ears','u_time','u_blink','u_aspect','u_open','u_closed'])uniforms[name]=gl.getUniformLocation(program,name);
        buffer=gl.createBuffer();if(!buffer)throw Error('No geometry');gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,1,-1,-1,1,1,1,-1]),gl.STATIC_DRAW);
        const attribute=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
        for(let unit=0;unit<2;unit++){const texture=gl.createTexture();if(!texture)throw Error('No texture');textures.push(texture);}
        gl.uniform1i(uniforms.u_open,0);gl.uniform1i(uniforms.u_closed,1);
        canvas!.addEventListener('webglcontextlost',event=>{event.preventDefault();fail();});
      }
      await loadArtwork();
      if(!failed){observer=new ResizeObserver(resize);observer.observe(scene);photograph.addEventListener('load',()=>{void loadArtwork();});}
    }catch{fail();}
  })();
  return {ready,setActive(value,reduce){if(active===value&&reduced===reduce)return;active=value;reduced=reduce;sync();},setLook(x,y){targetX=clamp(x,-1,1);targetY=clamp(y,-1,1);}};
}
