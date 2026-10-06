import {createCanvasLeopard} from './leopard-canvas';

/** PARDUS's photographic leopard: a GPU mesh, independent of the scenery and copy. */
export interface LeopardMotion {
  ready: Promise<void>;
  setActive(active:boolean, reduced:boolean):void;
  setLook(x:number,y:number):void;
}

const vertexSource = `
precision highp float;
attribute vec2 a_uv;
varying vec2 v_uv;
uniform vec2 u_view;
uniform vec4 u_layout;
uniform float u_time;
uniform vec2 u_look;
uniform vec2 u_ears;

vec2 rotateAround(vec2 p, vec2 centre, float angle) {
  float c = cos(angle), s = sin(angle);
  vec2 d = p - centre;
  return centre + vec2(c*d.x-s*d.y, s*d.x+c*d.y);
}
void main() {
  v_uv = a_uv;
  vec2 p = a_uv * vec2(1536.0,1024.0);
  float breath = sin(u_time*1.46);
  float chest = exp(-pow((a_uv.y-.73)/.22,2.0)) * smoothstep(.52,.76,a_uv.x);
  p.x += (p.x-1260.0) * breath * .027 * chest;
  p.y -= breath * 6.0 * chest;

  // The head turns around the neck, while the lower body and paw stay anchored.
  float head = 1.0-smoothstep(.47,.72,a_uv.y);
  float turn = sin(u_time*.43)*.042 + sin(u_time*.79)*.012 + u_look.x*.018;
  vec2 moved = rotateAround(p,vec2(1250.0,635.0),turn);
  moved.x = 1250.0 + (moved.x-1250.0)*(1.0+sin(u_time*.39)*.055);
  moved += vec2(sin(u_time*.54)*13.0+u_look.x*8.0, sin(u_time*.63)*7.0+u_look.y*5.0);
  p = mix(p,moved,head);

  // Local ear weights preserve the forehead and the rest of the face.
  float left = 1.0-smoothstep(.35,1.0,length((a_uv-vec2(.679,.171))/vec2(.090,.113)));
  float right = 1.0-smoothstep(.35,1.0,length((a_uv-vec2(.931,.157))/vec2(.081,.106)));
  p = mix(p,rotateAround(p,vec2(1107.0,264.0),u_ears.x),left);
  p = mix(p,rotateAround(p,vec2(1390.0,249.0),u_ears.y),right);
  vec2 screen = p*u_layout.xy+u_layout.zw;
  gl_Position = vec4(screen.x/u_view.x*2.0-1.0,1.0-screen.y/u_view.y*2.0,0.0,1.0);
}`;

const fragmentSource = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_open;
uniform sampler2D u_closed;
uniform float u_blink;
uniform vec2 u_gaze;

