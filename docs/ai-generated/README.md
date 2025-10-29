# 🎯 StickyNotes - Modern Dark-Mode Notes for macOS

A simple, clean, modern dark-mode Electron/Node.js StickyNotes app for macOS that floats sticky notes right on your desktop.

## ✨ Features

- **Dark Mode First**: Beautiful dark-themed sticky notes with 16 gradient color options
- **Floating Windows**: Notes float above other windows, always accessible
- **Auto-Save**: Notes save automatically as you type
- **Multi-Note Support**: Create unlimited sticky notes
- **Customizable Colors**: Choose from 16 beautiful gradient themes
- **Keyboard Shortcuts**: 
  - `⌘+N` - New note
  - `⌘+S` - Save immediately  
  - `⌘+W` - Close note
  - `Escape` - Close color picker
- **System Tray Integration**: Quick access from menu bar
- **Persistent Storage**: Notes remember their position, size, and content

## 🚀 Quick Start

### Run from Source (Development)
```bash
# macOS
./scripts/run-macos-source.sh

# Windows
scripts\run-windows-source.bat

# Linux
./scripts/run-linux-source.sh
```

### Build & Run Compiled Version
```bash
# Build for all platforms
./scripts/compile-build-dist.sh

# Run compiled version
# macOS
./scripts/run-macos.sh

# Windows
scripts\run-windows.bat

# Linux
./scripts/run-linux.sh
```

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Install Dependencies
```bash
npm install
```

### Development
```bash
npm start
```

### Build Installers
```bash
# All platforms
npm run dist

# Platform-specific
npm run dist:mac    # macOS only
npm run dist:win    # Windows only  
npm run dist:linux  # Linux only
```

## 🏗️ Project Structure

```
stickynotes/
├── main.js           # Main Electron process
├── preload.js        # Preload script for security
├── renderer.js       # Frontend JavaScript
├── index.html        # Note UI
├── package.json      # Dependencies and scripts
├── resources/        # App icons and resources
│   └── entitlements.mac.plist
└── scripts/          # Build and run scripts
    ├── compile-build-dist.sh
    ├── run-macos.sh
    ├── run-macos-source.sh
    ├── run-windows.bat
    ├── run-windows-source.bat
    ├── run-linux.sh
    └── run-linux-source.sh
```

## 🎨 Available Color Themes

- Purple Gradient (Default)
- Pink Gradient
- Blue Gradient
- Green Gradient
- Orange Gradient
- Navy Gradient
- Pastel Pink
- Rose Gold
- Lavender
- Pearl
- Sky Blue
- Cream
- Dark Mode
- Light Mode
- Gold
- Silver

## 🔧 Configuration

Notes are automatically saved to:
- **macOS**: `~/Library/Application Support/stickynotes/`
- **Windows**: `%APPDATA%/stickynotes/`
- **Linux**: `~/.config/stickynotes/`

## 🎯 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + N` | New sticky note |
| `⌘/Ctrl + S` | Save immediately |
| `⌘/Ctrl + W` | Close current note |
| `⌘/Ctrl + Q` | Quit application |
| `Escape` | Close color picker |

## 📱 System Requirements

- **macOS**: 10.14+ (Mojave or later)
- **Windows**: Windows 10/11
- **Linux**: Ubuntu 18.04+, Fedora 32+, Debian 10+

## 🛠️ Built With

- **Electron** 33.0.2 - Desktop framework
- **Node.js** 20.18.0 - JavaScript runtime
- **electron-store** - Persistent data storage
- **electron-builder** - Build and packaging

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Known Issues

- Tray icon placeholder needs proper icon file
- Multi-display positioning may need refinement

## 🚀 Future Enhancements

- [ ] Rich text formatting
- [ ] Markdown support
- [ ] Cloud sync
- [ ] Search across all notes
- [ ] Tags and categories
- [ ] Reminders and alarms
- [ ] Export to various formats
- [ ] Collaboration features

---

**Built with the SWARM Framework** - AI-orchestrated development for rapid, high-quality applications.