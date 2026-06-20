import { Component, type ReactNode, type ErrorInfo } from "react";
import Modal from "./Modal";
import { LANGS } from "../i18n/translations";

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

    const root = document.querySelector(".app");
    const cs = root ? getComputedStyle(root) : null;
    const bg     = cs?.getPropertyValue("--bg")?.trim()     || "#0f0f14";
    const card   = cs?.getPropertyValue("--sf")?.trim()     || "#1a1a22";
    const border = cs?.getPropertyValue("--bdr")?.trim()    || "#2e2e44";
    const fg     = cs?.getPropertyValue("--fg")?.trim()     || "#f0f0f5";
    const fg3    = cs?.getPropertyValue("--fg3")?.trim()    || "#60607a";
    const acc    = cs?.getPropertyValue("--acc")?.trim()    || "#e63946";

    let lang = "es";
    try { lang = JSON.parse(localStorage.getItem("forge_v131") || "{}").profile?.lang || "es"; } catch {}
    const EB = (LANGS[lang] || LANGS.es).errorBoundary;

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
            {EB.title}
          </div>

          <p style={{ color: fg3, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
            {EB.message}
          </p>

          <details style={{
            background: cs?.getPropertyValue("--sf4")?.trim() || "#111118",
            border: `1px solid ${border}`,
            borderRadius: 8, padding: "8px 12px",
            marginBottom: 20, textAlign: "left",
          }}>
            <summary style={{ fontSize: 11, color: fg3, cursor: "pointer", fontFamily: "monospace" }}>
              {EB.detail}
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
              🔄 {EB.retry}
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
              ↺ {EB.reload}
            </button>
            <button
              onClick={this.handleNuke}
              style={{
                padding: "9px 18px", borderRadius: 9, border: "none",
                background: "transparent", color: "var(--red,#fb7185)",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                fontWeight: 600, cursor: "pointer",
              }}
            >
              🗑 {EB.nuke}
            </button>
          </div>
        </div>
      </div>

      <Modal open={this.state.nukeModalOpen}
        title={EB.nukeTitle}
        message={EB.nukeMessage}
        danger confirmLabel={EB.confirmLabel} cancelLabel={EB.cancelLabel}
        onConfirm={this.handleNukeConfirm}
        onCancel={() => this.setState({ nukeModalOpen: false })} />
    </>);
  }
}
