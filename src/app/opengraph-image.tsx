import { ImageResponse } from "next/og"

export const alt = "Kunbase — The Open Registry for Prompts & AI Skills"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "#09090b",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="88" height="88" viewBox="0 0 24 24" fill="none">
            <path d="M5 4C5 3.44772 5.44772 3 6 3H8C8.55228 3 9 3.44772 9 4V20C9 20.5523 8.55228 21 8 21H6C5.44772 21 5 20.5523 5 20V4Z" fill="white" />
            <path d="M19.7071 3.29289C20.0976 3.68342 20.0976 4.31658 19.7071 4.70711L12.4142 12L19.7071 19.2929C20.0976 19.6834 20.0976 20.3166 19.7071 20.7071C19.3166 21.0976 18.6834 21.0976 18.2929 20.7071L10.2929 12.7071C9.90237 12.3166 9.90237 11.6834 10.2929 11.2929L18.2929 3.29289C18.6834 2.90237 19.3166 2.90237 19.7071 3.29289Z" fill="white" />
          </svg>
          <div style={{ marginLeft: 24, fontSize: 88, fontWeight: 700, letterSpacing: -2 }}>
            Kunbase
          </div>
        </div>
        <div style={{ marginTop: 40, fontSize: 44, color: "#a1a1aa" }}>
          The Open Registry for Prompts & AI Skills
        </div>
        <div style={{ marginTop: 64, fontSize: 28, color: "#71717a" }}>
          kunbase.space
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
