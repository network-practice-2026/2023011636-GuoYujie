from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse
import json
import mimetypes

from database import (
    create_knowledge,
    delete_knowledge,
    init_db,
    list_knowledge,
    list_layers,
    update_knowledge,
)


BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
HOST = "127.0.0.1"
PORT = 8000


class AppHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        return

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self.send_json({"ok": True, "project": "计算机网络知识体系交互式展示系统"})
            return
        if parsed.path == "/api/layers":
            self.send_json({"layers": list_layers()})
            return
        if parsed.path == "/api/knowledge":
            query = parse_qs(parsed.query)
            data = list_knowledge(
                layer=query.get("layer", [""])[0],
                q=query.get("q", [""])[0],
                page=query.get("page", ["1"])[0],
                page_size=query.get("page_size", ["8"])[0],
            )
            self.send_json(data)
            return
        self.serve_static(parsed.path)

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/knowledge":
            self.handle_json_write(lambda data: create_knowledge(data), 201)
            return
        self.send_error(404)

    def do_PUT(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/knowledge/"):
            item_id = parsed.path.rsplit("/", 1)[-1]
            self.handle_json_write(lambda data: update_knowledge(item_id, data))
            return
        self.send_error(404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/knowledge/"):
            item_id = parsed.path.rsplit("/", 1)[-1]
            try:
                self.send_json(delete_knowledge(item_id))
            except KeyError as exc:
                self.send_json({"error": str(exc)}, 404)
            return
        self.send_error(404)

    def read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw)

    def handle_json_write(self, action, status=200):
        try:
            payload = self.read_json_body()
            self.send_json(action(payload), status)
        except json.JSONDecodeError:
            self.send_json({"error": "JSON 格式错误"}, 400)
        except ValueError as exc:
            self.send_json({"error": str(exc)}, 400)
        except KeyError as exc:
            self.send_json({"error": str(exc)}, 404)
        except Exception as exc:
            self.send_json({"error": str(exc)}, 500)

    def serve_static(self, path):
        if path == "/":
            path = "/index.html"
        target = (PUBLIC_DIR / path.lstrip("/")).resolve()
        if not str(target).startswith(str(PUBLIC_DIR.resolve())) or not target.exists():
            self.send_error(404)
            return
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.end_headers()
        self.wfile.write(target.read_bytes())

    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print(f"Server running at http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
