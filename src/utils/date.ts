/**
 * Utility functions for date formatting with timezone support.
 * Standardizes date format across the application.
 */

/**
 * Specific fixed date strings to use for property listings updates.
 * This ensures consistent rendering between server and client.
 */
export const FIXED_DATES = {
  // Timestamp when current listings were last pulled from IDX Broker
  // http://borchinirealty.idxbroker.com/i/westview
  CURRENT_LISTINGS_LAST_UPDATED: "May 18, 2025, 3:15 PM ET",

  // Timestamp when sold listings were last pulled from Homes.com
  // https://www.homes.com/sold/?sk=Zuc1XcRJB_0NobI_87LxYUXJF-T-utDF1gN7gNnipAU&bb=37sts3i-6Gr90qvG
  SOLD_LISTINGS_LAST_UPDATED: "May 16, 2025, 9:45 AM ET",
};

/**
 * Returns the formatted timestamp when IDX data was last updated.
 * This is now a fixed string for consistent rendering.
 * @returns Formatted date string with Eastern Time
 */
export function getCurrentIDXDataTimestamp(): string {
  return FIXED_DATES.CURRENT_LISTINGS_LAST_UPDATED;
}

/**
 * Formats a date in Eastern Time (ET) zone with a specific format
 * Note: This function will produce different results on server vs client
 * due to timezone differences. For consistent rendering between server/client,
 * use the FIXED_DATES constants above.
 *
 * @param date - The date to format (Date object or timestamp)
 * @param includeTime - Whether to include the time in the formatted string
 * @returns Formatted date string with ET timezone
 */
export function formatDateInET(date: Date | number, includeTime = true): string {
  // Force the date to be formatted for Eastern Time regardless of server location
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };

  if (includeTime) {
    options.hour = 'numeric';
    options.minute = 'numeric';
    options.hour12 = true;
  }

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const formatted = formatter.format(date instanceof Date ? date : new Date(date));

  // Add the ET timezone indicator
  return includeTime ? `${formatted} ET` : formatted;
}

/**
 * Returns the current date and time formatted in Eastern Time
 * @param includeTime - Whether to include the time in the formatted string
 * @returns Current date and time string in ET timezone
 */
export function getCurrentDateTimeInET(includeTime = true): string {
  return formatDateInET(new Date(), includeTime);
}
