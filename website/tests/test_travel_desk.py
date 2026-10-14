"""Regression checks for the scheduled producer; no network calls."""
import datetime as dt
import importlib.util
import json
import pathlib
import tempfile
import unittest
from unittest.mock import MagicMock, patch

script = pathlib.Path(__file__).resolve().parents[1] / 'scripts' / 'update-travel-desk.py'
spec = importlib.util.spec_from_file_location('travel_desk', script)
travel_desk = importlib.util.module_from_spec(spec)
spec.loader.exec_module(travel_desk)
NOW = dt.datetime(2026, 10, 14, 12, tzinfo=dt.timezone.utc)


def item(title, url='https://caa.go.ug/passenger-notice/', date='Thu, 01 Oct 2026 14:14:12 +0000', category='CAA News'):
    return f'<item><title>{title}</title><link>{url}</link><pubDate>{date}</pubDate><category>{category}</category></item>'


class TravelDeskTests(unittest.TestCase):
    def test_recruitment_is_removed_before_the_six_item_limit(self):
        jobs = ''.join(item('Senior Flight Operations Inspector', f'https://caa.go.ug/job-{i}/', category='Vacancies') for i in range(8))
        xml = f'<rss><channel>{jobs}{item("Jambojet returns to Uganda: Strengthening regional connectivity")}</channel></rss>'
        notices = travel_desk.parse_rss(xml, NOW)
        self.assertEqual(len(notices), 1)
        self.assertIn('Jambojet', notices[0]['title'])
        self.assertEqual(notices[0]['publishedAt'], '2026-10-01')

    def test_institution_news_and_invalid_dates_do_not_displace_passenger_notices(self):
        xml = '<rss><channel>' + ''.join([
            item('Uganda Air Force College students visit Entebbe International Airport'),
            item('New passenger route', date='invalid'),
            item('New passenger route', date='Thu, 15 Oct 2026 14:14:12 +0000'),
            item('New passenger route', date='Mon, 01 Jun 2026 14:14:12 +0000'),
            item('New passenger route', url='https://caa.go.ug.evil.example/'),
            item('New passenger route', url='https://caa.go.ug:invalid/'),
            item('Jambojet returns to Uganda'), item('Jambojet returns to Uganda'),
        ]) + '</channel></rss>'
        self.assertEqual(len(travel_desk.parse_rss(xml, NOW)), 1)

    def test_failure_retention_filters_legacy_jobs_and_old_notices(self):
        base = {'title': 'Jambojet returns to Uganda', 'url': 'https://caa.go.ug/jambojet/', 'source': 'Uganda CAA', 'publishedAt': '2026-10-01'}
        self.assertTrue(travel_desk.usable_previous_item(base, NOW))
        self.assertFalse(travel_desk.usable_previous_item({**base, 'title': 'Senior Flight Operations Inspector'}, NOW))
        self.assertFalse(travel_desk.usable_previous_item({**base, 'publishedAt': '2026-06-01'}, NOW))
        self.assertFalse(travel_desk.usable_previous_item({**base, 'sourceCategories': ['Vacancies']}, NOW))

    def test_network_failure_preserves_last_check_and_healthy_empty_feed_clears_stale_news(self):
        with tempfile.TemporaryDirectory() as folder:
            project = pathlib.Path(folder) / 'website'
            public = project / 'public'
            public.mkdir(parents=True)
            previous = {'updatedAt': '2026-10-01T12:00:00+00:00', 'items': [
                {'title': 'Jambojet returns to Uganda', 'url': 'https://caa.go.ug/jambojet/', 'source': 'Uganda CAA', 'publishedAt': '2026-10-01'},
                {'title': 'Senior Flight Operations Inspector', 'url': 'https://caa.go.ug/inspector/', 'source': 'Uganda CAA', 'publishedAt': '2026-10-01'},
            ]}
            (public / 'travel-updates.json').write_text(json.dumps(previous), encoding='utf-8')
            with patch.object(travel_desk.urllib.request, 'urlopen', side_effect=OSError('unavailable')):
                retained = travel_desk.refresh(project, NOW)
            self.assertEqual(retained['updatedAt'], previous['updatedAt'])
            self.assertEqual(sum(item['source'] == 'Uganda CAA' for item in retained['items']), 1)
            response = MagicMock()
            response.__enter__.return_value.read.return_value = b'<rss><channel></channel></rss>'
            later = dt.datetime(2027, 2, 14, 12, tzinfo=dt.timezone.utc)
            with patch.object(travel_desk.urllib.request, 'urlopen', return_value=response):
                empty = travel_desk.refresh(project, later)
            self.assertEqual(empty['items'], [])
            self.assertEqual(empty['updatedAt'], later.isoformat())


if __name__ == '__main__':
    unittest.main()
