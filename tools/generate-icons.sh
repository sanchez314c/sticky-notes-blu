#!/bin/bash

# Icon Generation Script for StickyNotes
# This script generates all required icon formats from the base SVG

echo "🎨 Generating icons for all platforms..."

# Check for required tools
if ! command -v convert &> /dev/null && ! command -v magick &> /dev/null; then
    echo "⚠️  ImageMagick is not installed. Please install it first:"
    echo "    macOS: brew install imagemagick"
    echo "    Linux: sudo apt-get install imagemagick"
    echo "    Windows: Download from https://imagemagick.org"
    exit 1
fi

# Use magick or convert command based on availability
CONVERT_CMD="convert"
if command -v magick &> /dev/null; then
    CONVERT_CMD="magick"
fi

# Create icons directory if it doesn't exist
mkdir -p icons

# Generate PNG icons in various sizes for Linux
echo "📱 Generating PNG icons..."
for size in 16 24 32 48 64 128 256 512 1024; do
    echo "  Creating ${size}x${size}.png..."
    $CONVERT_CMD -background none icon.svg -resize ${size}x${size} icons/${size}x${size}.png
done

# Generate Windows ICO file (multi-resolution)
echo "🪟 Generating Windows ICO..."
$CONVERT_CMD -background none icon.svg -define icon:auto-resize=16,24,32,48,64,128,256 icon.ico

# Generate macOS ICNS file
echo "🍎 Generating macOS ICNS..."

# Create iconset directory
mkdir -p icon.iconset

# Generate required sizes for macOS
$CONVERT_CMD -background none icon.svg -resize 16x16     icon.iconset/icon_16x16.png
$CONVERT_CMD -background none icon.svg -resize 32x32     icon.iconset/icon_16x16@2x.png
$CONVERT_CMD -background none icon.svg -resize 32x32     icon.iconset/icon_32x32.png
$CONVERT_CMD -background none icon.svg -resize 64x64     icon.iconset/icon_32x32@2x.png
$CONVERT_CMD -background none icon.svg -resize 128x128   icon.iconset/icon_128x128.png
$CONVERT_CMD -background none icon.svg -resize 256x256   icon.iconset/icon_128x128@2x.png
$CONVERT_CMD -background none icon.svg -resize 256x256   icon.iconset/icon_256x256.png
$CONVERT_CMD -background none icon.svg -resize 512x512   icon.iconset/icon_256x256@2x.png
$CONVERT_CMD -background none icon.svg -resize 512x512   icon.iconset/icon_512x512.png
$CONVERT_CMD -background none icon.svg -resize 1024x1024 icon.iconset/icon_512x512@2x.png

# Convert to ICNS (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    iconutil -c icns icon.iconset -o icon.icns
    rm -rf icon.iconset
else
    echo "  ⚠️  ICNS generation requires macOS. Iconset created in icon.iconset/"
fi

echo "✅ Icon generation complete!"
echo ""
echo "Generated files:"
echo "  • icon.ico - Windows icon"
echo "  • icon.icns - macOS icon (if on macOS)"
echo "  • icons/*.png - Linux icons (multiple sizes)"
echo ""
echo "These icons are now ready for use with electron-builder!"