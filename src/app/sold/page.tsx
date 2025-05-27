"use client";

import { useState, useMemo, useEffect } from "react";
import { soldListings as fallbackListings, lastUpdated as fallbackTimestamp } from "@/data/sold-properties";
import PropertyCard from "@/components/property/property-card";

export default function SoldPage() {
  // State for listings and timestamp
  const [listings, setListings] = useState(fallbackListings);
  const [timestamp, setTimestamp] = useState(fallbackTimestamp);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Adding state for filtering and sorting
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<"all" | "single" | "townhome">("all");

  // Add sorting state
  type SortType = "date" | "price";
  type SortDirection = "asc" | "desc";

  const [activeSortType, setActiveSortType] = useState<SortType>("date");
  const [dateSortDirection, setDateSortDirection] = useState<SortDirection>("desc"); // desc = newest first
  const [priceSortDirection, setPriceSortDirection] = useState<SortDirection>("desc"); // desc = highest first

  // Fetch listings from static JSON file with cache-busting parameter
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        // Add cache-busting timestamp to URL
        const cacheBuster = new Date().getTime();
        const response = await fetch(`/api/listings.json?t=${cacheBuster}`);
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        const data = await response.json();

        // Only set if we have valid data
        if (data?.soldListings?.length > 0) {
          setListings(data.soldListings);
        }

        if (data?.timestamps?.sold) {
          setTimestamp(data.timestamps.sold);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching sold listings:', err);
        setError('Unable to fetch latest sold listings. Showing cached data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Filter listings by property type
  const filteredListings = useMemo(() => {
    return listings.filter(property => {
      if (propertyTypeFilter === "all") return true;
      if (propertyTypeFilter === "single") return property.propertyType.toLowerCase().includes("single");
      if (propertyTypeFilter === "townhome") return property.propertyType.toLowerCase().includes("townhome");
      return true;
    });
  }, [listings, propertyTypeFilter]);

  // Sort listings by date or price
  const sortedListings = useMemo(() => {
    return [...filteredListings].sort((a, b) => {
      if (activeSortType === "price") {
        const priceA = Number.parseInt(a.price.replace(/[^0-9]/g, ""));
        const priceB = Number.parseInt(b.price.replace(/[^0-9]/g, ""));
        return priceSortDirection === "desc" ? priceB - priceA : priceA - priceB;
      } else { // date sorting
        if (a.soldDate && b.soldDate) {
          // Convert dates like "May 13, 2025" to Date objects
          const dateA = new Date(a.soldDate);
          const dateB = new Date(b.soldDate);
          return dateSortDirection === "desc" ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
        }
        return 0; // Fallback if missing dates
      }
    });
  }, [filteredListings, activeSortType, dateSortDirection, priceSortDirection]);

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
          Recently <span className="text-blue-600">Sold Homes</span> in Westview
        </h1>
        <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
          Browse recently sold homes in the Westview community of Poinciana, Florida to get an idea of market trends and property values in the area.
        </p>
      </div>

      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Sold Listings</h2>

        <div className="flex items-center text-xs md:text-sm text-gray-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>
            {isLoading ? 'Loading latest data...' : `Homes.com Data Updated: ${timestamp}`}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-sm mr-1">Property Type:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                className={`text-xs py-1 px-3 rounded-full ${propertyTypeFilter === "all" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                onClick={() => setPropertyTypeFilter("all")}
                aria-label="Show all property types"
                aria-pressed={propertyTypeFilter === "all"}
              >
                All
              </button>
              <button
                className={`text-xs py-1 px-3 rounded-full ${propertyTypeFilter === "single" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                onClick={() => setPropertyTypeFilter("single")}
                aria-label="Show only single family homes"
                aria-pressed={propertyTypeFilter === "single"}
              >
                Single Family
              </button>
              <button
                className={`text-xs py-1 px-3 rounded-full ${propertyTypeFilter === "townhome" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                onClick={() => setPropertyTypeFilter("townhome")}
                aria-label="Show only townhouses"
                aria-pressed={propertyTypeFilter === "townhome"}
              >
                Townhouse
              </button>
            </div>
          </div>

          <div className="flex gap-2 mt-3 sm:mt-0">
            <button
              onClick={toggleDateSort}
              className={`text-xs md:text-sm flex items-center ${activeSortType === "date" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"} px-3 py-1 rounded-md transition-colors`}
              aria-label={`Sort by date ${dateSortDirection === "desc" ? "oldest first" : "newest first"}`}
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
            <span>Loading sold listings...</span>
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
            <p className="text-gray-600">No sold listings available. Please check back later.</p>
          </div>
        )}
      </div>

      {/* Historical Sales Data Box */}
      <div className="bg-[#f8f9fa] rounded-lg p-6 mb-10">
        <h2 className="text-xl font-bold mb-4">Historical Sales Data</h2>
        <p className="text-gray-600 mb-4">
          Access comprehensive sales data for Westview from our historical records.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://docs.google.com/spreadsheets/d/1r9PBmBPrT0EG1sn7QPYeCFYsjiVQfzvF_6Qnop0nI0U/edit?usp=drivesdk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <div>
              <h3 className="font-medium">2024 Sales Data</h3>
              <p className="text-xs text-gray-500"></p>
            </div>
          </a>

          <a
            href="https://docs.google.com/spreadsheets/d/13CPEH9XaWlt9eJtfhblCwAr8XS9kW_nlLl9vvU-_EEk/edit?usp=drivesdk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition-shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <div>
              <h3 className="font-medium">2025 Sales Data</h3>
              <p className="text-xs text-gray-500"></p>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
