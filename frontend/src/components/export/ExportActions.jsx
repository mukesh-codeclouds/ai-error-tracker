import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CSVLink } from 'react-csv';
import { FileDown, FileText, Table as TableIcon } from 'lucide-react';
import PDFReport from './PDFReport';

export default function ExportActions({ stats, results }) {
  const allErrors = results.flatMap(r => r.errors || []);
  
  const csvData = allErrors.map(err => ({
    Severity: err.severity,
    Type: err.errorType,
    Message: err.message,
    File: err.file,
    Line: err.line,
    Timestamp: err.timestamp,
    Language: err.language
  }));

  const fileName = `track-error-report-${new Date().toISOString().split('T')[0]}`;

  return (
    <div className="flex items-center gap-2">
      <CSVLink
        data={csvData}
        filename={`${fileName}.csv`}
        className="btn-secondary flex items-center gap-2 text-xs py-1.5"
      >
        <TableIcon size={14} />
        CSV Export
      </CSVLink>

      <PDFDownloadLink
        document={<PDFReport stats={stats} results={results} />}
        fileName={`${fileName}.pdf`}
        className="btn-primary flex items-center gap-2 text-xs py-1.5"
      >
        {({ loading }) => (
          <>
            {loading ? <FileDown size={14} className="animate-bounce" /> : <FileText size={14} />}
            {loading ? 'Generating PDF...' : 'Download PDF Report'}
          </>
        )}
      </PDFDownloadLink>
    </div>
  );
}
