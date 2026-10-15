"use client";

import { useEffect } from "react";

/**
 * Error de nivel raiz (HTTP 500). Reemplaza el layout raiz, por eso renderiza su
 * propio <html>/<body> y no puede depender de contextos (LanguageContext no
 * existe aca). Se usan estilos inline a proposito: si el error rompio el layout,
 * el CSS global podria no estar cargado. El mensaje va en ingles y espanol.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  useEffect(() => {
    console.error("Root error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#F5F7FA",
          color: "#1A1C1E",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
            <h1
              style={{
                fontSize: 96,
                margin: 0,
                lineHeight: 1,
                color: "#025689",
                fontWeight: 800,
              }}
            >
              500
            </h1>
            <h2 style={{ fontSize: 24, margin: "16px 0 8px" }}>
              Something went wrong / Algo salió mal
            </h2>
            <p style={{ color: "#5A5F63", margin: "0 0 4px" }}>
              An unexpected error occurred. Please try again.
            </p>
            <p style={{ color: "#5A5F63", margin: "0 0 28px" }}>
              Ocurrió un error inesperado. Inténtalo de nuevo.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={reset}
                style={{
                  padding: "12px 24px",
                  borderRadius: 999,
                  border: "none",
                  background: "#025689",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Reintentar / Try again
              </button>
              <a
                href="/"
                style={{
                  padding: "12px 24px",
                  borderRadius: 999,
                  border: "1px solid #D5DAE0",
                  background: "#fff",
                  color: "#1A1C1E",
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                }}
              >
                Ir al inicio / Go home
              </a>
            </div>
            {error.digest ? (
              <p style={{ marginTop: 24, fontSize: 12, color: "#9AA0A6" }}>
                Ref: {error.digest}
              </p>
            ) : null}
          </div>
        </div>
      </body>
    </html>
  );
}