float ellipse(vec2 p, vec2 centre, vec2 radius) {
  return 1.0-smoothstep(.62,1.0,length((p-centre)/radius));
}
void main() {
  vec2 left = vec2(.735,.294), right = vec2(.859,.287);
  float iris = max(ellipse(v_uv,left,vec2(.013,.022)),ellipse(v_uv,right,vec2(.013,.022)));
  vec4 openEye = texture2D(u_open,v_uv-u_gaze*iris*(1.0-u_blink));
  vec4 closedEye = texture2D(u_closed,v_uv);
  float eyelids = max(ellipse(v_uv,left,vec2(.043,.045)),ellipse(v_uv,right,vec2(.043,.045)));
  gl_FragColor = mix(openEye,closedEye,u_blink*eyelids);
}`;

const clamp = (v:number, min:number, max:number) => Math.min(max,Math.max(min,v));
const pulse = (time:number, period:number, offset:number, duration:number) => {
  const phase = (time+offset)%period;
  return phase < duration ? Math.sin(phase/duration*Math.PI) : 0;
};

export function createLeopardMotion(scene:HTMLElement|null):LeopardMotion|null {
  if (!scene) return null;
  const canvas = scene.querySelector<HTMLCanvasElement>('[data-leopard-canvas]');
  const background = scene.querySelector<HTMLImageElement>('[data-leopard-background]');
  if (!canvas || !background) return null;
  let gl:WebGLRenderingContext|null=null;
  try { gl = canvas.getContext('webgl',{alpha:true, antialias:false, depth:false, stencil:false, powerPreference:'low-power'}); }
  catch { /* Some browsers block GPU contexts; the 2D renderer can still work. */ }
  if (!gl) return createCanvasLeopard(scene,canvas,background);
  scene.dataset.leopardRenderer='webgl';

  let frame=0, available=false, active=false, reduced=false, time=0, last=0, lastDraw=0;
  let lookX=0,lookY=0,targetX=0,targetY=0, lastStatus=0, resizeObserver:ResizeObserver|undefined;
  let program:WebGLProgram|null=null;
  const uniforms:Record<string,WebGLUniformLocation|null>={};
  let width=1,height=1;
  const small = window.matchMedia('(max-width: 900px)');
  const shaders:WebGLShader[]=[], buffers:WebGLBuffer[]=[], textures:WebGLTexture[]=[];
  scene.dataset.leopardMotion='loading';

  function fallback() {
    available=false;
    cancelAnimationFrame(frame); frame=0;
    scene!.classList.remove('leopard-ready');
    scene!.dataset.leopardMotion='fallback';
    resizeObserver?.disconnect();
    for(const resource of shaders) gl!.deleteShader(resource);
    for(const resource of buffers) gl!.deleteBuffer(resource);
    for(const resource of textures) gl!.deleteTexture(resource);
    if(program) gl!.deleteProgram(program);
    shaders.length=0;buffers.length=0;textures.length=0;program=null;
  }
  function shader(type:number,source:string) {
    const result=gl!.createShader(type);
    if(!result) throw new Error('No shader');
    shaders.push(result); gl!.shaderSource(result,source); gl!.compileShader(result);
    if(!gl!.getShaderParameter(result,gl!.COMPILE_STATUS)) throw new Error('Leopard shader unavailable');
    return result;
  }
  function image(url:string|undefined):Promise<HTMLImageElement> {
    return new Promise((resolve,reject)=>{
      if(!url){reject(new Error('Missing artwork'));return;}
      const img=new Image(); img.decoding='async';
      img.onload=()=>resolve(img); img.onerror=()=>reject(new Error('Artwork unavailable')); img.src=url;
    });
  }
  function texture(img:HTMLImageElement,unit:number,name:string) {
    const texture=gl!.createTexture(); if(!texture) throw new Error('No texture');
    textures.push(texture); gl!.activeTexture(gl!.TEXTURE0+unit); gl!.bindTexture(gl!.TEXTURE_2D,texture);
    gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_MIN_FILTER,gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_MAG_FILTER,gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_WRAP_S,gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D,gl!.TEXTURE_WRAP_T,gl!.CLAMP_TO_EDGE);
    gl!.texImage2D(gl!.TEXTURE_2D,0,gl!.RGBA,gl!.RGBA,gl!.UNSIGNED_BYTE,img);
    gl!.uniform1i(uniforms[name],unit);
  }
  function resize() {
    if(!available) return;
    width=Math.max(1,scene!.clientWidth); height=Math.max(1,scene!.clientHeight);
    // Keep the raster buffer bounded on high-density phones; the source stays sharp.
    const density=Math.min(window.devicePixelRatio||1,small.matches?1.5:1.25,1800/width,1500/height);
    canvas!.width=Math.max(1,Math.round(width*density)); canvas!.height=Math.max(1,Math.round(height*density));
    gl!.viewport(0,0,canvas!.width,canvas!.height);
    gl!.uniform2f(uniforms.u_view,width,height);
    let scale:number, x:number, y:number;
    if(small.matches){
      scale=Math.max(width/1024,height/1536);
      const phone=window.matchMedia('(max-width: 760px)').matches;
      x=(width-1024*scale)*(phone?1:.5); y=(height-1536*scale)*(phone?.5:.2);
      gl!.uniform4f(uniforms.u_layout,.70*scale,.70*scale,x-95*scale,y+735*scale);
    }else{
      scale=Math.max(width/1536,height/1024);
      x=(width-1536*scale)*.5; y=(height-1024*scale)*.2;
      gl!.uniform4f(uniforms.u_layout,.90*scale,.90*scale,x+195*scale,y+41*scale);
    }
    draw();
  }
  function draw() {
    if(!available) return;
    const motionTime=reduced?0:time;
    const blink=reduced?0:Math.max(pulse(time,6.3,4.7,.26),pulse(time,17.1,9.1,.24),pulse(time,17.1,8.72,.20));
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.uniform1f(uniforms.u_time,motionTime);
    gl!.uniform2f(uniforms.u_look,reduced?0:lookX,reduced?0:lookY);
    gl!.uniform2f(uniforms.u_gaze,reduced?0:(lookX*2.3+Math.sin(time*.37)*1.4)/1536,reduced?0:lookY*1.5/1024);
    gl!.uniform2f(uniforms.u_ears,reduced?0:pulse(time,8.9,4.1,.55)*.14,reduced?0:-pulse(time,11.3,7.3,.7)*.12);
    gl!.uniform1f(uniforms.u_blink,blink);
    gl!.drawElements(gl!.TRIANGLES,64*40*6,gl!.UNSIGNED_SHORT,0);
    if(time-lastStatus>.25){
      scene!.dataset.leopardPose=motionTime.toFixed(2);
      scene!.dataset.leopardBlinkValue=blink.toFixed(2);
      lastStatus=time;
    }
  }
  function tick(now:number) {
    frame=0;
    if(!active || reduced || !available) return;
    if(!last){last=now;lastDraw=now;}
    const elapsed=Math.min((now-last)/1000,.064); last=now; time+=elapsed;
    const easing=1-Math.exp(-elapsed*3);
    lookX+=(targetX-lookX)*easing; lookY+=(targetY-lookY)*easing;
    const interval=1000/30;
    if(now-lastDraw>=interval){draw();lastDraw=now-(now-lastDraw)%interval;}
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame=0; last=0;
    if(!available) return;
    scene!.dataset.leopardMotion=reduced?'reduced':active?'running':'paused';
    scene!.dataset.leopardPose=(reduced?0:time).toFixed(2);
    draw();
    if(active && !reduced) frame=requestAnimationFrame(tick);
  }
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});
  const ready=(async()=>{
    try{
      program=gl.createProgram(); if(!program) throw new Error('No program');
      gl.attachShader(program,shader(gl.VERTEX_SHADER,vertexSource));
      gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragmentSource));
      gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Leopard program unavailable');
      gl.useProgram(program);
      for(const name of ['u_view','u_layout','u_time','u_look','u_ears','u_open','u_closed','u_blink','u_gaze']) uniforms[name]=gl.getUniformLocation(program,name);
      const points:number[]=[],indices:number[]=[];
      for(let y=0;y<=40;y++)for(let x=0;x<=64;x++)points.push(x/64,y/40);
      for(let y=0;y<40;y++)for(let x=0;x<64;x++){
        const i=y*65+x; indices.push(i,i+1,i+65,i+1,i+66,i+65);
      }
      const vertices=gl.createBuffer(), elements=gl.createBuffer();
      if(!vertices||!elements) throw new Error('No mesh');
      buffers.push(vertices,elements); gl.bindBuffer(gl.ARRAY_BUFFER,vertices); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);
      const attribute=gl.getAttribLocation(program,'a_uv'); gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,elements); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
      gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0,0,0,0);
      const [open,closed]=await Promise.all([
        image(small.matches?scene.dataset.leopardOpenSmall:scene.dataset.leopardOpen),
        image(small.matches?scene.dataset.leopardBlinkSmall:scene.dataset.leopardBlink),
        background.decode()
      ]);
      if(gl.isContextLost()) throw new Error('Context lost');
      texture(open,0,'u_open'); texture(closed,1,'u_closed');
      available=true; resize(); sync();
      scene.classList.add('leopard-ready');
      resizeObserver=new ResizeObserver(resize); resizeObserver.observe(scene);
    }catch{fallback();}
  })();
  return {ready,setActive(value,reduce){if(active===value&&reduced===reduce)return;active=value;reduced=reduce;sync();},setLook(x,y){targetX=clamp(x,-1,1);targetY=clamp(y,-1,1);}};
}
