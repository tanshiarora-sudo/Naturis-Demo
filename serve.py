#!/usr/bin/env python3
"""Minimal static file server for the Naturis prototype.
Avoids http.server's CLI (which calls os.getcwd() at import and trips the sandbox).
Sends no-cache headers so every reload picks up the latest .jsx/.css edits.
"""
import functools
import http.server
import socketserver

DIRECTORY = "/Users/tanshi/Desktop/Naturis"
PORT = 4178


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


Handler = functools.partial(NoCacheHandler, directory=DIRECTORY)


class Server(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    with Server(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Naturis serving {DIRECTORY} on http://127.0.0.1:{PORT}")
        httpd.serve_forever()
