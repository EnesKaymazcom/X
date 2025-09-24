export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('tr-TR');
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('tr-TR');
};

export const formatDateWithTimezone = (
  timestamp: number, 
  timezone: number, 
  format: 'short' | 'long' = 'short'
): string => {
  const date = new Date((timestamp + timezone) * 1000);
  if (format === 'long') {
    return date.toLocaleDateString('tr-TR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  return date.toLocaleDateString('tr-TR');
};