#!/usr/bin/env python3
"""Tiny static server for local preview.  python3 serve.py [port]"""
import functools, mimetypes, os, socketserver, sys
from http.server import SimpleHTTPRequestHandler

# os.getcwd() is blocked in this sandbox, which is why `python -m http.server`
# dies on startup — hence the explicit `directory=`. The root is this file's
# own folder, so the site runs wherever it is copied; run it by its absolute
# path in the sandbox, since a relative one needs getcwd() to resolve.
ROOT = os.path.dirname(os.path.abspath(__file__))
# PORT env var first so the harness can assign a free port (autoPort).
PORT = int(os.environ.get("PORT") or (sys.argv[1] if len(sys.argv) > 1 else 4173))

# SimpleHTTPRequestHandler doesn't know AVIF; without this the browser gets
# application/octet-stream and refuses to decode the frames.
mimetypes.add_type("image/avif", ".avif")
# python maps .m4a to audio/mp4a-latm, which browsers refuse to play
mimetypes.add_type("audio/mp4", ".m4a")

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("%s\n" % (fmt % args))
    def end_headers(self):
        # no-cache, not no-store: the browser keeps its copy but asks every
        # time, and SimpleHTTPRequestHandler answers If-Modified-Since with a
        # 304 — so edits still show on a plain reload, while unchanged frames,
        # fonts and videos are not re-downloaded and Back stays instant.
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == "__main__":
    h = functools.partial(Handler, directory=ROOT)
    with Server(("127.0.0.1", PORT), h) as srv:
        print("serving %s on http://localhost:%d" % (ROOT, PORT), flush=True)
        srv.serve_forever()
