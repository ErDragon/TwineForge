#!/usr/bin/env bash
set -euo pipefail

# Prepare a Firefox-friendly bundle with a MV2 manifest.
# Output: dist/firefox/ containing manifest.json and required assets.

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$ROOT_DIR/dist/firefox"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cp "$ROOT_DIR/manifest.firefox.json" "$OUT_DIR/manifest.json"
cp "$ROOT_DIR/background-firefox.js" "$OUT_DIR/"
cp "$ROOT_DIR"/twinehacker.{js,css} "$ROOT_DIR"/show-custom-globals.js "$ROOT_DIR"/load-customglobals.js "$ROOT_DIR/index.html" "$OUT_DIR/"
cp -r "$ROOT_DIR/Icons" "$ROOT_DIR/Skins" "$OUT_DIR/"

echo "Firefox bundle created at $OUT_DIR"
