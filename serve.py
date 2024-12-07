#!/usr/bin/env python

import os
import ssl
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

HOST     = 'localhost'
HOST     = '0.0.0.0'
HTTP_PORT  = 8000
HTTPS_PORT = 5173
KEYFILE    = Path('certbot/config/live/beltz.dtgoitia.dev/privkey.pem')
CERTFILE   = Path('certbot/config/live/beltz.dtgoitia.dev/fullchain.pem')

ASSETS_DIR = Path('./assets')


class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        super().end_headers()


def run():
    public_domain   = os.environ.get('DOMAIN')
    use_https = public_domain and KEYFILE.exists() and CERTFILE.exists()

    if use_https:
        print('certificates found, setting up an HTTPS server...')
        protocol = 'https'
        port     = HTTPS_PORT
        host   = public_domain
    else:
        print('certificates not found, setting up an HTTP server...')
        protocol = 'http'
        port     = HTTP_PORT
        host   = HOST

    server = HTTPServer(server_address=(HOST, port), RequestHandlerClass=CORSRequestHandler)

    if use_https:
        # Create an SSL context
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(certfile=CERTFILE.absolute(), keyfile=KEYFILE.absolute())

        # Wrap the socket with the SSL context
        server.socket = context.wrap_socket(server.socket, server_side=True)

    os.chdir(ASSETS_DIR)

    local_url = f"{protocol}://{HOST}:{port}"
    url_with_comain = f"{protocol}://{host}:{port}"
    print(f"\nServer running on {local_url}")
    print(f"\nand accessible via {url_with_comain}")
    server.serve_forever()


if __name__ == "__main__":
    if not KEYFILE.exists():
        print(f'ERROR: keyfile not found at {KEYFILE}')
        exit()

    if not CERTFILE.exists():
        print(f'ERROR: keyfile not found at {CERTFILE}')
        exit()

    run()