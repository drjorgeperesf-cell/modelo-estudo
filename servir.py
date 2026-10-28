"""Abre o app no seu computador: python servir.py [porta] [--sem-navegador]  ->  http://localhost:8000   (só stdlib; Ctrl+C para parar)"""
import http.server
import socketserver
import sys
import threading
import webbrowser

numeros = [a for a in sys.argv[1:] if a.isdigit()]
PORTA = int(numeros[0]) if numeros else 8000


class Servidor(socketserver.TCPServer):
    allow_reuse_address = True


with Servidor(('127.0.0.1', PORTA), http.server.SimpleHTTPRequestHandler) as s:
    print(f'Abra http://localhost:{PORTA}  (Ctrl+C para parar)')
    if '--sem-navegador' not in sys.argv:
        threading.Timer(1, webbrowser.open, [f'http://localhost:{PORTA}']).start()
    try:
        s.serve_forever()
    except KeyboardInterrupt:
        pass
