#!/usr/bin/env bash
# Build script for Replit deployment
set -e

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Applying database migrations..."
python manage.py migrate --noinput

echo "==> Build complete!"
