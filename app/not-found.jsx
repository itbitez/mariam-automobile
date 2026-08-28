import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#10161d",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div>
        <h1 style={{ fontSize: 56, marginBottom: 8, letterSpacing: "-0.03em" }}>404</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 24 }}>That page or car is no longer here.</p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "#e41824",
            color: "#fff",
            padding: "14px 26px",
            borderRadius: 999,
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Back to Mariam Automobile
        </Link>
      </div>
    </div>
  );
}
