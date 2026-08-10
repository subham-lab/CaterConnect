#!/usr/bin/env bash
# Controls both the local backend + public tunnel, and the deployed
# frontend's public alias (https://catererapp.vercel.app).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"
SITE_URL="https://catererapp.vercel.app"

RUN_DIR="/tmp/caterconnect"
mkdir -p "$RUN_DIR"
BACKEND_PID="$RUN_DIR/backend.pid"
TUNNEL_PID="$RUN_DIR/tunnel.pid"
BACKEND_LOG="$RUN_DIR/backend.log"
TUNNEL_LOG="$RUN_DIR/tunnel.log"

is_running() {
  [ -f "$1" ] && kill -0 "$(cat "$1")" 2>/dev/null
}

start() {
  if is_running "$BACKEND_PID"; then
    echo "Backend already running (pid $(cat "$BACKEND_PID"))"
  else
    echo "Starting backend..."
    (cd "$BACKEND_DIR" && exec nohup node src/server.js > "$BACKEND_LOG" 2>&1) &
    echo $! > "$BACKEND_PID"
    for i in $(seq 1 15); do
      curl -s -o /dev/null http://localhost:5000/api/health && break
      sleep 1
    done
    curl -s -o /dev/null http://localhost:5000/api/health && echo "Backend up on :5000" || { echo "Backend failed to start — check $BACKEND_LOG"; exit 1; }
  fi

  if is_running "$TUNNEL_PID"; then
    echo "Tunnel already running (pid $(cat "$TUNNEL_PID"))"
  else
    echo "Starting tunnel..."
    : > "$TUNNEL_LOG"
    nohup cloudflared tunnel --url http://localhost:5000 > "$TUNNEL_LOG" 2>&1 &
    echo $! > "$TUNNEL_PID"
    for i in $(seq 1 20); do
      grep -qo 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' "$TUNNEL_LOG" && break
      sleep 1
    done
  fi

  TUNNEL_URL="$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' "$TUNNEL_LOG" | head -1 || true)"
  if [ -z "$TUNNEL_URL" ]; then
    echo "Could not read tunnel URL — check $TUNNEL_LOG"
    exit 1
  fi
  echo "Tunnel: $TUNNEL_URL"

  CURRENT_API_URL="$(grep '^VITE_API_URL=' "$FRONTEND_DIR/.env" | cut -d= -f2-)"
  NEW_API_URL="$TUNNEL_URL/api"
  SITE_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "$SITE_URL" || true)"

  if [ "$CURRENT_API_URL" != "$NEW_API_URL" ] || [ "$SITE_STATUS" != "200" ]; then
    echo "Deploying frontend (env changed or site was down)..."
    sed -i.bak "s#^VITE_API_URL=.*#VITE_API_URL=$NEW_API_URL#" "$FRONTEND_DIR/.env"
    rm -f "$FRONTEND_DIR/.env.bak"
    (cd "$FRONTEND_DIR" && npx vercel env add VITE_API_URL production --value "$NEW_API_URL" --force < /dev/null > /dev/null 2>&1)
    (cd "$FRONTEND_DIR" && npx vercel --prod --yes > "$RUN_DIR/deploy.log" 2>&1)
    echo "Frontend live at: $SITE_URL"
  else
    echo "Frontend already up to date — no redeploy needed."
  fi
}

stop() {
  if is_running "$TUNNEL_PID"; then
    kill "$(cat "$TUNNEL_PID")" 2>/dev/null || true
    echo "Tunnel stopped."
  fi
  rm -f "$TUNNEL_PID"

  if is_running "$BACKEND_PID"; then
    kill "$(cat "$BACKEND_PID")" 2>/dev/null || true
    echo "Backend stopped."
  fi
  rm -f "$BACKEND_PID"

  (cd "$FRONTEND_DIR" && npx vercel alias rm catererapp.vercel.app --yes < /dev/null > /dev/null 2>&1) || true
  echo "Frontend taken offline."
}

status() {
  is_running "$BACKEND_PID" && echo "Backend: running (pid $(cat "$BACKEND_PID"))" || echo "Backend: stopped"
  if is_running "$TUNNEL_PID"; then
    echo "Tunnel: running (pid $(cat "$TUNNEL_PID")) — $(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' "$TUNNEL_LOG" | head -1)"
  else
    echo "Tunnel: stopped"
  fi
  SITE_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "$SITE_URL" || true)"
  if [ "$SITE_STATUS" = "200" ]; then
    echo "Frontend: up ($SITE_URL)"
  else
    echo "Frontend: down (HTTP $SITE_STATUS)"
  fi
}

case "${1:-}" in
  start)   start ;;
  stop)    stop ;;
  restart) stop; sleep 1; start ;;
  status)  status ;;
  *) echo "Usage: $0 {start|stop|restart|status}"; exit 1 ;;
esac
