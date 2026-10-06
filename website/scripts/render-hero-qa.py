"""Render the shipped GLSL with Mesa/EGL. This does not test browser layout.

python scripts/render-hero-qa.py --output /absolute/scratch/path [--video]
Requires Linux EGL/OpenGL ES and Pillow; optional video uses ffmpeg.
"""
import argparse, ctypes as C, json, math, re, subprocess
from pathlib import Path
from PIL import Image

parser=argparse.ArgumentParser()
parser.add_argument('--output',type=Path,required=True)
parser.add_argument('--video',action='store_true')
args=parser.parse_args();args.output.mkdir(parents=True,exist_ok=True)
root=Path(__file__).resolve().parents[1]
source=(root/'src/scripts/hero-film.ts').read_text();tick=chr(96)
shaders={key:re.search('const '+key+' = '+tick+'([\\s\\S]*?)'+tick+';',source).group(1) for key in ['vertex','fragment']}
profiles={}
for name in ['desktop','portrait']:
    block=re.search(r'const '+name+r': Profile = \{([\s\S]*?)\n\};',source).group(1)
    profiles[name]={k:[float(x) for x in v.split(',')] for k,v in re.findall(r'(\w+):\s*\[([^\]]+)\]',block)}
E=C.CDLL('libEGL.so.1')
def egl(name,result,types):
    fn=getattr(E,name);fn.restype=result;fn.argtypes=types;return fn
U,I,F,V=C.c_uint,C.c_int,C.c_float,C.c_void_p
proc=egl('eglGetProcAddress',V,[C.c_char_p])
platform=C.CFUNCTYPE(V,U,V,V)(proc(b'eglGetPlatformDisplayEXT'))
display=platform(0x31DD,None,None);major=I();minor=I()
assert egl('eglInitialize',U,[V,C.POINTER(I),C.POINTER(I)])(display,C.byref(major),C.byref(minor))
assert egl('eglBindAPI',U,[U])(0x30A0)
config=V();count=I();attributes=(I*13)(0x3033,1,0x3040,4,0x3024,8,0x3023,8,0x3022,8,0x3021,8,0x3038)
assert egl('eglChooseConfig',U,[V,C.POINTER(I),C.POINTER(V),I,C.POINTER(I)])(display,attributes,C.byref(config),1,C.byref(count)) and count.value
context=egl('eglCreateContext',V,[V,V,V,C.POINTER(I)])(display,config,None,(I*3)(0x3098,2,0x3038));assert context
current=egl('eglMakeCurrent',U,[V,V,V,V])
specs={
 'glCreateShader':(U,[U]),'glShaderSource':(None,[U,I,C.POINTER(C.c_char_p),C.POINTER(I)]),
 'glCompileShader':(None,[U]),'glGetShaderiv':(None,[U,U,C.POINTER(I)]),'glGetShaderInfoLog':(None,[U,I,C.POINTER(I),C.c_char_p]),
 'glCreateProgram':(U,[]),'glAttachShader':(None,[U,U]),'glLinkProgram':(None,[U]),'glGetProgramiv':(None,[U,U,C.POINTER(I)]),
 'glGetProgramInfoLog':(None,[U,I,C.POINTER(I),C.c_char_p]),'glUseProgram':(None,[U]),
 'glGenBuffers':(None,[I,C.POINTER(U)]),'glBindBuffer':(None,[U,U]),'glBufferData':(None,[U,C.c_ssize_t,V,U]),
 'glGetAttribLocation':(I,[U,C.c_char_p]),'glEnableVertexAttribArray':(None,[U]),'glVertexAttribPointer':(None,[U,I,U,C.c_ubyte,I,V]),
 'glGenTextures':(None,[I,C.POINTER(U)]),'glActiveTexture':(None,[U]),'glBindTexture':(None,[U,U]),
 'glTexParameteri':(None,[U,U,I]),'glTexImage2D':(None,[U,I,I,I,I,I,U,U,V]),
 'glViewport':(None,[I,I,I,I]),'glGetUniformLocation':(I,[U,C.c_char_p]),
 'glUniform1i':(None,[I,I]),'glUniform1f':(None,[I,F]),'glUniform2f':(None,[I,F,F]),'glUniform4f':(None,[I,F,F,F,F]),
 'glDrawArrays':(None,[U,I,I]),'glFinish':(None,[]),'glReadPixels':(None,[I,I,I,I,U,U,V]),
 'glGetError':(U,[]),'glGetString':(C.c_char_p,[U]),
}
G={name:C.CFUNCTYPE(result,*types)(proc(name.encode())) for name,(result,types) in specs.items()}
surface=egl('eglCreatePbufferSurface',V,[V,V,C.POINTER(I)])
destroy=egl('eglDestroySurface',U,[V,V])
def compile_shader(kind,text):
    shader=G['glCreateShader'](kind);value=C.c_char_p(text.encode())
    G['glShaderSource'](shader,1,C.byref(value),None);G['glCompileShader'](shader);ok=I();G['glGetShaderiv'](shader,0x8B81,C.byref(ok))
    if not ok.value:
        log=C.create_string_buffer(8192);G['glGetShaderInfoLog'](shader,8192,None,log);raise RuntimeError(log.value.decode())
    return shader
