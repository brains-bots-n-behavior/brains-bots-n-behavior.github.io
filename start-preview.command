#!/bin/bash
cd "$(dirname "$0")" || exit 1

PORT=8765
while lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

URL="http://127.0.0.1:$PORT/"
echo "Starting B3 lab site preview at $URL"
echo "This is local-only. Close this Terminal window or press Control-C to stop it."

sleep 1 && open "$URL" &
python3 -m http.server "$PORT" --bind 127.0.0.1
