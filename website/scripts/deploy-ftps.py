"""Encrypted, additive Pardus deployment. Routing is activated only after pages exist."""
import ftplib
import hashlib
import io
import json
import os
import ssl
from pathlib import Path

STATE = '.pardus-deploy-state.json'

def upload_order(path, root):
    name = path.relative_to(root).as_posix()
    # Dependencies, canonical pages, compatibility pages, home, routing, release marker.
    if name == 'release.json': return (5, name)
    if name == '.htaccess': return (4, name)
    if name == 'index.html': return (3, name)
    if path.suffix == '.html': return (1 if '/' in name else 2, name)
    return (0, name)

def digest(data):
    return hashlib.sha256(data).hexdigest()

def deploy(ftp, root):
    previous = io.BytesIO()
    try:
        ftp.retrbinary('RETR ' + STATE, previous.write)
        old = json.loads(previous.getvalue())
        if not isinstance(old, dict): old = {}
    except (ftplib.error_perm, ValueError):
        old = {}
    files = sorted((p for p in root.rglob('*') if p.is_file()), key=lambda p: upload_order(p, root))
    directories, current, uploaded = {''}, {}, 0
    for path in files:
        name = path.relative_to(root).as_posix()
        data = path.read_bytes()
        current[name] = digest(data)
        if old.get(name) == current[name]: continue
        parent = path.relative_to(root).parent
        for directory in reversed([parent, *parent.parents]):
            part = directory.as_posix()
            if part == '.' or part in directories: continue
            try: ftp.mkd(part)
            except ftplib.error_perm:
                ftp.cwd('/' + part)
                ftp.cwd('/')
            directories.add(part)
        temporary = name + '.pardus-upload'
        ftp.storbinary('STOR ' + temporary, io.BytesIO(data))
        # Verify the encrypted transfer before making this file visible.
        check = hashlib.sha256()
        ftp.retrbinary('RETR ' + temporary, check.update)
        if check.hexdigest() != current[name]:
            raise RuntimeError('Upload verification failed: ' + name)
        ftp.rename(temporary, name)
        uploaded += 1
    ftp.storbinary('STOR ' + STATE + '.tmp', io.BytesIO(json.dumps(current).encode()))
    ftp.rename(STATE + '.tmp', STATE)
    return uploaded, len(files)

def main():
    keys = ('FTP_SERVER', 'FTP_USERNAME', 'FTP_PASSWORD')
    if any(not os.environ.get(key) for key in keys):
        raise SystemExit('Missing NAMECHEAP_FTP_* repository secrets. Use the dedicated Pardus document-root account.')
    server = os.environ['FTP_SERVER'].strip()
    if '://' in server or '/' in server:
        raise SystemExit('FTP server must be a hostname only.')
    root = Path('website/dist')
    for required in ('index.html', '.htaccess', 'release.json', 'about/index.html'):
        if not (root / required).is_file(): raise SystemExit('Verified canonical output is missing: ' + required)
    ftp = ftplib.FTP_TLS(context=ssl.create_default_context(), timeout=90)
    try:
        ftp.connect(server, 21)
        ftp.login(os.environ['FTP_USERNAME'], os.environ['FTP_PASSWORD'])
        ftp.prot_p()
        ftp.set_pasv(True)
        ftp.cwd('/')
        uploaded, total = deploy(ftp, root)
        print(f'Verified encrypted upload: {uploaded} changed files; {total - uploaded} unchanged. Routing activated after pages. No remote deletion.')
    finally:
        ftp.close()

if __name__ == '__main__': main()
