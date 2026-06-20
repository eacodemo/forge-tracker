#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Forge — Instalador universal para Linux
# Detecta tu distro, descarga el paquete correcto y lo instala.
#
# Uso:
#   curl -sSL https://raw.githubusercontent.com/eacodemo/forge-tracker/main/install.sh | bash
#   wget -qO- https://raw.githubusercontent.com/eacodemo/forge-tracker/main/install.sh | bash
#
# O clonando el repo:
#   git clone https://github.com/eacodemo/forge-tracker.git && cd forge-tracker && ./install.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

B="\033[1m"; G="\033[0;32m"; Y="\033[1;33m"; R="\033[0;31m"; C="\033[0;36m"; N="\033[0m"

REPO="eacodemo/forge-tracker"
VERSION="1.3.1"
INSTALL_DIR="${HOME}/.local/bin"
APP_DIR="${HOME}/.local/share/applications"
ICON_DIR="${HOME}/.local/share/icons/hicolor/256x256/apps"
CONFIG_DIR="${HOME}/.config/forge"

log()  { echo -e "${B}◈${N} $*"; }
ok()   { echo -e "${G}✓${N} $*"; }
warn() { echo -e "${Y}⚠${N} $*"; }
err()  { echo -e "${R}✗${N} $*"; }

# ── Detectar distro ──────────────────────────────────────────────────────────
detect_distro() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO_ID="${ID:-unknown}"
    DISTRO_LIKE="${ID_LIKE:-}"
  else
    DISTRO_ID="unknown"
    DISTRO_LIKE=""
  fi
}

# ── Detectar arquitectura ────────────────────────────────────────────────────
detect_arch() {
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64|amd64)  ARCH="x86_64" ;;
    aarch64|arm64) ARCH="aarch64" ;;
    *)             ARCH="x86_64"; warn "Arquitectura no reconocida ($ARCH), usando x86_64" ;;
  esac
}

# ── Detectar gestor de paquetes ──────────────────────────────────────────────
detect_pkg_manager() {
  PKG_MANAGER=""
  PKG_INSTALL=""
  PKG_EXT=""

  case "$DISTRO_ID" in
    fedora|rhel|centos|rocky|alma|ol|nobara)
      if command -v dnf &>/dev/null; then
        PKG_MANAGER="dnf"
        PKG_INSTALL="sudo dnf install -y"
      elif command -v yum &>/dev/null; then
        PKG_MANAGER="yum"
        PKG_INSTALL="sudo yum install -y"
      fi
      PKG_EXT="rpm"
      ;;
    ubuntu|debian|linuxmint|pop|elementary|kali|raspbian)
      PKG_MANAGER="apt"
      PKG_INSTALL="sudo apt install -y"
      PKG_EXT="deb"
      ;;
    arch|manjaro|endeavouros|garuda)
      PKG_MANAGER="pacman"
      PKG_INSTALL="sudo pacman -S --noconfirm"
      PKG_EXT="appimage"
      ;;
    opensuse*|suse|sles)
      PKG_MANAGER="zypper"
      PKG_INSTALL="sudo zypper install -y"
      PKG_EXT="rpm"
      ;;
    *)
      if echo "$DISTRO_LIKE" | grep -qi "debian\|ubuntu"; then
        PKG_MANAGER="apt"
        PKG_INSTALL="sudo apt install -y"
        PKG_EXT="deb"
      elif echo "$DISTRO_LIKE" | grep -qi "fedora\|rhel"; then
        if command -v dnf &>/dev/null; then
          PKG_MANAGER="dnf"
          PKG_INSTALL="sudo dnf install -y"
        else
          PKG_MANAGER="yum"
          PKG_INSTALL="sudo yum install -y"
        fi
        PKG_EXT="rpm"
      fi
      ;;
  esac
}

# ── Verificar herramientas ───────────────────────────────────────────────────
check_tools() {
  local missing=()
  command -v curl &>/dev/null || command -v wget &>/dev/null || missing+=("curl o wget")
  command -v tar &>/dev/null   || missing+=("tar")

  if [ ${#missing[@]} -gt 0 ]; then
    err "Faltan herramientas: ${missing[*]}"
    echo "  Instálalas con tu gestor de paquetes."
    exit 1
  fi
}

# ── Descargar archivo ────────────────────────────────────────────────────────
download() {
  local url="$1"
  local dest="$2"

  if command -v curl &>/dev/null; then
    curl -fSL --progress-bar -o "$dest" "$url"
  else
    wget -q --show-progress -O "$dest" "$url"
  fi
}

# ── Instalar paquete del sistema ─────────────────────────────────────────────
install_system_package() {
  local pkg_file="$1"

  if [ -z "$PKG_INSTALL" ]; then
    err "No se detectó un gestor de paquetes compatible."
    echo "  Distro: $DISTRO_ID"
    echo "  Puedes instalar manualmente desde: https://github.com/$REPO/releases"
    exit 1
  fi

  log "Instalando paquete $PKG_EXT con $PKG_MANAGER..."
  $PKG_INSTALL "$pkg_file"
}

# ── Instalar AppImage manualmente ────────────────────────────────────────────
install_appimage() {
  local appimage_file="$1"

  log "Instalando AppImage manualmente..."
  mkdir -p "$INSTALL_DIR" "$APP_DIR" "$ICON_DIR"

  cp "$appimage_file" "$INSTALL_DIR/forge"
  chmod +x "$INSTALL_DIR/forge"

  cat > "$APP_DIR/forge.desktop" << DESKTOP
[Desktop Entry]
Name=Forge
GenericName=Habit Tracker
Comment=Tracker de hábitos diarios
Exec=$INSTALL_DIR/forge
Icon=forge
Terminal=false
Type=Application
Categories=Utility;Office;
StartupWMClass=forge
Keywords=habits;habitos;tracker;productivity;
DESKTOP

  update-desktop-database "$APP_DIR" 2>/dev/null || true
  ok "AppImage instalado en $INSTALL_DIR/forge"
}

# ── Verificar instalación ────────────────────────────────────────────────────
verify_install() {
  local installed=false

  case "$PKG_EXT" in
    rpm)
      if rpm -q forge &>/dev/null 2>&1; then
        installed=true
      fi
      ;;
    deb)
      if dpkg -l forge 2>/dev/null | grep -q "^ii"; then
        installed=true
      fi
      ;;
    appimage)
      if [ -x "$INSTALL_DIR/forge" ]; then
        installed=true
      fi
      ;;
  esac

  if $installed; then
    ok "Forge instalado correctamente"
  else
    warn "La instalación pudo haber tenido problemas. Verifica manualmente."
  fi
}

