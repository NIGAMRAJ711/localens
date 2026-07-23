#!/bin/bash
# ════════════════════════════════════════════════════════════════
#  LocalLens — One-Command Setup & Launch Script
# ════════════════════════════════════════════════════════════════
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  ██╗      ██████╗  ██████╗ █████╗ ██╗     ██╗     ███████╗███╗   ██╗███████╗"
echo "  ██║     ██╔═══██╗██╔════╝██╔══██╗██║     ██║     ██╔════╝████╗  ██║██╔════╝"
echo "  ██║     ██║   ██║██║     ███████║██║     ██║     █████╗  ██╔██╗ ██║███████╗"
echo "  ██║     ██║   ██║██║     ██╔══██║██║     ██║     ██╔══╝  ██║╚██╗██║╚════██║"
echo "  ███████╗╚██████╔╝╚██████╗██║  ██║███████╗███████╗███████╗██║ ╚████║███████║"
echo "  ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝"
echo -e "${NC}"
echo -e "${GREEN}  🌍 Discover Local Guides & Hidden Gems${NC}"
echo "  ─────────────────────────────────────────────────────────────"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org (v18+)${NC}"
  exit 1
fi
NODE_VER=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VER}${NC}"

MODE=${1:-"dev"}
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT=$(node -e "const fs=require('fs'); const file='$ROOT_DIR/backend/.env'; let port=process.env.PORT||''; if(!port&&fs.existsSync(file)){const m=fs.readFileSync(file,'utf8').match(/^PORT=(.+)$/m); port=m?m[1].trim():'';} console.log(port||'5001')")

port_in_use() {
  node -e "const net=require('net'); const port=Number(process.argv[1]); const server=net.createServer(); server.once('error',()=>process.exit(0)); server.once('listening',()=>server.close(()=>process.exit(1))); server.listen(port,'0.0.0.0');" "$1"
}

# ─── BACKEND ─────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}📦 Setting up backend...${NC}"
cd "$ROOT_DIR/backend"

if [ ! -d "node_modules" ]; then
  echo "  Installing backend dependencies..."
  npm install --legacy-peer-deps --silent
fi

# Create data directory for JSON storage
mkdir -p data uploads

echo -e "${GREEN}✓ Backend ready${NC}"

# ─── FRONTEND ────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}🖥️  Setting up frontend...${NC}"
cd "$ROOT_DIR/frontend"

if [ ! -d "node_modules" ]; then
  echo "  Installing frontend dependencies..."
  npm install --silent
fi

if [ "$MODE" = "prod" ]; then
  echo "  Building for production..."
  npm run build
  echo -e "${GREEN}✓ Frontend built${NC}"
fi

# ─── LAUNCH ──────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}🚀 Launching LocalLens...${NC}"
echo "  ─────────────────────────────────────────────────────────────"

if [ "$MODE" = "prod" ]; then
  # Production: serve everything from backend
  cd "$ROOT_DIR/backend"
  echo -e "${GREEN}"
  echo "  ✅ App running at: http://localhost:$BACKEND_PORT"
  echo "  ✅ API health:     http://localhost:$BACKEND_PORT/health"
  echo -e "${NC}"
  node src/index.js
else
  # Development: run backend + frontend separately
  if port_in_use "$BACKEND_PORT"; then
    echo -e "${RED}Port $BACKEND_PORT is already in use.${NC}"
    echo "Stop the existing backend process, or change PORT in backend/.env."
    exit 1
  fi

  cd "$ROOT_DIR/backend"
  node src/index.js &
  BACKEND_PID=$!

  sleep 1

  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo -e "${RED}Backend failed to start.${NC}"
    exit 1
  fi

  echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

  cd "$ROOT_DIR/frontend"
  echo -e "${GREEN}"
  echo "  ╔════════════════════════════════════════════╗"
  echo "  ║  🌍 Frontend:  http://localhost:5173        ║"
  echo "  ║  🔌 API:       http://localhost:$BACKEND_PORT/api    ║"
  echo "  ║  💡 Health:    http://localhost:$BACKEND_PORT/health ║"
  echo "  ║                                              ║"
  echo "  ║  Press Ctrl+C to stop                        ║"
  echo "  ╚════════════════════════════════════════════╝"
  echo -e "${NC}"

  # Trap Ctrl+C to kill both
  trap "kill $BACKEND_PID 2>/dev/null; exit" INT TERM

  export VITE_API_PROXY_TARGET="http://localhost:$BACKEND_PORT"
  npm run dev
fi
