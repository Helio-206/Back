#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACK_DIR="$ROOT_DIR/.worktrees/develop"

bash "$ROOT_DIR/scripts/setup-back-worktree.sh"

if [ ! -d "$ROOT_DIR/node_modules" ]; then
  echo "Instalando dependências do frontend..."
  npm --prefix "$ROOT_DIR" install
fi

# Kill any existing processes on the required ports to prevent EADDRINUSE
for PORT in 3000 5173; do
  PIDS=$(lsof -ti:"$PORT" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "Libertando porta $PORT (PID: $PIDS)..."
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 0.5
  fi
done

cleanup() {
  echo ""
  echo "Encerrando serviços..."
  if [ -n "${BACK_PID:-}" ] && kill -0 "$BACK_PID" 2>/dev/null; then
    kill "$BACK_PID" 2>/dev/null || true
  fi
  # Ensure ports are freed
  lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
  lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true
  echo "Serviços encerrados."
}

trap cleanup EXIT INT TERM

echo "Iniciando backend (develop) em background..."
APP_HOST=0.0.0.0 npm --prefix "$BACK_DIR" run dev &
BACK_PID=$!

sleep 2

echo "Iniciando frontend (feature/frontend-clean)..."
npm --prefix "$ROOT_DIR" run dev -- --host 0.0.0.0
