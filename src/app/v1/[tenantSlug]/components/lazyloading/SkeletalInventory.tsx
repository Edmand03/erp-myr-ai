// @ts-nocheck
export default function InventorySkeleton() {
  return (
    <>
      {/* Metrics Row Skeleton */}
      <div style={styles.metricsWrapper}>
        {[1, 2].map((i) => (
          <div key={i} style={styles.metricCard}>
            <div style={styles.skeletonPulseShort} />
            <div style={styles.skeletonPulseLong} />
          </div>
        ))}
      </div>

      {/* Quick Actions Bar Skeleton */}
      <div style={styles.quickActionsBar}>
        <div style={styles.skeletonButton} />
        <div style={styles.skeletonButtonSecondary} />
      </div>

      {/* Register Product Form Skeleton */}
      <div style={styles.addCard}>
        <div style={styles.cardHeader}>
          <div style={styles.iconBox} />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={styles.skeletonPulseTitle} />
            <div style={styles.skeletonPulseSubtitle} />
          </div>
        </div>
        <div style={styles.formInputGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.group}>
              <div style={styles.skeletonLabel} />
              <div style={styles.skeletonInput} />
            </div>
          ))}
        </div>
      </div>

      {/* Master Stock Table Skeleton */}
      <div style={styles.card}>
        <div style={styles.tableHeaderSection}>
          <div style={styles.skeletonPulseTitle} />
          <div style={styles.skeletonLabel} />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                {[
                  "SKU",
                  "Product Name",
                  "Selling Price",
                  "Current Stock",
                  "Status",
                ].map((h, i) => (
                  <th key={i} style={styles.cellHead}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((row) => (
                <tr key={row} style={styles.trRow}>
                  <td style={styles.cellBody}>
                    <div style={styles.skeletonLineShort} />
                  </td>
                  <td style={styles.cellBody}>
                    <div style={styles.skeletonLineLong} />
                  </td>
                  <td style={styles.cellBody}>
                    <div style={styles.skeletonLineShort} />
                  </td>
                  <td style={styles.cellBody}>
                    <div style={styles.skeletonLineShort} />
                  </td>
                  <td style={styles.cellBody}>
                    <div style={styles.skeletonBadge} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const styles = {
  metricsWrapper: { display: "flex", gap: "12px" },
  metricCard: {
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    padding: "14px 18px",
    borderRadius: "12px",
    minWidth: "150px",
    gap: "8px",
  },
  quickActionsBar: { display: "flex", gap: "12px", flexWrap: "wrap" as const },
  skeletonButton: {
    width: "160px",
    height: "40px",
    backgroundColor: "#1e293b",
    borderRadius: "10px",
  },
  skeletonButtonSecondary: {
    width: "180px",
    height: "40px",
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "10px",
  },
  addCard: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "32px",
  },
  card: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "32px",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "28px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "20px",
  },
  iconBox: {
    width: "44px",
    height: "44px",
    backgroundColor: "#1e293b",
    borderRadius: "12px",
  },
  skeletonPulseShort: {
    width: "70px",
    height: "10px",
    backgroundColor: "#1e293b",
    borderRadius: "4px",
  },
  skeletonPulseLong: {
    width: "110px",
    height: "20px",
    backgroundColor: "#334155",
    borderRadius: "4px",
  },
  skeletonPulseTitle: {
    width: "200px",
    height: "18px",
    backgroundColor: "#334155",
    borderRadius: "4px",
  },
  skeletonPulseSubtitle: {
    width: "320px",
    height: "12px",
    backgroundColor: "#1e293b",
    borderRadius: "4px",
  },
  formInputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },
  group: { display: "flex", flexDirection: "column" as const, gap: "8px" },
  skeletonLabel: {
    width: "100px",
    height: "12px",
    backgroundColor: "#1e293b",
    borderRadius: "4px",
  },
  skeletonInput: {
    width: "100%",
    height: "42px",
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "10px",
  },
  tableHeaderSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    textAlign: "left" as const,
  },
  thRow: { backgroundColor: "#111827", borderBottom: "1px solid #1e293b" },
  cellHead: {
    padding: "16px 24px",
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase" as const,
  },
  trRow: { borderBottom: "1px solid #1e293b" },
  cellBody: { padding: "18px 24px", verticalAlign: "middle" },
  skeletonLineShort: {
    width: "60px",
    height: "14px",
    backgroundColor: "#1e293b",
    borderRadius: "4px",
  },
  skeletonLineLong: {
    width: "140px",
    height: "14px",
    backgroundColor: "#334155",
    borderRadius: "4px",
  },
  skeletonBadge: {
    width: "80px",
    height: "22px",
    backgroundColor: "#1e293b",
    borderRadius: "6px",
  },
};
