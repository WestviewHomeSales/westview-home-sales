import type { PropertyCardProps } from "@/components/property/property-card";
import { getStaticTimestamps } from "@/data/update-timestamps";

// Sold Listings data is sourced from Homes.com
// Data is updated when we automatically scrape and refresh via scheduled server functions.
// The timestamp below reflects the actual last time we pulled data from the source.

// Get the timestamp for when sold data was last updated
// This is a fallback if the API request fails
export const lastUpdated = getStaticTimestamps().sold;

// Sample fallback data in case the API fetch fails
const fallbackListings: PropertyCardProps[] = [
  {
    "id": "sold-5647-ficus-aurea-st",
    "image": "/images/sold-properties/5647-ficus-aurea-st.jpeg",
    "status": "sold",
    "soldDate": "May 13, 2025",
    "propertyType": "Single Family Home",
    "price": "$485,000",
    "address": "5647 Ficus Aurea St",
    "city": "Kissimmee",
    "state": "FL",
    "zip": "34758",
    "beds": 4,
    "baths": 3,
    "sqft": 2132,
    "pricePerSqFt": "$227",
    "yearBuilt": "2024",
    "lotSize": "0.15 acres",
    "description": "Beautiful 4-bedroom home in Westview community with modern finishes and open floor plan.",
    "listedBy": "Stellar Non-Member Agent",
    "company": "Stellar Non-Member Office",
    "moreDetailsLink": "https://www.homes.com/property/5647-ficus-aurea-st-kissimmee-fl/s9h2rrdj45c6c/",
    "photoGalleryLink": "https://www.homes.com/property/5647-ficus-aurea-st-kissimmee-fl/s9h2rrdj45c6c/"
  },
  {
    "id": "sold-5863-le-marin-way",
    "image": "/images/sold-properties/5863-le-marin-way-new.jpeg",
    "status": "sold",
    "soldDate": "May 10, 2025",
    "propertyType": "Single Family Home",
    "price": "$499,000",
    "address": "5863 Le Marin Way",
    "city": "Kissimmee",
    "state": "FL",
    "zip": "34758",
    "beds": 4,
    "baths": 3,
    "sqft": 2267,
    "pricePerSqFt": "$220",
    "yearBuilt": "2024",
    "lotSize": "0.17 acres",
    "description": "Spacious 4-bedroom home with modern finishes, open concept living, and large backyard.",
    "listedBy": "Stellar Non-Member Agent",
    "company": "Stellar Non-Member Office",
    "moreDetailsLink": "https://www.homes.com/property/5863-le-marin-way-kissimmee-fl/s9h2rrdj45c7d/",
    "photoGalleryLink": "https://www.homes.com/property/5863-le-marin-way-kissimmee-fl/s9h2rrdj45c7d/"
  }
];

// Default export with fallback data
// The actual data will be fetched client-side in the page component
export const soldListings = fallbackListings;

/**
 * Fetches the sold listings from the API endpoint.
 * Falls back to static data if the fetch fails.
 *
 * Usage (client-side):
 *   const listings = await fetchSoldListings();
 */
export async function fetchSoldListings(): Promise<PropertyCardProps[]> {
  try {
    const res = await fetch("/api/listings");
    if (!res.ok) throw new Error("Failed to fetch listings");
    const data = await res.json();
    return data.soldListings || fallbackListings;
  } catch (e) {
    console.error("Error fetching sold listings:", e);
    return fallbackListings;
  }
}
