import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '16.66%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f3f4f6',
    padding: 8,
  },
  tableCol: {
    width: '16.66%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCell: {
    fontSize: 8,
    color: '#4b5563',
  },
  status: {
    fontSize: 7,
    padding: 2,
    borderRadius: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#00c950',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
});

const PersonnelDocument = ({ dataToExport }) => (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <Text style={styles.header}>Police Personnel Report</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>ID</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>NAME</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>ROLE</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>CONTACT</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>STATUS</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>STATION ASSIGNED</Text>
            </View>
          </View>

          {/* Table Rows */}
          {dataToExport.map((officer, index) => {
            if (!officer) return null;
            const status = officer.status ?? "Unknown";
            const statusColor = {
              active: '#10b981',
              on_leave: '#f59e0b',
              suspended: '#ef4444',
            }[status.toLowerCase()] || '#6b7280';

            return (
              <View style={styles.tableRow} key={officer._id || index}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{officer.custom_id || 'N/A'}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {officer.first_name} {officer.last_name}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{officer.role || "Unassigned"}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {officer.contact?.mobile_number ?? "N/A"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={[styles.tableCell, { color: statusColor }]}>
                    {status.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {officer.station_id?.name ?? "N/A"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={{ marginTop: 20, fontSize: 10, color: '#6b7280' }}>
          <Text>Total Personnel: {dataToExport.length}</Text>
          <Text>Generated on: {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );

const PersonnelExportPdf = ({ filteredOfficers = [] }) => {
  const dataToExport = filteredOfficers.length > 0 ? filteredOfficers : [];

  return (
    <PDFDownloadLink
      document={<PersonnelDocument dataToExport={dataToExport} />}
      fileName={`personnel-report-${new Date().toISOString().split('T')[0]}.pdf`}
      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 
                text-white px-5 py-3 rounded-lg font-medium shadow-lg
                hover:shadow-2xl transition-shadow"
    >
      {({ loading }) =>
        loading ? (
          "Generating PDF..."
        ) : (
          <>
            <Download size={18} />
            Export PDF
          </>
        )
      }
    </PDFDownloadLink>
  );
};

export default PersonnelExportPdf;