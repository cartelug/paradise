#!/usr/bin/env python3
"""Refresh dated, traveller-relevant notices from the official Uganda CAA feed."""
import datetime as dt
import email.utils
import html
import json
import pathlib
import re
import urllib.request
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

FEED_URL = 'https://caa.go.ug/feed/'
CAA_HOSTS = {'caa.go.ug', 'www.caa.go.ug'}
RECRUITMENT = re.compile(r'\b(?:vacanc(?:y|ies)|recruit(?:ment|ing)?|careers?|employment|jobs?|hiring|tenders?|procurement|bids?|shortlist(?:ed)?|job\s+description|application\s+deadline)\b', re.I)
STAFF_ROLE = re.compile(r'^(?:(?:principal|senior|chief|assistant|deputy)\s+)?(?:(?:civil|flight\s+operations|aerodrome|electrical|mechanical)\s+)?(?:engineer|inspector|manager|officer|accountant|secretary|director)\b', re.I)
TRAVELLER_TOPIC = re.compile(r'\b(?:flights?|airlines?|routes?|passengers?|check[\s-]?in|baggage|visas?|entry\s+requirements?|travel(?:lers?|ers?)?|touris[mt]|connectivity|jambojet|parking|terminal|disruptions?|delays?|closures?|closed|reopen(?:ing)?|schedules?|winter|seasonal|events?)\b', re.I)

# Manually checked against the linked official page; RSS runs do not advance this
# checkedAt date. Seasonal entries must be reviewed or expire automatically.
HIGHLIGHTS = [
    {'id': 'dubai-winter-2026', 'title': 'Dubai’s winter events calendar',
     'summary': 'Explore seasonal entertainment, food and sporting events before choosing the dates for your Dubai escape.',
     'source': 'Visit Dubai', 'category': 'Dubai',
     'url': 'https://www.visitdubai.com/articles/events-to-look-forward-to-this-season',
     'publishedAt': '2026-09-16', 'checkedAt': '2026-10-14', 'expiresAt': '2027-01-15'},
]
SUMMARIES = {
    'https://caa.go.ug/jambojet-returns-to-uganda-strengthening-regional-connectivity/':
        'Uganda CAA reports the return of Jambojet’s daily direct Nairobi–Entebbe service. Check the airline’s current schedule for your dates.',
}


def is_traveller_relevant(title, url, categories=()):
    """Require a passenger/planning topic, excluding jobs and procurement."""
    context = ' '.join([title, url.replace('-', ' '), *categories])
    return not RECRUITMENT.search(context) and not STAFF_ROLE.search(title) and bool(TRAVELLER_TOPIC.search(title))


def is_official_caa_url(value):
    try:
        url = urlparse(value)
        return (url.scheme == 'https' and url.hostname in CAA_HOSTS
                and not url.username and not url.password and not url.port)
    except (TypeError, ValueError):
        return False


def usable_previous_item(item, now):
    """Retained data receives the same relevance, date and origin checks."""
    try:
        published = dt.date.fromisoformat(item['publishedAt'])
        categories = item.get('sourceCategories', [])
        return (item.get('source') == 'Uganda CAA' and is_official_caa_url(item['url'])
                and now.date() - dt.timedelta(days=120) <= published <= now.date()
                and is_traveller_relevant(item['title'], item['url'], categories))
    except (KeyError, TypeError, ValueError):
        return False


def parse_rss(xml, now):
    root = ET.fromstring(xml)
    if root.find('./channel') is None:
        raise ValueError('Official response has no RSS channel')
    notices = []
    seen = set()
    for item in root.findall('./channel/item'):
        title = re.sub(r'\s+', ' ', html.unescape(item.findtext('title', ''))).strip()
        url = item.findtext('link', '').strip().replace('http://', 'https://', 1)
        categories = [html.unescape(node.text or '').strip() for node in item.findall('category')]
        if (not is_official_caa_url(url) or not title or url in seen
                or not is_traveller_relevant(title, url, categories)):
            continue
        try:
            date = email.utils.parsedate_to_datetime(item.findtext('pubDate', ''))
            if date.tzinfo is None:
                continue
            date = date.astimezone(dt.timezone.utc)
        except (TypeError, ValueError, OverflowError):
            continue
        if not now.date() - dt.timedelta(days=120) <= date.date() <= now.date():
            continue
        seen.add(url)
        notices.append({'id': url, 'title': title[:190],
                        'summary': SUMMARIES.get(url, 'An official notice relevant to passengers and journey planning. Read the original source for details and dates.'),
                        'source': 'Uganda CAA', 'category': 'Aviation update', 'url': url,
                        'publishedAt': date.date().isoformat(), 'checkedAt': now.date().isoformat(),
                        'sourceCategories': categories})
    return sorted(notices, key=lambda notice: notice['publishedAt'], reverse=True)[:6]


def refresh(project, now):
    target = project / 'public' / 'travel-updates.json'
    previous = json.loads(target.read_text(encoding='utf-8')) if target.exists() else {'items': [], 'updatedAt': None}
    highlights = [item for item in HIGHLIGHTS if item['publishedAt'] <= now.date().isoformat() <= item['expiresAt']]
    success = False
    try:
        request = urllib.request.Request(FEED_URL, headers={'User-Agent': 'PardusTravelDesk/2.0'})
        with urllib.request.urlopen(request, timeout=25) as response:
            rss_items = parse_rss(response.read(2_000_000), now)
        # A healthy feed with no relevant items clears old notices too.
        success = True
    except (OSError, ValueError, ET.ParseError) as error:
        print(f'Official feed unavailable; retaining eligible last-successful notices: {type(error).__name__}')
        rss_items = [item for item in previous.get('items', []) if usable_previous_item(item, now)]
    updated_at = now.isoformat() if success else previous.get('updatedAt')
    data = {'updatedAt': updated_at, 'items': highlights + rss_items,
            'sources': [{'name': 'Uganda Civil Aviation Authority', 'url': FEED_URL, 'lastSuccessfulCheck': updated_at}]}
    target.parent.mkdir(parents=True, exist_ok=True)
    content = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    target.write_text(content, encoding='utf-8')
    # The browser reads the current root JSON without requiring a Pages rebuild.
    if (project.parent / '.git').exists():
        (project.parent / 'travel-updates.json').write_text(content, encoding='utf-8')
    print(f'Travel desk: {len(data["items"])} traveller notices; feed refreshed={success}.')
    return data


if __name__ == '__main__':
    refresh(pathlib.Path(__file__).resolve().parents[1], dt.datetime.now(dt.timezone.utc))
