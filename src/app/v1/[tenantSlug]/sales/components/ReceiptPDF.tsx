"use client";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: "Helvetica" },
  header: { fontSize: 18, marginBottom: 20, fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  table: { marginTop: 20, borderTop: "1px solid #ccc", paddingTop: 10 },
  total: { marginTop: 20, fontWeight: "bold", fontSize: 14 },
});

export const ReceiptPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>OFFICIAL RECEIPT</Text>
      <View style={styles.row}>
        <Text>Receipt No: {data.referenceNo}</Text>
        <Text>Date: {new Date(data.paymentDate).toLocaleDateString()}</Text>
      </View>
      <Text>Customer: {data.customerName}</Text>
      <View style={styles.table}>
        <Text>Invoice Reference: #{data.invoiceNo}</Text>
        <Text style={styles.total}>Amount Paid: RM {data.amount}</Text>
      </View>
    </Page>
  </Document>
);
