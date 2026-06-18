#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Forge v1.3 — Instalador para Fedora / KDE
# Uso: git clone https://github.com/eacodemo/forge && cd forge && ./install.sh
# ──────────────────────────────────────────────────────────────────────────────
set -e
B="\033[1m"; G="\033[0;32m"; Y="\033[1;33m"; R="\033[0;31m"; N="\033[0m"

echo -e "${B}◈ Forge v1.3 — Instalador${N}"
echo "────────────────────────────────────"

# 1. Node.js
echo -e "\n${Y}[1/6]${N} Verificando Node.js..."
if ! command -v node &>/dev/null; then
  echo -e "${R}✗ Node.js no encontrado.${N}"
  echo "  Instala con: sudo dnf install nodejs npm"
  echo "  O con nvm: https://github.com/nvm-sh/nvm"; exit 1
fi
echo -e "${G}✓${N} Node.js $(node -v)"

# 2. Dependencias
echo -e "\n${Y}[2/6]${N} Instalando dependencias npm..."
npm install --silent
echo -e "${G}✓${N} Dependencias instaladas"

# 3. Fuentes offline
echo -e "\n${Y}[3/6]${N} Descargando fuentes (modo offline)..."
node scripts/download-fonts.js 2>/dev/null || echo "  (Las fuentes se cargarán desde internet como respaldo)"
echo -e "${G}✓${N} Fuentes listas"

# 4. Build
echo -e "\n${Y}[4/6]${N} Construyendo la app..."
npm run build
echo -e "${G}✓${N} Build completado"

# 5. Empaquetar
echo -e "\n${Y}[5/6]${N} Empaquetando AppImage..."
npx electron-builder --linux AppImage --publish never 2>/dev/null || \
  npx electron-builder --linux rpm --publish never 2>/dev/null || true

# 6. Instalar al sistema
echo -e "\n${Y}[6/6]${N} Instalando en el sistema..."
APPIMAGE=$(find dist-electron -name "*.AppImage" 2>/dev/null | head -1)
RPM=$(find dist-electron -name "*.rpm" 2>/dev/null | head -1)

if [ -n "$APPIMAGE" ]; then
  mkdir -p ~/.local/bin ~/.local/share/applications ~/.local/share/icons/hicolor/256x256/apps
  cp "$APPIMAGE" ~/.local/bin/forge
  chmod +x ~/.local/bin/forge

  # KDE .desktop entry
  cat > ~/.local/share/applications/forge.desktop << DESKTOP
[Desktop Entry]
Name=Forge
GenericName=Habit Tracker
Comment=Tracker de hábitos diarios
Exec=$HOME/.local/bin/forge
Icon=forge
Terminal=false
Type=Application
Categories=Utility;Office;
StartupWMClass=forge
Keywords=habits;habitos;tracker;productivity;
DESKTOP

  [ -f "public/icon.png" ] && cp public/icon.png ~/.local/share/icons/hicolor/256x256/apps/forge.png
  update-desktop-database ~/.local/share/applications 2>/dev/null || true
  kbuildsycoca6 2>/dev/null || kbuildsycoca5 2>/dev/null || true  # KDE cache

  echo -e "\n${B}────────────────────────────────────────────${N}"
  echo -e "${G}✓ Forge instalado correctamente${N}"
  echo ""
  echo "  Abre la app desde:"
  echo "  • Menú de aplicaciones de KDE"
  echo "  • Terminal: forge"
  echo "  • La app corre en segundo plano (tray icon)"
  echo ""

elif [ -n "$RPM" ]; then
  echo "Instalando RPM (requiere sudo)..."
  sudo dnf install -y "$RPM"
  echo -e "${G}✓ Forge instalado via RPM${N}"
else
  echo -e "${R}No se pudo empaquetar. Prueba modo desarrollo:${N}"
  echo "  npm run electron:dev"; exit 1
fi