# ── Mostrar instrucciones post-instalación ────────────────────────────────────
post_install() {
  echo ""
  echo -e "${B}────────────────────────────────────────────${N}"
  echo -e "${G}✓ Forge instalado correctamente${N}"
  echo ""
  echo "  Abre la app desde:"
  echo "  • Menú de aplicaciones"
  echo "  • Terminal: forge"
  echo ""
  echo "  La app corre en segundo plano (tray icon)."
  echo ""
  echo -e "  Documentación: ${C}https://github.com/$REPO${N}"
  echo -e "${B}────────────────────────────────────────────${N}"
}

# ── Build from source (fallback) ─────────────────────────────────────────────
build_from_source() {
  log "No hay paquete pre-compilado para $DISTRO_ID ($ARCH)"
  log "Construyendo desde el código fuente..."

  if ! command -v node &>/dev/null; then
    err "Node.js no encontrado."
    echo "  Instala con:"
    echo "    Fedora:  sudo dnf install nodejs npm"
    echo "    Ubuntu:  sudo apt install nodejs npm"
    echo "    Arch:    sudo pacman -S nodejs npm"
    echo "    O usa nvm: https://github.com/nvm-sh/nvm"
    exit 1
  fi

  log "Node.js $(node -v) encontrado"

  if [ ! -d "node_modules" ]; then
    log "Instalando dependencias npm..."
    npm install --silent
  fi

  log "Construyendo la app..."
  npm run build

  log "Empaquetando..."
  if npx electron-builder --linux "$PKG_EXT" --publish never 2>/dev/null; then
    local pkg
    pkg=$(find dist-electron -name "*.$PKG_EXT" 2>/dev/null | head -1)
    if [ -n "$pkg" ]; then
      install_system_package "$pkg"
      return 0
    fi
  fi

  warn "No se pudo empaquetar como $PKG_EXT"
  if npx electron-builder --linux AppImage --publish never 2>/dev/null; then
    local appimage
    appimage=$(find dist-electron -name "*.AppImage" 2>/dev/null | head -1)
    if [ -n "$appimage" ]; then
      install_appimage "$appimage"
      return 0
    fi
  fi

  err "No se pudo construir la app. Intenta modo desarrollo: npm run electron:dev"
  exit 1
}

# ── Main ─────────────────────────────────────────────────────────────────────
main() {
  echo ""
  echo -e "${B}◈ Forge v${VERSION} — Instalador universal${N}"
  echo "────────────────────────────────────"
  echo ""

  detect_distro
  detect_arch
  detect_pkg_manager
  check_tools

  log "Distro: ${C}$DISTRO_ID${N} | Arquitectura: ${C}$ARCH${N} | Paquete: ${C}$PKG_EXT${N}"

  # Si estamos en el repositorio clonado, intentar build from source
  if [ -f "package.json" ] && [ -d "src" ]; then
    echo ""
    log "Detectado código fuente local. Construyendo desde source..."
    build_from_source
    post_install
    return
  fi

  # Descargar paquete desde GitHub Releases
  local base_url="https://github.com/$REPO/releases/download/v${VERSION}"
  local pkg_name="forge-${VERSION}.${PKG_EXT}"
  local pkg_url="${base_url}/${pkg_name}"
  local tmp_dir
  tmp_dir=$(mktemp -d)

  echo ""
  log "Descargando ${C}${pkg_name}${N}..."

  if ! download "$pkg_url" "$tmp_dir/$pkg_name" 2>/dev/null; then
    warn "No se encontró el paquete $PKG_EXT en GitHub Releases."
    warn "Puede que aún no esté disponible para esta versión."
    echo ""
    log "Intentando build from source como alternativa..."
    build_from_source
    post_install
    return
  fi

  ok "Paquete descargado"

  if [ "$PKG_EXT" = "appimage" ]; then
    install_appimage "$tmp_dir/$pkg_name"
  else
    install_system_package "$tmp_dir/$pkg_name"
  fi

  verify_install
  post_install

  rm -rf "$tmp_dir"
}

main "$@"
