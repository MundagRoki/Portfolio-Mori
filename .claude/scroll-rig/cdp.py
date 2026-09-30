"""Tiny headless-Chrome driver over the DevTools protocol, stdlib only.

usage: python3 cdp.py URL W H JSFILE [JSFILE...] -- EXPR [EXPR...]
Loads URL at W x H, evaluates each JSFILE (awaited), then each EXPR in turn
(awaited, returned by value) and prints one JSON line per EXPR."""
import base64, json, os, socket, struct, subprocess, sys, time, urllib.request

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
HERE = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("CDP_PORT", "9333"))

class WS:
    def __init__(self, url):
        rest = url.split("://", 1)[1]
        hostport, path = rest.split("/", 1)
        host, port = hostport.split(":")
        self.s = socket.create_connection((host, int(port)))
        key = base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET /{path} HTTP/1.1\r\nHost: {hostport}\r\nUpgrade: websocket\r\n"
                        f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        buf = b""
        while b"\r\n\r\n" not in buf:
            buf += self.s.recv(4096)
        self.buf = buf.split(b"\r\n\r\n", 1)[1]
        self.id = 0
    def _read(self, n):
        while len(self.buf) < n:
            chunk = self.s.recv(1 << 20)
            if not chunk: raise EOFError
            self.buf += chunk
        out, self.buf = self.buf[:n], self.buf[n:]
        return out
    def send(self, obj):
        data = json.dumps(obj).encode()
        hdr = bytearray([0x81])
        n = len(data)
        if n < 126: hdr.append(0x80 | n)
        elif n < 65536: hdr.append(0x80 | 126); hdr += struct.pack(">H", n)
        else: hdr.append(0x80 | 127); hdr += struct.pack(">Q", n)
        mask = os.urandom(4)
        hdr += mask
        self.s.sendall(bytes(hdr) + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))
    def recv(self):
        msg = b""
        while True:
            b1, b2 = self._read(2)
            op, n = b1 & 0x0F, b2 & 0x7F
            if n == 126: n = struct.unpack(">H", self._read(2))[0]
            elif n == 127: n = struct.unpack(">Q", self._read(8))[0]
            payload = self._read(n)
            if op == 0x9: continue
            if op == 0x8: raise EOFError
            msg += payload
            if b1 & 0x80: return json.loads(msg)
    def call(self, method, **params):
        self.id += 1
        me = self.id
        self.send({"id": me, "method": method, "params": params})
        while True:
            m = self.recv()
            if m.get("id") == me:
                if "error" in m: raise RuntimeError(f"{method}: {m['error']}")
                return m.get("result", {})

def evaluate(ws, expr, timeout=180000):
    r = ws.call("Runtime.evaluate", expression=expr, awaitPromise=True, returnByValue=True,
                timeout=timeout, userGesture=True, replMode=True)
    if "exceptionDetails" in r:
        d = r["exceptionDetails"]
        return {"__error": d.get("exception", {}).get("description") or d.get("text")}
    return r.get("result", {}).get("value")

def main():
    args = sys.argv[1:]
    sep = args.index("--")
    url, w, h, files, exprs = args[0], int(args[1]), int(args[2]), args[3:sep], args[sep + 1:]
    import tempfile, shutil
    prof = tempfile.mkdtemp(prefix="scroll-rig-")
    proc = subprocess.Popen([CHROME, "--headless=new", f"--remote-debugging-port={PORT}",
        f"--user-data-dir={prof}", f"--window-size={w},{h}", "--no-first-run", "--no-default-browser-check",
        "--disable-background-timer-throttling", "--disable-renderer-backgrounding",
        "--disable-backgrounding-occluded-windows", "--enable-unsafe-swiftshader", "--hide-scrollbars",
        *os.environ.get("EXTRA_FLAGS", "").split(), "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(100):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list"))
                page = next(t for t in tabs if t["type"] == "page")
                break
            except Exception:
                time.sleep(.1)
        ws = WS(page["webSocketDebuggerUrl"])
        ws.call("Page.enable"); ws.call("Runtime.enable")
        ws.call("Emulation.setDeviceMetricsOverride", width=w, height=h, deviceScaleFactor=2, mobile=False)
        feats = [{"name": "pointer", "value": "fine"}, {"name": "hover", "value": "hover"}]
        if os.environ.get("REDUCED"): feats.append({"name": "prefers-reduced-motion", "value": "reduce"})
        try: ws.call("Emulation.setEmulatedMedia", features=feats)
        except Exception as e: print(json.dumps({"__warn": str(e)}))
        ws.call("Page.navigate", url=url)
        for _ in range(200):
            st = evaluate(ws, "location.href + ' ' + document.readyState")
            if isinstance(st, str) and st.startswith(url.split('#')[0]) and st.endswith('complete'): break
            time.sleep(.1)
        time.sleep(2.0)
        for f in files:
            with open(f) as fh: evaluate(ws, fh.read())
        for e in exprs:
            if e.startswith("!sleep "):
                time.sleep(float(e[7:]) / 1000); continue
            if e.startswith("!cast "):
                # !cast <ms> <outdir> <js to run once recording has started>
                _, ms, outdir, js = e.split(" ", 3)
                os.makedirs(outdir, exist_ok=True)
                ws.call("Page.startScreencast", format="jpeg", quality=80, everyNthFrame=1)
                ws.id += 1; ws.send({"id": ws.id, "method": "Runtime.evaluate", "params": {"expression": js, "replMode": True}})
                t0 = time.time(); n = 0; ws.s.settimeout(0.2)
                while time.time() - t0 < float(ms) / 1000:
                    try: m = ws.recv()
                    except socket.timeout: continue
                    if m.get("method") == "Page.screencastFrame":
                        pr = m["params"]; n += 1
                        with open(os.path.join(outdir, "c%03d_%05d.jpg" % (n, int((time.time() - t0) * 1000))), "wb") as fh: fh.write(base64.b64decode(pr["data"]))
                        ws.id += 1; ws.send({"id": ws.id, "method": "Page.screencastFrameAck", "params": {"sessionId": pr["sessionId"]}})
                ws.s.settimeout(None)
                ws.call("Page.stopScreencast")
                print(json.dumps({"cast": outdir, "frames": n}), flush=True); continue
            if e.startswith("!shot "):
                r = ws.call("Page.captureScreenshot", format="png")
                with open(e[6:], "wb") as fh: fh.write(base64.b64decode(r["data"]))
                print(json.dumps({"shot": e[6:]}), flush=True); continue
            if e.startswith("!"):
                meth, _, js = e[1:].partition(" ")
                print(json.dumps({"cdp": meth, "r": ws.call(meth, **(json.loads(js) if js else {}))}), flush=True)
                continue
            print(json.dumps(evaluate(ws, e)), flush=True)
    finally:
        proc.terminate()
        try: proc.wait(5)
        except Exception: proc.kill()
        shutil.rmtree(prof, ignore_errors=True)

if __name__ == "__main__":
    main()
