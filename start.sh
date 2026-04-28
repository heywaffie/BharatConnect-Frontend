#!/usr/bin/env bash

set -u

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not in PATH."
  exit 1
fi

if ! command -v mvn >/dev/null 2>&1; then
  echo "Error: Maven (mvn) is not installed or not in PATH."
  exit 1
fi

cleanup() {
  echo
  echo "Stopping services..."

  if [[ -n "${FRONTEND_PID:-}" ]] && kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi

  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup INT TERM EXIT

echo "Starting backend on http://localhost:8081 ..."
(
  cd "$BACKEND_DIR" || exit 1
  mvn spring-boot:run
) &
BACKEND_PID=$!

echo "Starting frontend on http://localhost:5173 ..."
(
  cd "$ROOT_DIR" || exit 1
  npm run dev
) &
FRONTEND_PID=$!

echo
echo "Services started."
echo "Frontend PID: $FRONTEND_PID"
echo "Backend PID:  $BACKEND_PID"
echo "Press Ctrl+C to stop both."
echo

wait "$FRONTEND_PID" "$BACKEND_PID"
