#!/usr/bin/env bash
# Build script for deployment (Render / Replit / etc.)
set -e

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

# Build the frontend only if Node/npm is available AND a build is not already present.
# On platforms without Node (e.g. Render's Python runtime), the committed
# frontend/dist is used instead.
if command -v npm >/dev/null 2>&1; then
  echo "==> Node detected, building frontend..."
  cd frontend
  npm install
  npm run build
  cd ..
else
  echo "==> npm not found, using pre-built frontend/dist (committed to repo)."
fi

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Applying database migrations..."
python manage.py migrate --noinput

echo "==> Build complete!"
