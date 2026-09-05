#!/bin/bash
set -e

echo "=== Building Chess Play Production Bundles ==="

# Build app (app.chessplay.in)
echo "Building apps/app..."
cd apps/app
npm run build
cd ../..

# Build marketing web (chessplay.in)
echo "Building apps/web..."
cd apps/web
npm run build
cd ../..

# Create deploy package archives
mkdir -p deploy/dist_packages

echo "Packaging app.chessplay.in..."
cd apps/app/dist
zip -r ../../../deploy/dist_packages/app_chessplay_in.zip .
cd ../../..

echo "Packaging chessplay.in..."
cd apps/web/dist
zip -r ../../../deploy/dist_packages/chessplay_in_marketing.zip .
cd ../../..

echo ""
echo "=== Packaging Complete! ==="
echo "Artifacts ready in deploy/dist_packages/:"
echo "1. deploy/dist_packages/app_chessplay_in.zip -> Upload to Hostinger app.chessplay.in document root"
echo "2. deploy/dist_packages/chessplay_in_marketing.zip -> Upload to Hostinger chessplay.in public_html"
