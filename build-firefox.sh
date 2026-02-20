#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$ROOT_DIR/dist"
BUILD_DIR="$ROOT_DIR/.build/firefox"
VERSION="$(jq -r '.version' "$ROOT_DIR/manifest.firefox.json")"
PKG_BASE="TwineForge-firefox-v${VERSION}"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR"

# Copy extension files except manifests and local build artifacts.
rsync -a \
  --exclude '.git' \
  --exclude '.build' \
  --exclude 'dist' \
  --exclude 'manifest.json' \
  --exclude 'manifest.firefox.json' \
  --exclude '*.xpi' \
  --exclude '*.zip' \
  "$ROOT_DIR/" "$BUILD_DIR/"

# Firefox package must contain manifest.json at root.
cp "$ROOT_DIR/manifest.firefox.json" "$BUILD_DIR/manifest.json"

(
  cd "$BUILD_DIR"
  zip -qr "$DIST_DIR/${PKG_BASE}.xpi" .
  zip -qr "$DIST_DIR/${PKG_BASE}.zip" .
)

echo "Built:"
echo " - $DIST_DIR/${PKG_BASE}.xpi"
echo " - $DIST_DIR/${PKG_BASE}.zip"
