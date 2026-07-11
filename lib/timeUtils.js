/**
 * Format time to 12-hour AM/PM format
 * @param {string} timeStr - Time string (e.g., "14:30" or "02:30 PM")
 * @returns {string} Formatted time like "02:30 PM"
 */
export function formatTo12Hour(timeStr) {
  if (!timeStr) return '';
  
  const trimmed = timeStr.trim();
  
  // If already in 12-hour format, return as is
  if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(trimmed)) {
    // Ensure consistent formatting (pad hours)
    const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      const hours = match[1].padStart(2, '0');
      const minutes = match[2];
      const meridian = match[3].toUpperCase();
      return `${hours}:${minutes} ${meridian}`;
    }
    return trimmed;
  }
  
  // Parse 24-hour format
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;
  
  let hours = parseInt(parts[0]) || 0;
  let minutes = parseInt(parts[1]) || 0;
  
  // Convert to 12-hour format
  const isPM = hours >= 12;
  let displayHours = hours % 12;
  if (displayHours === 0) displayHours = 12;
  const meridian = isPM ? 'PM' : 'AM';
  
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${meridian}`;
}

/**
 * Validate if time is in 12-hour format
 */
export function isValid12HourFormat(timeStr) {
  if (!timeStr) return false;
  return /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(timeStr.trim());
}

/**
 * Convert 12-hour time to 24-hour format (for calculations)
 */
export function to24Hour(timeStr) {
  if (!timeStr) return '';
  
  const trimmed = timeStr.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return trimmed;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const meridian = match[3].toUpperCase();
  
  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Parse time string to hours and minutes
 * @returns {Object} { hours: number, minutes: number }
 */
export function parseTimeToNumbers(timeStr) {
  if (!timeStr) return { hours: 0, minutes: 0 };
  
  const trimmed = timeStr.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const meridian = match[3].toUpperCase();
    
    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;
    
    return { hours, minutes };
  }
  
  // Fallback: try 24-hour format
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    return {
      hours: parseInt(parts[0]) || 0,
      minutes: parseInt(parts[1]) || 0
    };
  }
  
  return { hours: 0, minutes: 0 };
}