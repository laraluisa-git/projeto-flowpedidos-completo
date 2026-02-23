export default function Table({ columns, rows, emptyText = "Sem dados." }) {
  return (
    <div style={{
      overflowX: "auto",
      borderRadius: 16,
      border: "1px solid rgba(59,110,245,.14)",
      background: "#fff",
      boxShadow: "0 4px 20px rgba(59,110,245,.07)",
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
    }}>
      <table style={{ minWidth: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr style={{ background: "#f5f7fc" }}>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  color: "#718096",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid rgba(59,110,245,.1)",
                }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "32px 16px",
                  fontSize: 13.5,
                  color: "#9ca3af",
                  textAlign: "center",
                }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr
                key={r.id ?? idx}
                style={{
                  borderTop: "1px solid rgba(59,110,245,.07)",
                  transition: "background .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8faff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      padding: "13px 16px",
                      fontSize: 13.5,
                      color: "#4a5568",
                      verticalAlign: "middle",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}