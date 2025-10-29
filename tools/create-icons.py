#!/usr/bin/env python3
"""
Creates dark sticky note icons for the Electron app
Generates PNG, ICO, and data for ICNS formats
"""

import base64
import struct
import os

# Base64 encoded 16x16 dark sticky note icon (PNG format)
# This is a minimal dark sticky note icon with purple gradient
PNG_16_DATA = b'''iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ
bWFnZVJlYWR5ccllPAAAAKxJREFUeNpi/P//PwMlgImBQjDwBrAwUOh5BgYGBkYGBgbG////MzAy
MjLev3+fAZ9mJiYmhu/fvzN8+/aNgZGRkQEXYPn//z8jNjabNm1i2Lx5M8OPHz8YcAGQZpCBIABS
g6wZBljwacamGRdgIVYzIYDVAKDT8IKRaBuwGgBy2qNHjxh+/frFwM3NzeDi4sLAysrKgA+ADAQZ
hAuwEKuZECDZBQwMDAgBAwIAjrQqv8nTW9QAAAAASUVORK5CYII='''

def create_directory_structure():
    """Create necessary directories for icons"""
    os.makedirs('icons', exist_ok=True)

def write_png_file(filename, size, base_data=None):
    """Write a PNG file with specified size"""
    if base_data:
        # Decode and write the provided PNG data
        with open(filename, 'wb') as f:
            f.write(base64.b64decode(base_data))
    else:
        # Create a simple PNG programmatically
        # PNG header and IHDR chunk for a simple colored square
        width = height = size
        
        # PNG signature
        png_signature = b'\x89PNG\r\n\x1a\n'
        
        # IHDR chunk
        ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
        ihdr_crc = 0x93B1A7A7  # Pre-calculated CRC for this IHDR
        ihdr_chunk = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
        
        # Create simple gradient image data (purple gradient)
        # This is simplified - real PNG needs proper filtering and compression
        idat_data = b''
        for y in range(height):
            idat_data += b'\x00'  # Filter type: None
            for x in range(width):
                # Create gradient from dark purple to lighter purple
                r = min(255, 102 + (x * 20 // width))
                g = min(255, 126 + (y * 20 // height))
                b = min(255, 234 - (x * 30 // width))
                idat_data += bytes([r, g, b])
        
        # Compress with zlib
        import zlib
        compressed = zlib.compress(idat_data, 9)
        idat_crc = zlib.crc32(b'IDAT' + compressed)
        idat_chunk = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc & 0xFFFFFFFF)
        
        # IEND chunk
        iend_chunk = b'\x00\x00\x00\x00IEND\xae\x42\x60\x82'
        
        # Write complete PNG file
        with open(filename, 'wb') as f:
            f.write(png_signature + ihdr_chunk + idat_chunk + iend_chunk)

def create_ico_file():
    """Create a Windows ICO file with multiple resolutions"""
    ico_sizes = [16, 32, 48, 64, 128, 256]
    
    # ICO header
    ico_header = struct.pack('<HHH', 0, 1, len(ico_sizes))  # Reserved, Type=1 (ICO), Count
    
    # Calculate offsets for each image
    offset = 6 + (16 * len(ico_sizes))  # Header + directory entries
    directory_entries = b''
    image_data = b''
    
    for size in ico_sizes:
        # Create simple PNG data for this size
        png_file = f'icons/{size}x{size}.png'
        if not os.path.exists(png_file):
            write_png_file(png_file, size)
        
        # Read the PNG data
        with open(png_file, 'rb') as f:
            png_data = f.read()
        
        # ICO directory entry
        width = size if size < 256 else 0  # 0 means 256 in ICO format
        height = width
        directory_entries += struct.pack('<BBBBHHII',
            width,      # Width
            height,     # Height
            0,          # Color palette
            0,          # Reserved
            1,          # Color planes
            32,         # Bits per pixel
            len(png_data),  # Size of image data
            offset      # Offset to image data
        )
        
        image_data += png_data
        offset += len(png_data)
    
    # Write ICO file
    with open('icon.ico', 'wb') as f:
        f.write(ico_header + directory_entries + image_data)
    
    print("✅ Created icon.ico")

def create_icns_structure():
    """Create iconset directory structure for macOS ICNS"""
    iconset_dir = 'icon.iconset'
    os.makedirs(iconset_dir, exist_ok=True)
    
    # ICNS requires specific sizes and naming
    icns_sizes = [
        (16, 'icon_16x16.png'),
        (32, 'icon_16x16@2x.png'),
        (32, 'icon_32x32.png'),
        (64, 'icon_32x32@2x.png'),
        (128, 'icon_128x128.png'),
        (256, 'icon_128x128@2x.png'),
        (256, 'icon_256x256.png'),
        (512, 'icon_256x256@2x.png'),
        (512, 'icon_512x512.png'),
        (1024, 'icon_512x512@2x.png'),
    ]
    
    for size, filename in icns_sizes:
        filepath = os.path.join(iconset_dir, filename)
        write_png_file(filepath, size)
    
    print(f"✅ Created {iconset_dir}/ with all required sizes")
    print("   Run 'iconutil -c icns icon.iconset -o icon.icns' on macOS to generate ICNS")

def create_linux_icons():
    """Create PNG icons in various sizes for Linux"""
    sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024]
    
    for size in sizes:
        filename = f'icons/{size}x{size}.png'
        write_png_file(filename, size, PNG_16_DATA if size == 16 else None)
        print(f"✅ Created {filename}")

def main():
    """Main function to generate all icon formats"""
    print("🎨 Generating dark sticky note icons...")
    print("=" * 50)
    
    # Create directories
    create_directory_structure()
    
    # Generate Linux PNG icons
    print("\n📱 Creating PNG icons for Linux...")
    create_linux_icons()
    
    # Generate Windows ICO
    print("\n🪟 Creating Windows ICO file...")
    create_ico_file()
    
    # Generate macOS iconset
    print("\n🍎 Creating macOS iconset...")
    create_icns_structure()
    
    print("\n" + "=" * 50)
    print("✅ Icon generation complete!")
    print("\nGenerated files:")
    print("  • icon.ico - Windows icon")
    print("  • icon.iconset/ - macOS icon directory")
    print("  • icons/*.png - Linux icons")
    print("\nNote: On macOS, run this command to create icon.icns:")
    print("  iconutil -c icns icon.iconset -o icon.icns")

if __name__ == "__main__":
    main()