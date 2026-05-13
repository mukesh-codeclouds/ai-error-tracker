import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Note: In a real app, you might want to register custom fonts here.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
    marginTop: 20,
  },
  statBox: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 10,
    marginTop: 20,
    borderLeft: 4,
    borderLeftColor: '#3b82f6',
    paddingLeft: 10,
  },
  errorRow: {
    marginBottom: 15,
    padding: 10,
    borderBottom: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  errorMessage: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  errorMeta: {
    fontSize: 8,
    color: '#94a3b8',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#cbd5e1',
    borderTop: 0.5,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  }
});

export default function PDFReport({ stats, results }) {
  const allErrors = results.flatMap(r => r.errors || []);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>TrackError Analysis Report</Text>
          <Text style={styles.subtitle}>Generated on {new Date().toLocaleString()}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Errors</Text>
            <Text style={styles.statValue}>{stats.total}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Critical</Text>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{stats.critical}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Files Analyzed</Text>
            <Text style={styles.statValue}>{results.length}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Error Breakdown</Text>
        {allErrors.slice(0, 50).map((err, i) => (
          <View key={i} style={styles.errorRow}>
            <Text style={styles.errorMessage}>[{err.severity.toUpperCase()}] {err.message}</Text>
            <Text style={styles.errorMeta}>
              File: {err.file || 'Unknown'} | Line: {err.line || 'N/A'} | Type: {err.errorType}
            </Text>
          </View>
        ))}

        {allErrors.length > 50 && (
          <Text style={{ fontSize: 8, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>
            ... and {allErrors.length - 50} more errors.
          </Text>
        )}

        <Text style={styles.footer}>
          Confidential Debug Report | Powered by TrackError AI
        </Text>
      </Page>
    </Document>
  );
}
