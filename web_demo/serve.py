#!/usr/bin/env python3
"""
Simple web server for Code4Mena Legal Assistant Demo
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

PORT = 3000

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to web_demo directory
    web_demo_dir = Path(__file__).parent
    os.chdir(web_demo_dir)
    
    print(f"🌐 Starting Code4Mena Legal Assistant Web Demo...")
    print(f"📁 Serving from: {web_demo_dir}")
    print(f"🔗 URL: http://localhost:{PORT}")
    print(f"📋 Make sure the backend API is running on http://localhost:8001")
    print(f"🛑 Press Ctrl+C to stop")
    
    try:
        with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
            print(f"\n✅ Web demo server started successfully!")
            
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://localhost:{PORT}')
                print(f"🚀 Opening browser automatically...")
            except:
                print(f"💡 Please open http://localhost:{PORT} in your browser")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n👋 Shutting down web demo server...")
        sys.exit(0)
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ Port {PORT} is already in use. Try a different port or stop the existing server.")
            sys.exit(1)
        else:
            raise

if __name__ == "__main__":
    main()