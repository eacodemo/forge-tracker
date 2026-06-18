import { Component, type ReactNode, type ErrorInfo } from "react";
import Modal from "./Modal";

interface Props {
  children: ReactNode;
  name?: string;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
  nukeModalOpen: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, info: null, nukeModalOpen: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null, nukeModalOpen: false };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ info });
    console.error("[Forge] Component crash:", error, info?.componentStack);
  }

  handleReset = (): void => {
    this.setState({ error: null, info: null });
    if (this.props.name) console.warn(`[Forge] ErrorBoundary("${this.props.name}") reset`);
  };

  handleNuke = (): void => {
    this.setState({ nukeModalOpen: true });
  };

  handleNukeConfirm = (): void => {
    localStorage.clear();
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    const isDark = document.querySelector(".app")?.classList.contains("dark") ?? true;
    const bg     = isDark ? "#0f0f14" : "#f2f1f8";
    const card   = isDark ? "#1a1a22" : "#ffffff";
    const border = isDark ? "#2e2e44" : "#dddaf0";
    const fg     = isDark ? "#f0f0f5" : "#12111e";
    const fg3    = isDark ? "#60607a" : "#9896b2";
    const acc    = "#e63946";

    return (<>
      <div style={{
        minHeight: "100vh", background: bg, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}>
        <div style={{
          background: card, border: `1px solid ${border}`,
          borderRadius: 16, padding: 32, maxWidth: 480, width: "100%",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>

          <div style={{
            fontFamily: "'Syne', 'Segoe UI', sans-serif",
            fontSize: 20, fontWeight: 700, color: fg, marginBottom: 8,
          }}>
            Algo salió mal
          </div>

          <p style={{ color: fg3, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
            Forge encontró un error inesperado. Tus datos están seguros.
            Puedes intentar recuperarte o reiniciar la vista.
          </p>

          <details style={{
            background: isDark ? "#111118" : "#f4f3fc",
            border: `1px solid ${border}`,
            borderRadius: 8, padding: "8px 12px",
            marginBottom: 20, textAlign: "left",
          }}>
            <summary style={{ fontSize: 11, color: fg3, cursor: "pointer", fontFamily: "monospace" }}>
              Detalle técnico
            </summary>
            <pre style={{
              fontSize: 10, color: acc, marginTop: 8,
              whiteSpace: "pre-wrap", wordBreak: "break-all",
              fontFamily: "monospace", lineHeight: 1.5,
            }}>
              {this.state.error?.toString()}
              {this.state.info?.componentStack?.slice(0, 400)}
            </pre>
          </details>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: "9px 18px", borderRadius: 9, border: "none",
                background: acc, color: "#fff",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🔄 Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "9px 18px", borderRadius: 9,
                border: `1px solid ${border}`, background: "transparent",
                color: fg, fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              ↺ Recargar app
            </button>
            <button
              onClick={this.handleNuke}
              style={{
                padding: "9px 18px", borderRadius: 9, border: "none",
                background: "transparent", color: isDark ? "#fb7185" : "#dc2626",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              🗑 Limpiar datos
            </button>
          </div>
        </div>
      </div>

      <Modal open={this.state.nukeModalOpen}
        title="¿Borrar todos los datos?"
        message="Esta acción no se puede deshacer. Se eliminarán todos tus hábitos, checks y configuración."
        danger confirmLabel="Eliminar todo" cancelLabel="Cancelar"
        onConfirm={this.handleNukeConfirm}
        onCancel={() => this.setState({ nukeModalOpen: false })} />
    </>);
  }
}
