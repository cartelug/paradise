"""Build the revised Pardus concept note from the website's clearly labelled sample offer data."""
from pathlib import Path
from io import BytesIO
import json, re, subprocess
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image
import xml.sax.saxutils as xml
project = Path(__file__).resolve().parents[1]
node = """import{readFileSync}from'node:fs';import vm from'node:vm';const s=readFileSync('src/data/offers.ts','utf8');const b=s.match(/export const offers: EscapeOffer\\[\\] = (\\[[\\s\\S]*?\\n\\]);/)[1];console.log(JSON.stringify(vm.runInNewContext('('+b+')')));"""
offers = json.loads(subprocess.check_output(['node','--input-type=module','-e',node],cwd=project))
output = project/'public/documents/PARDUS_Luxury_Escapes_Concept_Note.pdf'
output.parent.mkdir(parents=True,exist_ok=True)
for name,file in [('PardusSans','DejaVuSans.ttf'),('PardusSerif','DejaVuSerif.ttf')]:
    pdfmetrics.registerFont(TTFont(name, '/usr/share/fonts/truetype/dejavu/'+file))
W,H=A4; navy='#071426'; gold='#d7ba7d'; ink='#071426'; muted='#5b6574'
c=canvas.Canvas(str(output),pagesize=A4)
c.setTitle('Pardus Luxury Escapes - Revised Concept Note')
c.setAuthor('Pardus Luxury Escapes / 97 Design')
def text(value,x,top,width=510,size=11,color=ink,font='PardusSans',leading=None):
    p=Paragraph(value,ParagraphStyle('p',fontName=font,fontSize=size,leading=leading or size*1.42,textColor=HexColor(color)))
    _,h=p.wrap(width,1000); p.drawOn(c,x,top-h); return top-h
def photo(file,x,y,w,h):
    im=Image.open(file).convert('RGB'); im.thumbnail((1600,1600))
    iw,ih=im.size; scale=max(w/iw,h/ih)
    encoded=BytesIO(); im.save(encoded,format='JPEG',quality=85,optimize=True); encoded.seek(0)
    dw,dh=iw*scale,ih*scale
    c.saveState(); c.rect(x,y,w,h,stroke=0,fill=0); clip=c.beginPath();clip.rect(x,y,w,h);c.clipPath(clip,stroke=0,fill=0)
    c.drawImage(ImageReader(encoded),x-(dw-w)/2,y-(dh-h)/2,width=dw,height=dh);c.restoreState()
def rule(y,color='#d6dce4'):
    c.setStrokeColor(HexColor(color));c.setLineWidth(.6);c.line(42,y,W-42,y)
def footer(number,dark=False):
    color='#cad2df' if dark else muted
    rule(42,'#344052' if dark else '#d6dce4')
    text('PARDUS LUXURY ESCAPES  /  OCTOBER 2026',42,31,430,8,color)
    text(f'{number:02}',W-65,32,30,8,color)
def header(label,title):
    text(label.upper(),42,H-36,510,9,gold if False else '#806025')
    text(title,42,H-61,510,30,ink,'PardusSerif',35)
def price(o):
    return 'USD quote on request' if o['fromUSD'] is None else 'From USD {:,.0f} · illustrative sample'.format(o['fromUSD'])
