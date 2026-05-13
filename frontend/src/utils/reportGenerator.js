/**
 * Data transformation utilities for Phase 4 dashboard
 */

/**
 * Aggregates statistics from parsed log results
 */
export function calculateStats(parsedResults) {
  const stats = {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    parseTime: 0
  };

  parsedResults.forEach(file => {
    stats.total += (file.errors?.length || 0);
    stats.critical += (file.summary?.critical || 0);
    stats.high += (file.summary?.high || 0);
    stats.medium += (file.summary?.medium || 0);
    stats.low += (file.summary?.low || 0);
    stats.parseTime += (file.parseTimeMs || 0);
  });

  // Average parse time
  if (parsedResults.length > 0) {
    stats.parseTime = Math.round(stats.parseTime / parsedResults.length);
  }

  return stats;
}

/**
 * Generates trend data for the chart (grouping errors by timestamp)
 */
export function generateTrendData(parsedResults) {
  const timeMap = {};

  parsedResults.forEach(file => {
    file.errors.forEach(err => {
      if (!err.timestamp) return;
      
      // Group by hour for the trend
      const date = new Date(err.timestamp);
      const timeStr = `${date.getHours()}:00`;
      
      timeMap[timeStr] = (timeMap[timeStr] || 0) + 1;
    });
  });

  // Convert map to sorted array
  return Object.entries(timeMap)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => {
      const hourA = parseInt(a.time);
      const hourB = parseInt(b.time);
      return hourA - hourB;
    });
}
