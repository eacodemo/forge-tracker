#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Forge — Build local de paquetes (AppImage + RPM + DEB)
# Uso: ./scripts/build-packages.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

B="\033[1m"; G="\033[0;32m"; Y="\033[1;33m"; N="\033[0m"

log()  { echo -e "${B}◈${N} $*"; }
ok()   { echo -e "${G}✓${N} $*"; }
warn() { echo -e "${Y}⚠${N} $*"; }

echo -e "${B}◈ Forge — Build de paquetes${N}"
echo "────────────────────────────────────"
echo ""

# 1. Verificar Node.js
if ! command -v node &>/dev/null; then
  echo "Node.js no encontrado. Instala con:"
  echo "  Fedora:  sudo dnf install nodejs npm"
  echo "  Ubuntu:  sudo apt install nodejs npm"
  exit 1
fi
log "Node.js $(node -v)"

# 2. Dependencias
if [ ! -d "node_modules" ]; then
  log "Instalando dependencias..."
  npm install --silent
fi

# 3. Type check
log "Verificando tipos..."
npx tsc --noEmit

# 4. Tests
log "Ejecutando tests..."
npm test

# 5. Build frontend
log "Construyendo frontend..."
npm run build

# 6. Empaquetar
log "Generando paquetes (AppImage + RPM + DEB)..."
npx electron-builder --linux AppImage rpm deb --publish never

# 7. Resumen
echo ""
echo "────────────────────────────────────"
ok "Paquetes generados en dist-electron/:"
echo ""
ls -lh dist-electron/*.AppImage dist-electron/*.rpm dist-electron/*.deb 2>/dev/null || true
echo ""
