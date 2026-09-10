// @ts-nocheck
export default function DashboardSkeleton() {
  return (
    <>
      {/* KPI Row Skeleton */}
      <div style={styles.kpiGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={styles.kpiCard}>
            <div style={styles.kpiHeader}>
              <div style={styles.skeletonPulseShort} />
              <div style={styles.skeletonIconBox} />
            </div>
            <div style={styles.skeletonPulseLong} />
            <div style={styles.skeletonPulseShort} />
          </div>
        ))}
      </div>

      {/* AR Aging Banner Skeleton */}
      <div style={styles.agingBanner}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div style={styles.skeletonPulseTitle} />
          <div style={styles.skeletonPulseShort} />
        </div>
        <div style={styles.agingGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={styles.agingBucket}>
              <div style={styles.skeletonPulseShort} />
              <div style={styles.skeletonPulseMed} />
            </div>
          ))}
        </div>
      </div>

      {/* Operational Grid Skeleton */}
      <div style={styles.mainGrid}>
        {/* Left Column */}
        <div style={styles.col}>
          <div style={styles.sectionHeaderWrapper}>
            <div style={styles.skeletonPulseTitle} />
            <div style={styles.skeletonPulseShort} />
          </div>
          <div style={styles.actionGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={styles.moduleCard}>
                <div style={styles.moduleTop}>
                  <div style={styles.modIconBox} />
                  <div style={styles.skeletonBadge} />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={styles.skeletonPulseMed} />
                  <div style={styles.skeletonPulseLong} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div style={styles.col}>
          <div style={styles.sectionHeaderWrapper}>
            <div style={styles.skeletonPulseTitle} />
            <div style={styles.skeletonPulseShort} />
          </div>
          <div style={styles.logCard}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={styles.logRow}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={styles.skeletonPulseMed} />
                  <div style={styles.skeletonPulseShort} />
                </div>
                <div style={styles.skeletonPulseShort} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "28px",
  },
  kpiCard: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  kpiHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  agingBanner: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "32px",
  },
  agingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
  },
  agingBucket: {
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    padding: "14px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "32px",
  },
  col: { display: "flex", flexDirection: "column" as const, gap: "16px" },
  sectionHeaderWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "8px",
  },
  actionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  moduleCard: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "150px",
  },
  moduleTop: { display: "flex", justifyContent: "space-between" },
  modIconBox: {
    width: "36px",
    height: "36px",
    backgroundColor: "#1e293b",
    borderRadius: "8px",
  },
  logCard: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  logRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    borderBottom: "1px solid #1e293b",
  },
  skeletonPulseShort: {
    width: "70px",
    height: "12px",
    backgroundColor: "#1e293b",
    borderRadius: "4px",
  },
  skeletonPulseMed: {
    width: "130px",
    height: "16px",
    backgroundColor: "#334155",
    borderRadius: "4px",
  },
  skeletonPulseLong: {
    width: "170px",
    height: "24px",
    backgroundColor: "#334155",
    borderRadius: "4px",
  },
  skeletonPulseTitle: {
    width: "180px",
    height: "18px",
    backgroundColor: "#334155",
    borderRadius: "4px",
  },
  skeletonIconBox: {
    width: "24px",
    height: "24px",
    backgroundColor: "#1e293b",
    borderRadius: "6px",
  },
  skeletonBadge: {
    width: "50px",
    height: "18px",
    backgroundColor: "#1e293b",
    borderRadius: "6px",
  },
};
