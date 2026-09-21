#!/usr/bin/env python3
"""Tiny static server for local preview.  python3 serve.py [port]"""
import functools, mimetypes, os, socketserver, sys
from http.server import SimpleHTTPRequestHandler

# os.getcwd() is blocked in this sandbox, which is why `python -m http.server`
# dies on startup — hence the absolute root and the explicit `directory=`.
ROOT = "/Users/mundagroki/Downloads/Work/Portfolio Website"
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
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == "__main__":
    h = functools.partial(Handler, directory=ROOT)
    with Server(("127.0.0.1", PORT), h) as srv:
        print("serving %s on http://localhost:%d" % (ROOT, PORT), flush=True)
        srv.serve_forever()
