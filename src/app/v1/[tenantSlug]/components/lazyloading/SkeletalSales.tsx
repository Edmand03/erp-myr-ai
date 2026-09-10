export default function SkeletalSales() {
  return (
    <div style={styles.container}>
      {/* Navbar Skeleton */}
      <header style={styles.navbar}>
        <div style={styles.navContent}>
          <div>
            <div
              style={{
                ...styles.skeletonPulse,
                width: "100px",
                height: "14px",
                marginBottom: "8px",
              }}
            />
            <div style={styles.titleWrapper}>
              <div
                style={{
                  ...styles.skeletonPulse,
                  width: "220px",
                  height: "24px",
                }}
              />
              <div
                style={{
                  ...styles.skeletonPulse,
                  width: "130px",
                  height: "20px",
                  borderRadius: "6px",
                }}
              />
            </div>
          </div>
          <div style={styles.headerActions}>
            <div
              style={{
                ...styles.skeletonPulse,
                width: "120px",
                height: "36px",
                borderRadius: "10px",
              }}
            />
            <div
              style={{
                ...styles.skeletonPulse,
                width: "110px",
                height: "36px",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content Layout Skeleton */}
      <main style={styles.mainLayout}>
        <div style={styles.tableCol}>
          <div style={styles.card}>
            {/* Card Header Skeleton */}
            <div style={styles.cardHeader}>
              <div style={styles.iconBox}>📊</div>
              <div>
                <div
                  style={{
                    ...styles.skeletonPulse,
                    width: "240px",
                    height: "18px",
                    marginBottom: "6px",
                  }}
                />
                <div
                  style={{
                    ...styles.skeletonPulse,
                    width: "320px",
                    height: "12px",
                  }}
                />
              </div>
            </div>

            {/* Simulated Invoice Ledger Skeletons (Loop 3 items) */}
            <div style={styles.ledgerList}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={styles.ledgerCard}>
                  <div style={styles.ledgerCardHeader}>
                    <div style={styles.invoiceMetaGroup}>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            ...styles.skeletonPulse,
                            width: "90px",
                            height: "18px",
                          }}
                        />
                        <div
                          style={{
                            ...styles.skeletonPulse,
                            width: "55px",
                            height: "18px",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          ...styles.skeletonPulse,
                          width: "150px",
                          height: "12px",
                          marginTop: "4px",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          ...styles.skeletonPulse,
                          width: "80px",
                          height: "20px",
                        }}
                      />
                      <div
                        style={{
                          ...styles.skeletonPulse,
                          width: "160px",
                          height: "10px",
                        }}
                      />
                    </div>
                  </div>

                  <div style={styles.ledgerCardBody}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          ...styles.skeletonPulse,
                          width: "140px",
                          height: "12px",
                        }}
                      />
                      <div
                        style={{
                          ...styles.skeletonPulse,
                          width: "120px",
                          height: "12px",
                        }}
                      />
                    </div>
                    <div
                      style={{ display: "flex", gap: "6px", marginTop: "4px" }}
                    >
                      <div
                        style={{
                          ...styles.skeletonPulse,
                          width: "110px",
                          height: "22px",
                          borderRadius: "6px",
                        }}
                      />
                      <div
                        style={{
                          ...styles.skeletonPulse,
                          width: "90px",
                          height: "22px",
                          borderRadius: "6px",
                        }}
                      />
                    </div>
                  </div>

                  <div style={styles.ledgerCardFooter}>
                    <div
                      style={{
                        ...styles.skeletonPulse,
                        width: "110px",
                        height: "28px",
                        borderRadius: "20px",
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div
                        style={{
                          ...styles.skeletonPulse,
                          width: "80px",
                          height: "32px",
                          borderRadius: "8px",
                        }}
                      />
                      <div
                        style={{
                          ...styles.skeletonPulse,
                          width: "80px",
                          height: "32px",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Inline styling mirroring your exact SalesPage layout structure
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "#030712",
    color: "#f8fafc",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    overflow: "hidden",
  },
  navbar: {
    backgroundColor: "#0b0f19",
    borderBottom: "1px solid #1e293b",
    flexShrink: 0,
  },
  navContent: {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "16px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  titleWrapper: {
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
    marginTop: "4px",
  },
  mainLayout: {
    flex: 1,
    padding: "24px 40px",
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
  },
  tableCol: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
  },
  card: {
    backgroundColor: "#0b0f19",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "20px",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "14px",
    flexShrink: 0,
  },
  iconBox: {
    width: "38px",
    height: "38px",
    backgroundColor: "#111827",
    border: "1px solid #334155",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
  },
  ledgerList: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
    overflow: "hidden",
  },
  ledgerCard: {
    backgroundColor: "#111827",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  ledgerCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  invoiceMetaGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
  ledgerCardBody: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    paddingTop: "10px",
    borderTop: "1px solid #1e293b",
  },
  ledgerCardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "10px",
    borderTop: "1px solid #1e293b",
  },
  // Shimmer pulse animation class simulation
  skeletonPulse: {
    backgroundColor: "#1e293b",
    backgroundImage:
      "linear-gradient(90deg, #1e293b 0px, #334155 40px, #1e293b 80px)",
    backgroundSize: "600px",
    animation: "shimmer 1.5s infinite linear",
    borderRadius: "4px",
  },
};
