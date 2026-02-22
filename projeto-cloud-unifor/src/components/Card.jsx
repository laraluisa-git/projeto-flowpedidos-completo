export default function Card({ title, value, subtitle, highlight }) {
  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        borderRadius: 20,
        border: `1px solid ${highlight ? "rgba(59,110,245,.2)" : "rgba(59,110,245,.14)"}`,
        padding: "22px 24px",
        background: highlight
          ? "linear-gradient(135deg, #eef4ff 0%, #dce9ff 100%)"
          : "#ffffff",
        boxShadow: highlight
          ? "0 4px 20px rgba(59,110,245,.1)"
          : "0 4px 20px rgba(59,110,245,.06)",
        transition: "transform .25s, box-shadow .25s",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = highlight
          ? "0 14px 36px rgba(59,110,245,.18)"
          : "0 14px 36px rgba(59,110,245,.1)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = highlight
          ? "0 4px 20px rgba(59,110,245,.1)"
          : "0 4px 20px rgba(59,110,245,.06)";
      }}
    >
      {/* decorative blob for highlighted variant */}
      {highlight && (
        <div style={{
          position: "absolute", top: -30, right: -30,
          width: 100, height: 100, borderRadius: "50%",
          background: "rgba(59,110,245,.08)",
          pointerEvents: "none",
        }} />
      )}

      <p style={{
        fontSize: 12,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: ".06em",
        color: highlight ? "#2350d8" : "#718096",
        position: "relative",
      }}>
        {title}
      </p>

      <p style={{
        marginTop: 10,
        fontFamily: "'Sora', 'DM Sans', sans-serif",
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: "-.02em",
        lineHeight: 1,
        color: highlight ? "#1a3a9e" : "#0e1726",
        position: "relative",
      }}>
        {value}
      </p>

      {subtitle && (
        <p style={{
          marginTop: 8,
          fontSize: 12,
          fontWeight: 500,
          color: highlight ? "#3b6ef5" : "#9ca3af",
          position: "relative",
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}