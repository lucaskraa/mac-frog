#!/usr/bin/env python3
"""Build an offline, single-HTML Mac Frog V10 preview from the checked out branch.

The bootstrap intercepts the game's own same-directory fetch calls. This keeps
the original game source untouched while making the preview self-contained.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
OUTPUT = ROOT / "dist" / "mac-frog-v10-jogavel.html"

index = INDEX.read_text(encoding="utf-8")
requests = list(dict.fromkeys(re.findall(r"fetch\('\./([^']+)'", index)))
assert len(requests) >= 15, f"Unexpected runtime manifest: {requests}"
file_paths = requests + [
    str(path.relative_to(ROOT)).replace("\\", "/")
    for path in sorted((ROOT / "assets").rglob("*.b64"))
]
payload = {}
for path in dict.fromkeys(file_paths):
    target = ROOT / path
    if not target.is_file():
        raise FileNotFoundError(f"Required runtime file missing: {path}")
    payload[path] = target.read_text(encoding="utf-8")
assert "game_v25.html" in payload
assert any(n.endswith("scenario_room1_v10_enemies.js") for n in payload)
assert len(payload["game_v25.html"]) >= 17000000, "Original game truncated"

# </script> in a JSON string is valid JS, but it would terminate the bootstrap
# at the HTML tokenizer level; escape the slash to preserve exact JS string data.
as_js = json.dumps(payload, ensure_ascii=True, separators=(",", ":"))
as_js = as_js.replace("</", "<\\/").replace("<!--", "<\\!--")

bootstrap = """<script>
(function () {
  "use strict";
  const localFiles = __PAYLOAD__;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = function(input, init) {
    const raw = typeof input === 'string' ? input : input.url;
    const path = raw.replace(/^\\.\\//, '').split('?')[0].split('#')[0];
    if (Object.prototype.hasOwnProperty.call(localFiles, path)) {
      const mime = path.endsWith('.html') ? 'text/html; charset=utf-8' :
                   path.endsWith('.js') ? 'text/javascript; charset=utf-8' :
                   'text/plain; charset=utf-8';
      return Promise.resolve(new Response(localFiles[path], {
        status: 200, headers: { 'Content-Type': mime }
      }));
    }
    return nativeFetch(input, init);
  };
})();
</script>
""".replace("__PAYLOAD__", as_js)

assert index.count("<script>") == 1, "Update bootstrap placement after index changes"
standalone = index.replace("<script>", bootstrap + "<script>", 1)
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(standalone, encoding="utf-8")
print(f"Built {OUTPUT} with {len(payload)} embedded files; {OUTPUT.stat().st_size:,} bytes")
