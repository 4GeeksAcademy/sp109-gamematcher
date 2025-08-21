#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install

# Build the frontend
npm run build

# Run database migrations
cd src
python -m flask db upgrade
cd ..
