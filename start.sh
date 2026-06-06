#!/usr/bin/env bash
# Start script for Replit (dev "Run" button and deployment)
set -e

# Ensure migrations are applied (safe to run repeatedly)
python manage.py migrate --noinput

# If the frontend hasn't been built yet (first run), build it
if [ ! -f "frontend/dist/index.html" ]; then
  echo "==> Frontend build not found, building now..."
  cd frontend && npm install && npm run build && cd ..
fi

# Collect static (frontend assets + admin/DRF)
python manage.py collectstatic --noinput

# Launch with gunicorn (production WSGI server)
exec gunicorn school_crm.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 3 \
  --timeout 120
