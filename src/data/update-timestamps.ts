// Client-side fallback default timestamps
const DEFAULT_TIMESTAMPS = {
  current_listings: "May 26, 2025, 12:09 PM ET",
  sold_listings: "May 25, 2025, 12:09 PM ET",
};

/**
 * Gets a static version of the timestamps for client-side use
 * Returns hardcoded values
 */
export function getStaticTimestamps(): { current: string; sold: string } {
  return {
    current: DEFAULT_TIMESTAMPS.current_listings,
    sold: DEFAULT_TIMESTAMPS.sold_listings
  };
}
