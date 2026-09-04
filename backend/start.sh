#!/bin/bash
# Run from the backend/ directory
set -e
cd "$(dirname "$0")"

if [ ! -f showroom.db ]; then
  echo "First run: seeding database..."
  python3 seed.py
fi

echo "Starting API server at http://localhost:8000"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
