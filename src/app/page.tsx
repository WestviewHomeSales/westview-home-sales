"use client";

import { useState, useMemo, useEffect } from "react";
import { currentListings as fallbackListings, lastUpdated as fallbackTimestamp } from "@/data/new-properties";
import PropertyCard from "@/components/property/property-card";
import { Button } from "@/components/ui/button";

export default function Home() {
  // State for listings and timestamp
  const [listings, setListings] = useState(fallbackListings);
  const [timestamp, setTimestamp] = useState(fallbackTimestamp);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add sorting state
  type SortType = "date" | "price";
  type SortDirection = "asc" | "desc";

  const [activeSortType, setActiveSortType] = useState<SortType>("date");
  const [dateSortDirection, setDateSortDirection] = useState<SortDirection>("desc"); // desc = newest first
  const [priceSortDirection, setPriceSortDirection] = useState<SortDirection>("desc"); // desc = highest first

  // Fetch listings from static JSON file
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/listings.json');
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        const data = await response.json();

        // Only set if we have valid data
        if (data?.currentListings?.length > 0) {
          setListings(data.currentListings);
        }

        if (data?.timestamps?.current) {
          setTimestamp(data.timestamps.current);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Unable to fetch latest listings. Showing cached data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Use useMemo to avoid re-sorting on each render
  const sortedListings = useMemo(() => {
    return [...listings].sort((a, b) => {
      if (activeSortType === "price") {
        const priceA = Number.parseInt(a.price.replace(/[^0-9]/g, ""));
        const priceB = Number.parseInt(b.price.replace(/[^0-9]/g, ""));
        return priceSortDirection === "desc" ? priceB - priceA : priceA - priceB;
      } else { // date sorting
        if (a.listingDate && b.listingDate) {
          const dateA = new Date(a.listingDate).getTime();
          const dateB = new Date(b.listingDate).getTime();
          return dateSortDirection === "desc" ? dateB - dateA : dateA - dateB;
        }

        // Fallback to ID if dates aren't available
        const idA = Number.parseInt(a.id.replace(/[^0-9]/g, "")) || 0;
        const idB = Number.parseInt(b.id.replace(/[^0-9]/g, "")) || 0;
        return dateSortDirection === "desc" ? idB - idA : idA - idB;
      }
    });
  }, [listings, activeSortType, dateSortDirection, priceSortDirection]);

  // Toggle functions for each sort type
  const toggleDateSort = () => {
    setActiveSortType("date");
    setDateSortDirection(dateSortDirection === "desc" ? "asc" : "desc");
  };

  const togglePriceSort = () => {
    setActiveSortType("price");
    setPriceSortDirection(priceSortDirection === "desc" ? "asc" : "desc");
  };

  return (
    <main className="container mx-auto px-4 py-6 md:py-10">
      <div className="max-w-3xl">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">
          Find Your <span className="text-blue-600">Dream Home</span> in Westview
        </h1>
        <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
          Browse our current listings in the beautiful Westview community of Poinciana, Florida. Discover affordable luxury in a family-friendly neighborhood.
        </p>
      </div>

      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Current Listings</h2>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <div className="flex items-center text-xs md:text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>
              {isLoading ? 'Loading latest data...' : `IDX Data Updated: ${timestamp}`}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleDateSort}
              className={`text-xs md:text-sm flex items-center ${activeSortType === "date" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"} px-3 py-1 rounded-md transition-colors`}
              aria-label={`Sort by date ${dateSortDirection === "desc" ? "oldest first" : "newest first"}`}
              data-testid="date-sort-button"
            >
              <span className="mr-2">Date</span>
              {activeSortType === "date" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {dateSortDirection === "desc" ? (
                    <path d="M6 9l6 6 6-6" />
                  ) : (
                    <path d="M18 15l-6-6-6 6" />
                  )}
                </svg>
              )}
            </button>

            <button
              onClick={togglePriceSort}
              className={`text-xs md:text-sm flex items-center ${activeSortType === "price" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"} px-3 py-1 rounded-md transition-colors`}
              aria-label={`Sort by price ${priceSortDirection === "desc" ? "lowest first" : "highest first"}`}
              data-testid="price-sort-button"
            >
              <span className="mr-2">Price</span>
              {activeSortType === "price" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {priceSortDirection === "desc" ? (
                    <path d="M6 9l6 6 6-6" />
                  ) : (
                    <path d="M18 15l-6-6-6 6" />
                  )}
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading && listings.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading listings...</span>
          </div>
        ) : (
          <div className="property-card-grid">
            {sortedListings.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        )}

        {!isLoading && sortedListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No current listings available. Please check back later.</p>
          </div>
        )}
      </div>

      <div className="bg-[#f8f9fa] py-6 px-4 md:py-8 md:px-6 rounded-lg mt-6 md:mt-8 text-center sm:text-left">
        <h2 className="text-lg md:text-xl font-semibold mb-2">Ready to find your dream home?</h2>
        <p className="text-gray-600 mb-4 text-sm md:text-base">Contact us today to schedule a viewing or learn more about our listings.</p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <a href="/contact">Contact Us</a>
        </Button>
      </div>
    </main>
  );
}
