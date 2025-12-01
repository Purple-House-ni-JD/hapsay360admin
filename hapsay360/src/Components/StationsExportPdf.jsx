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
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f3f4f6',
    padding: 8,
  },
  tableCol: {
    width: '20%',
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
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginLeft: '8px',
  }
});

const StationsDocument = ({ dataToExport }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      <Text style={styles.header}>Police Stations Report</Text>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>STATION ID</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>NAME</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>ADDRESS</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>CONTACT (LANDLINE)</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}># OF PERSONNEL</Text>
          </View>
        </View>

        {/* Table Rows */}
        {dataToExport.map((station, index) => {
          if(!station) return null;
          return (
          <View style={styles.tableRow} key={station._id || index}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{station.custom_id || 'N/A'}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{station.name || "N/A"}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{station.address || "N/A"}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {station.contact?.landline || "N/A"}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {station.officer_IDs?.length ?? 0}
              </Text>
            </View>
          </View>
        )})}
      </View>

      {/* Summary */}
      <View style={{ marginTop: 20, fontSize: 10, color: '#6b7280' }}>
        <Text>Total Stations: {dataToExport.length}</Text>
        <Text>Total Personnel Across All Stations: {dataToExport.reduce((total, station) => total + (station.officer_IDs?.length || 0), 0)}</Text>
        <Text>Generated on: {new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
);

const StationsExportPdf = ({ filteredStations = [] }) => {
  const dataToExport = filteredStations.length > 0 ? filteredStations : [];

  return (
    <PDFDownloadLink
      document={<StationsDocument dataToExport={dataToExport} />}
      fileName={`stations-report-${new Date().toISOString().split('T')[0]}.pdf`}
      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 
                text-white px-5 py-3 rounded-lg font-medium shadow-lg
                hover:shadow-2xl transition-shadow"
    >
      {({ loading }) => (loading ? 'Generating PDF...' : 
        <>
          <Download size={18} /> 
           Export PDF
        </>)}
    </PDFDownloadLink>
  );
};

export default StationsExportPdf;