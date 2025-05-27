import type { PropertyCardProps } from "@/components/property/property-card";
import { getStaticTimestamps } from "@/data/update-timestamps";

// Current Listings data is sourced from Borchini Realty IDX Broker (http://borchinirealty.idxbroker.com/i/westview)
// Data is updated when we automatically scrape and refresh from the IDX Broker site via scheduled server functions.
// The timestamp below reflects the actual last time we pulled data from the source.

// Get the timestamp for when IDX data was last updated
// This is a fallback if the API request fails
export const lastUpdated = getStaticTimestamps().current;

// Fallback data for a few top properties
const fallbackListings: PropertyCardProps[] = [
  {
    id: "O6311835",
    image: "https://ext.same-assets.com/172963997/3248951663.jpeg",
    status: "active",
    propertyType: "Single Family Home",
    price: "$369,990",
    address: "5637 Gingham Drive",
    city: "Kissimmee",
    state: "FL",
    zip: "34758",
    beds: 4,
    baths: 3,
    sqft: 1879,
    pricePerSqFt: "$197",
    yearBuilt: "2025",
    lotSize: "0.12 acres",
    description: "One or more photo(s) has been virtually staged. Under Construction. The two-story Atlanta Plan has the WOW-Factor with four bedrooms, two and a half baths, and a two-car garage.",
    listedBy: "Lennar",
    company: "LENNAR REALTY",
    moreDetailsLink: "http://borchinirealty.idxbroker.com/idx/details/listing/d003/O6311835/5637-Gingham-Drive-Kissimmee-FL",
    photoGalleryLink: "http://borchinirealty.idxbroker.com/idx/photogallery/d003/O6311835",
    listingDate: "2025-05-23"
  },
  {
    id: "O6311833",
    image: "https://ext.same-assets.com/172963997/389532543.jpeg",
    status: "active",
    propertyType: "Townhouse",
    price: "$312,990",
    address: "2686 Skyline Loop",
    city: "Kissimmee",
    state: "FL",
    zip: "34758",
    beds: 3,
    baths: 3,
    sqft: 1834,
    pricePerSqFt: "$171",
    yearBuilt: "2025",
    lotSize: "0.05 acres",
    description: "One or more photo(s) has been virtually staged. Under Construction. This new Minori two-story home opens to an inviting dining room with shared access to a well-equipped kitchen and an expansive great room.",
    listedBy: "Lennar",
    company: "LENNAR REALTY",
    moreDetailsLink: "http://borchinirealty.idxbroker.com/idx/details/listing/d003/O6311833/2686-Skyline-Loop-Kissimmee-FL",
    photoGalleryLink: "http://borchinirealty.idxbroker.com/idx/photogallery/d003/O6311833",
    listingDate: "2025-05-23"
  },
  {
    id: "O6311827",
    image: "https://ext.same-assets.com/172963997/2687523611.jpeg",
    status: "active",
    propertyType: "Townhouse",
    price: "$299,990",
    address: "2678 Skyline Loop",
    city: "Kissimmee",
    state: "FL",
    zip: "34758",
    beds: 3,
    baths: 3,
    sqft: 1689,
    pricePerSqFt: "$178",
    yearBuilt: "2025",
    lotSize: "0.05 acres",
    description: "One or more photo(s) has been virtually staged. Under Construction. This new Amalfi two-story townhome has a smart layout that promotes ease of living. A versatile flex space frames the foyer.",
    listedBy: "Lennar",
    company: "LENNAR REALTY",
    moreDetailsLink: "http://borchinirealty.idxbroker.com/idx/details/listing/d003/O6311827/2678-Skyline-Loop-Kissimmee-FL",
    photoGalleryLink: "http://borchinirealty.idxbroker.com/idx/photogallery/d003/O6311827",
    listingDate: "2025-05-22"
  }
];

// Default export with fallback data
// The actual data will be fetched client-side in the page component
export const currentListings = fallbackListings;

/**
 * Fetches the current listings from the API endpoint.
 * Falls back to static data if the fetch fails.
 *
 * Usage (client-side):
 *   const listings = await fetchCurrentListings();
 */
export async function fetchCurrentListings(): Promise<PropertyCardProps[]> {
  try {
    const res = await fetch("/api/listings");
    if (!res.ok) throw new Error("Failed to fetch listings");
    const data = await res.json();
    // Optionally validate/transform data here
    return data as PropertyCardProps[];
  } catch (e) {
    // Fallback to static data if API fails
    return fallbackListings;
  }
}