# 01 - brand and proposition
c.setFillColor(HexColor(navy));c.rect(0,0,W,H,fill=1,stroke=0)
c.drawImage(str(project/'public/brand/pardus-light-2048.png'),42,H-113,width=200,height=81,mask='auto')
text('LUXURY TRAVEL, BEAUTIFULLY ARRANGED.',42,H-138,510,9,gold)
text('Your next escape.<br/>Beautifully arranged.',42,H-173,510,39,'#ffffff','PardusSerif',47)
photo(project/'public/images/island-cinematic-1920.webp',0,260,W,305)
text('You tell us where you want to go. We arrange the flights,<br/>stays, transfers and experiences around you.',42,231,510,13,'#edf1f5',leading=20)
text('MALDIVES  /  SEYCHELLES  /  DUBAI  /  SAFARIS  /  PRIVATE CRUISES',42,148,510,9,gold)
text('Sample escape prices in USD. Your final itinerary, availability<br/>and price are confirmed for your dates before you book.',42,118,510,11,'#cad2df')
footer(1,True);c.showPage()
# 02 - two flagship islands
header('The signature escapes','Maldives & Seychelles')
text('Sample prices per person, two sharing. Flights, visas and insurance are extra.',42,725,511,9,muted)
for o,top in zip(offers[:2],[699,381]):
    photo(project/f'public/images/{o["slug"]}-1280.webp',42,top-128,511,128)
    text(o['label'],42,top-144,350,25,ink,'PardusSerif',30)
    text(o['nights'].upper(),398,top-148,155,9,'#806025')
    text(price(o),42,top-184,511,13,'#806025')
    bottom=text(xml.escape(o['experience']),42,top-213,511,12,muted,leading=17)
    text('SAMPLE INCLUDES: '+xml.escape(' / '.join(o['inclusions'])),42,bottom-12,511,9,ink,leading=14)
    text('Request your dates, resort choice, transfers and private experiences in one clear proposal.',42,top-285,511,9,muted)
footer(2);c.showPage()
# 03 - other destinations, direct product cards
header('More ways to escape','City, safari, coast & culture')
text('Sample prices per person, two sharing. Flights, visas and insurance are extra.',42,725,511,9,muted)
for o,(x,top) in zip(offers[2:],[(42,699),(309,699),(42,382),(309,382)]):
    photo(project/f'public/images/{o["slug"]}-1280.webp',x,top-115,244,115)
    text(o['label'],x,top-131,244,22,ink,'PardusSerif',27)
    text(o['nights'].upper(),x,top-166,244,9,'#806025')
    text(price(o),x,top-188,244,11,'#806025')
    bottom=text(xml.escape(o['experience']),x,top-215,244,11,muted,leading=16)
    text('SAMPLE INCLUDES: '+xml.escape(' / '.join(o['inclusions'])),x,bottom-10,244,9,muted,leading=13)
footer(3);c.showPage()
# 04 - cruises, services and enquiry
header('Private boat & yacht experiences','Beautiful days on the water.')
photo(project/'public/images/yacht-sunset-1280.webp',42,524,511,175)
text('ILLUSTRATIVE PRIVATE CRUISE PRICES',42,507,511,9,'#806025')
for title,amount,basis,x,top in [
    ('Dubai yacht cruises',450,'Per yacht · 3 hours · up to 6 guests',42,486),
    ('Sunset & romantic cruises',280,'Per boat · 2 hours · 2 guests',309,486),
    ('Island excursions',650,'Per boat · 4 hours · up to 4 guests',42,444),
    ('Private celebrations',1200,'Per charter · 4 hours · up to 10 guests',309,444)]:
    text(xml.escape(title)+' — USD {:,}'.format(amount),x,top,244,10,ink)
    text(basis,x,top-17,244,8,muted)
text('Sample prices, not live offers. Boat, route, inclusions and final price are confirmed for your date.',42,408,511,8,muted)
rule(390)
text('YOU CHOOSE WHERE. WE ARRANGE THE REST.',42,372,511,10,'#806025')
services=['Flights','Luxury hotels & resorts','Private transfers','Visa guidance','Boat & yacht cruises','Safaris','Honeymoons','Family holidays','Group travel','Corporate travel','Private tours','Activities & experiences','Custom itineraries']
for i,service in enumerate(services):
    column=i%3; row=i//3
    text(xml.escape(service),42+column*176,344-row*24,164,10,ink)
rule(210)
text('Tell us where. We’ll take it from here.',42,191,511,23,ink,'PardusSerif',29)
text('Share your destination, dates, travellers and budget. Review a clear itinerary<br/>and USD proposal. Confirm when the arrangements feel right.',42,150,511,11,muted)
text('bookings@pardusescapes.com',42,100,511,12,'#806025')
c.linkURL('mailto:bookings@pardusescapes.com',(42,76,365,104),relative=0)
text('Suggested stays are flexible. Inclusions, prices and supplier terms are confirmed in writing.',42,71,511,8,muted)
footer(4);c.save()
print(output)
