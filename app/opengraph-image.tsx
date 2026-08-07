import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Vyta Fisioterapia e Pilates";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#2C3A3D",
          color: "#FAF6F0",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ width: 64, height: 1, background: "#db7f66", marginBottom: 32 }} />
        <div style={{ fontSize: 68, letterSpacing: -1 }}>Vyta</div>
        <div
          style={{
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            marginTop: 16,
            opacity: 0.85,
          }}
        >
          Fisioterapia &amp; Pilates
        </div>
        <div style={{ fontSize: 24, marginTop: 40, opacity: 0.7 }}>
          Consolação · Pinheiros · São Paulo
        </div>
      </div>
    ),
    size,
  );
}
