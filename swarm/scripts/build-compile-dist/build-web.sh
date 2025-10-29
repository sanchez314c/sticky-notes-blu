#!/bin/bash

# 🌐 BUILD-WEB - Web Application Builder
# Builds and optimizes web applications
# NO HARD-CODED PATHS!

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

# Dynamic paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
APP_PATH="${1:-.}"

# Options
MODE="${2:---production}"
OPTIMIZE="${3:---optimize}"

# Get absolute path
APP_PATH="$(cd "$APP_PATH" && pwd)"

echo -e "${BOLD}${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${PURPLE}║            🌐 WEB BUILDER - OPTIMIZER v2.0 🌐              ║${NC}"
echo -e "${BOLD}${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📁 Project:${NC} $APP_PATH"
echo -e "${CYAN}🎯 Mode:${NC} $MODE"
echo -e "${CYAN}⚡ Optimize:${NC} $OPTIMIZE"
echo ""

cd "$APP_PATH"

# Detect framework
FRAMEWORK="vanilla"
BUILD_CMD=""

if [[ -f "package.json" ]]; then
    # Check for various frameworks
    if grep -q '"react"' package.json; then
        FRAMEWORK="react"
        if grep -q '"next"' package.json; then
            FRAMEWORK="nextjs"
            BUILD_CMD="npm run build"
        elif grep -q '"react-scripts"' package.json; then
            FRAMEWORK="create-react-app"
            BUILD_CMD="npm run build"
        else
            BUILD_CMD="npm run build"
        fi
    elif grep -q '"vue"' package.json; then
        FRAMEWORK="vue"
        if grep -q '"nuxt"' package.json; then
            FRAMEWORK="nuxt"
            BUILD_CMD="npm run build"
        else
            BUILD_CMD="npm run build"
        fi
    elif grep -q '"@angular"' package.json; then
        FRAMEWORK="angular"
        BUILD_CMD="ng build --prod"
    elif grep -q '"svelte"' package.json; then
        FRAMEWORK="svelte"
        BUILD_CMD="npm run build"
    fi
    
    # Check for build script
    if [[ -z "$BUILD_CMD" ]] && grep -q '"build"' package.json; then
        BUILD_CMD="npm run build"
    fi
fi

echo -e "${CYAN}🎮 Framework:${NC} $FRAMEWORK"
echo ""

# Install dependencies if needed
if [[ -f "package.json" ]] && [[ ! -d "node_modules" ]]; then
    echo -e "${CYAN}📦 Installing dependencies...${NC}"
    if [[ -f "yarn.lock" ]]; then
        yarn install
    elif [[ -f "pnpm-lock.yaml" ]]; then
        pnpm install
    else
        npm install
    fi
fi

# Build based on framework
if [[ -n "$BUILD_CMD" ]]; then
    echo -e "${BOLD}${CYAN}🚀 Building with: $BUILD_CMD${NC}"
    eval "$BUILD_CMD"
else
    echo -e "${CYAN}📦 No build step required for vanilla HTML/CSS/JS${NC}"
    
    # Create dist directory
    mkdir -p dist
    
    # Copy files
    echo -e "${CYAN}📂 Copying files to dist...${NC}"
    cp -r *.html *.css *.js dist/ 2>/dev/null || true
    [[ -d "assets" ]] && cp -r assets dist/
    [[ -d "images" ]] && cp -r images dist/
    [[ -d "fonts" ]] && cp -r fonts dist/
fi

# Optimization
if [[ "$OPTIMIZE" == "--optimize" ]]; then
    echo -e "${CYAN}⚡ Optimizing build...${NC}"
    
    # Find dist directory
    DIST_DIR="dist"
    [[ -d "build" ]] && DIST_DIR="build"
    [[ -d "out" ]] && DIST_DIR="out"
    [[ -d ".next" ]] && DIST_DIR=".next"
    
    # Minify HTML
    if command -v html-minifier &> /dev/null; then
        find "$DIST_DIR" -name "*.html" -exec html-minifier {} -o {} \;
        echo -e "${GREEN}  ✓ HTML minified${NC}"
    fi
    
    # Minify CSS
    if command -v csso &> /dev/null; then
        find "$DIST_DIR" -name "*.css" -exec csso {} -o {} \;
        echo -e "${GREEN}  ✓ CSS minified${NC}"
    fi
    
    # Minify JS (if not already minified)
    if command -v terser &> /dev/null; then
        find "$DIST_DIR" -name "*.js" ! -name "*.min.js" -exec terser {} -o {} -c -m \;
        echo -e "${GREEN}  ✓ JavaScript minified${NC}"
    fi
    
    # Optimize images
    if command -v imagemin &> /dev/null; then
        echo -e "${CYAN}  Optimizing images...${NC}"
        # imagemin optimization would go here
    fi
fi

# Generate service worker for PWA
if [[ ! -f "sw.js" ]] && [[ ! -f "service-worker.js" ]]; then
    echo -e "${CYAN}📡 Generating service worker...${NC}"
    cat > "dist/sw.js" <<'EOF'
// Basic service worker for offline support
const CACHE_NAME = 'app-v1';
const urlsToCache = ['/', '/index.html', '/styles.css', '/script.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
EOF
fi

# Create deployment script
echo -e "${CYAN}🚀 Creating deployment script...${NC}"
cat > "dist/deploy.sh" <<'EOF'
#!/bin/bash
# Simple deployment script
echo "Deployment options:"
echo "1. GitHub Pages: git subtree push --prefix dist origin gh-pages"
echo "2. Netlify: netlify deploy --prod --dir=dist"
echo "3. Vercel: vercel --prod"
echo "4. Surge: surge dist"
EOF
chmod +x dist/deploy.sh

# Summary
echo ""
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}                  ✅ WEB BUILD COMPLETE                        ${NC}"
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Find the actual dist directory
DIST_DIR="dist"
[[ -d "build" ]] && DIST_DIR="build"
[[ -d "out" ]] && DIST_DIR="out"

echo -e "${CYAN}📁 Output Directory:${NC} $DIST_DIR/"
echo -e "${CYAN}📈 Build Size:${NC} $(du -sh "$DIST_DIR" | cut -f1)"
echo ""
echo -e "${CYAN}🌐 Serve locally:${NC}"
echo "  npx serve $DIST_DIR"
echo "  python3 -m http.server -d $DIST_DIR"
echo ""
echo -e "${CYAN}🚀 Deploy:${NC} ./$DIST_DIR/deploy.sh"
echo ""

exit 0