"""Run a page in headless Chrome with file access; evaluate expressions; save data URLs."""
import base64, json, os, subprocess, sys, tempfile, shutil, time, urllib.request
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from cdp import WS, evaluate, CHROME
class Page:
    def __init__(self, path, port=9344):
        self.prof = tempfile.mkdtemp(prefix='vid-')
        self.proc = subprocess.Popen([CHROME, '--headless=new', f'--remote-debugging-port={port}', f'--user-data-dir={self.prof}',
            '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required', '--no-first-run', 'about:blank'],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(100):
            try:
                tabs = json.load(urllib.request.urlopen(f'http://127.0.0.1:{port}/json/list')); page = next(t for t in tabs if t['type'] == 'page'); break
            except Exception: time.sleep(.1)
        self.ws = WS(page['webSocketDebuggerUrl']); self.ws.call('Page.enable'); self.ws.call('Runtime.enable')
        self.ws.call('Page.navigate', url='file://' + os.path.abspath(path))
        for _ in range(200):
            if evaluate(self.ws, 'document.readyState') == 'complete': break
            time.sleep(.1)
    def ev(self, js, timeout=1800000):
        r = evaluate(self.ws, js, timeout)
        if isinstance(r, dict) and '__error' in r: raise RuntimeError(r['__error'])
        return r
    def close(self):
        self.proc.terminate()
        try: self.proc.wait(5)
        except Exception: self.proc.kill()
        shutil.rmtree(self.prof, ignore_errors=True)
def save(url, path):
    with open(path, 'wb') as fh: fh.write(base64.b64decode(url.split(',', 1)[1]))