def setup():
    program=G['glCreateProgram']()
    for kind,name in [(0x8B31,'vertex'),(0x8B30,'fragment')]:G['glAttachShader'](program,compile_shader(kind,shaders[name]))
    G['glLinkProgram'](program);ok=I();G['glGetProgramiv'](program,0x8B82,C.byref(ok))
    if not ok.value:
        log=C.create_string_buffer(8192);G['glGetProgramInfoLog'](program,8192,None,log);raise RuntimeError(log.value.decode())
    G['glUseProgram'](program);buffer=U();G['glGenBuffers'](1,C.byref(buffer));G['glBindBuffer'](0x8892,buffer)
    vertices=(F*8)(-1,1,-1,-1,1,1,1,-1);G['glBufferData'](0x8892,C.sizeof(vertices),vertices,0x88E4)
    attribute=G['glGetAttribLocation'](program,b'a_position');G['glEnableVertexAttribArray'](attribute);G['glVertexAttribPointer'](attribute,2,0x1406,0,0,None)
    return program
program=None
def location(name):return G['glGetUniformLocation'](program,name.encode())
def uniform(name,value):
    if isinstance(value,list):G['glUniform'+str(len(value))+'f'](location(name),*value)
    else:G['glUniform1f'](location(name),value)
def pulse(t,period,offset,duration):
    p=(t+offset)%period;return math.sin(math.pi*p/duration)**2 if p<duration else 0
reports=[]
def scene(name,width,height,video=False):
    global program
    target=surface(display,config,(I*5)(0x3057,width,0x3056,height,0x3038));assert target;assert current(display,target,target,context)
    if program is None:program=setup()
    G['glUseProgram'](program);G['glViewport'](0,0,width,height)
    photos=[Image.open(root/'source-assets/v27'/('hero-'+name+suffix+'.png')).convert('RGBA') for suffix in ['', '-blink']]
    sw,sh=photos[0].size;textures=(U*2)();G['glGenTextures'](2,textures)
    for unit,image in enumerate(photos):
        G['glActiveTexture'](0x84C0+unit);G['glBindTexture'](0x0DE1,textures[unit])
        for key,value in [(0x2801,0x2601),(0x2800,0x2601),(0x2802,0x812F),(0x2803,0x812F)]:G['glTexParameteri'](0x0DE1,key,value)
        pixels=C.create_string_buffer(image.tobytes());G['glTexImage2D'](0x0DE1,0,0x1908,image.width,image.height,0,0x1908,0x1401,pixels)
        G['glUniform1i'](location('u_open' if unit==0 else 'u_closed'),unit)
    scale=max(width/sw,height/sh);px,py=(.83,.5) if name=='mobile' else (.85,.3)
    crop=[(sw-width/scale)*px/sw,(sh-height/scale)*py/sh,width/scale/sw,height/scale/sh]
    uniform('u_crop',crop);uniform('u_texel',[1/sw,1/sh]);uniform('u_aspect',sw/sh);uniform('u_look',[0,0])
    for key,value in profiles['portrait' if name=='mobile' else 'desktop'].items():uniform('u_'+key,value)
    data=(C.c_ubyte*(width*height*4))()
    def frame(t):
        uniform('u_time',t);uniform('u_blink',max(pulse(t,7.7,5.9,.30),pulse(t,19.3,11.1,.25),pulse(t,19.3,10.69,.21)))
        uniform('u_ears',[pulse(t,13.1,7.4,.6)*.018,-pulse(t,17.3,4.7,.65)*.016])
        G['glDrawArrays'](0x0005,0,4);G['glFinish']();G['glReadPixels'](0,0,width,height,0x1908,0x1401,data);assert G['glGetError']()==0
        image=Image.frombytes('RGBA',(width,height),bytes(data)).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        assert image.getchannel('A').getextrema()==(255,255),'Frame must remain completely opaque'
        return image
    for t in [0,1.95,7.5]:frame(t).convert('RGB').save(args.output/(name+'-'+str(t)+'.png'))
    if video:
        encoder=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pixel_format','rgba','-video_size',str(width)+'x'+str(height),'-framerate','24','-i','pipe:0','-c:v','libx264','-crf','20','-preset','fast','-pix_fmt','yuv420p','-movflags','+faststart',str(args.output/'PARDUS_V27_Motion_Preview.mp4')],stdin=subprocess.PIPE)
        for i in range(288):encoder.stdin.write(frame(i/24).tobytes())
        encoder.stdin.close();assert encoder.wait()==0
    reports.append({'scene':name,'viewport':[width,height],'renderer':G['glGetString'](0x1F01).decode(),'version':G['glGetString'](0x1F02).decode(),'shader_compile':'passed','opacity':'255 throughout','frames':[0,1.95,7.5]})
    current(display,None,None,None);destroy(display,target)
scene('desktop',960,540,args.video);scene('mobile',375,1000)
(args.output/'render-report.json').write_text(json.dumps(reports,indent=2)+'\n');print(json.dumps(reports))
