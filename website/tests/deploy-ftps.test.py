import importlib.util
import io
import json
import tempfile
import unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location('deploy', Path(__file__).resolve().parents[1] / 'scripts/deploy-ftps.py')
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)

class FTP:
    def __init__(self, corrupt=False):
        self.files = {}; self.events = []; self.corrupt = corrupt
    def retrbinary(self, command, write):
        name = command[5:]
        if name not in self.files: raise deploy.ftplib.error_perm('550 missing')
        write(b'corrupt' if self.corrupt and name.endswith('.pardus-upload') else self.files[name])
    def storbinary(self, command, data):
        self.files[command[5:]] = data.read(); self.events.append(('store', command[5:]))
    def rename(self, old, new):
        self.files[new] = self.files.pop(old); self.events.append(('activate', new))
    def mkd(self, name): self.events.append(('directory', name))
    def cwd(self, name): pass

class DeployTest(unittest.TestCase):
    def fixture(self, root):
        for name in ['index.html', 'about/index.html', 'about.html', 'static/app.js', '.htaccess', 'release.json']:
            path = root / name; path.parent.mkdir(parents=True, exist_ok=True); path.write_text(name)
    def test_routing_activates_after_all_pages_and_marker_last(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); self.fixture(root); ftp = FTP()
            self.assertEqual(deploy.deploy(ftp, root), (6, 6))
            names = [name for action,name in ftp.events if action == 'activate']
            self.assertLess(names.index('about/index.html'), names.index('about.html'))
            self.assertLess(names.index('index.html'), names.index('.htaccess'))
            self.assertLess(names.index('.htaccess'), names.index('release.json'))
            self.assertEqual(names[-1], deploy.STATE)
            self.assertEqual(deploy.deploy(ftp, root), (0, 6))
    def test_corrupt_transfer_cannot_activate_rules_or_state(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); self.fixture(root); ftp = FTP(corrupt=True)
            with self.assertRaisesRegex(RuntimeError, 'verification failed'): deploy.deploy(ftp, root)
            self.assertNotIn('.htaccess', ftp.files)
            self.assertNotIn(deploy.STATE, ftp.files)

if __name__ == '__main__': unittest.main()
