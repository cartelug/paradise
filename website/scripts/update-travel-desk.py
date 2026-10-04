#!/usr/bin/env python3
"""Refresh public travel headlines from the official Uganda CAA RSS feed."""
import datetime as dt
import email.utils
import json
import pathlib
import re
import urllib.request
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

project = pathlib.Path(__file__).resolve().parents[1]
target = project / 'public' / 'travel-updates.json'
now = dt.datetime.now(dt.timezone.utc)
previous = json.loads(target.read_text()) if target.exists() else {'items': [], 'updatedAt': None}
highlights = [
    {'id':'dubai-winter-2026','title':'Dubai’s winter events calendar','summary':'Explore seasonal entertainment, food and sporting events before choosing the dates for your Dubai escape.','source':'Visit Dubai','category':'Dubai','url':'https://www.visitdubai.com/articles/events-to-look-forward-to-this-season','publishedAt':'2026-09-16','checkedAt':'2026-10-04','expiresAt':'2027-01-15'},
    {'id':'emirates-dubai-winter-2026','title':'Emirates announces Dubai winter attraction offers','summary':'Check the airline’s eligible ticket dates, departure markets and full conditions before planning around the offer.','source':'Emirates','category':'Airline news','url':'https://www.emirates.com/media-centre/emirates-invites-travellers-to-discover-dubais-action-packed-calendar-of-events-and-attractions-this-winter/','publishedAt':'2026-09-29','checkedAt':'2026-10-04','expiresAt':'2026-10-12'},
]
highlights = [item for item in highlights if item['expiresAt'] >= now.date().isoformat()]
rss_items = []
success = False
try:
    request = urllib.request.Request('https://caa.go.ug/feed/', headers={'User-Agent':'PardusTravelDesk/1.0'})
    with urllib.request.urlopen(request, timeout=25) as response:
        xml = ET.fromstring(response.read(2_000_000))
    for item in xml.findall('./channel/item'):
        title = re.sub(r'\s+', ' ', item.findtext('title', '')).strip()
        url = item.findtext('link', '').replace('http://', 'https://', 1)
        if urlparse(url).hostname not in ('caa.go.ug', 'www.caa.go.ug') or not title:
            continue
        date = email.utils.parsedate_to_datetime(item.findtext('pubDate', '')).astimezone(dt.timezone.utc)
        if date > now + dt.timedelta(days=1):
            continue
        rss_items.append({'id':url,'title':title[:190], 'summary':'An official aviation update from Uganda Civil Aviation Authority. Read the full notice for dates and travel details.', 'source':'Uganda CAA','category':'Aviation update','url':url,'publishedAt':date.date().isoformat(),'checkedAt':now.date().isoformat()})
        if len(rss_items) == 6:
            break
    success = bool(rss_items)
except (OSError, ValueError, ET.ParseError) as error:
    print(f'Official feed unavailable; retaining the last successful headlines: {type(error).__name__}')
if not success:
    rss_items = [item for item in previous['items'] if item.get('source') == 'Uganda CAA']
if not rss_items and not highlights:
    raise SystemExit('No verified travel updates are available; no file was overwritten.')
data = {'updatedAt': now.isoformat() if success else previous.get('updatedAt'), 'items':highlights + rss_items, 'sources':[{'name':'Uganda Civil Aviation Authority','url':'https://caa.go.ug/feed/','lastSuccessfulCheck':now.isoformat() if success else previous.get('updatedAt')}]}
target.parent.mkdir(parents=True,exist_ok=True)
content = json.dumps(data,ensure_ascii=False,indent=2) + '\n'
target.write_text(content)
# GitHub Pages need not rebuild for scheduled updates: the client reads this public
# JSON from raw.githubusercontent.com, then falls back to its local published copy.
if (project.parent / '.git').is_dir():
    (project.parent / 'travel-updates.json').write_text(content)
print(f'Travel desk: {len(data["items"])} official updates; feed refreshed={success}.')
