"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { currentListings } from "@/data/new-properties";
import { useState, useEffect } from "react";

interface PhotoGalleryClientProps {
  slug: string;
}

export function PhotoGalleryClient({ slug }: PhotoGalleryClientProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [listings, setListings] = useState(currentListings);

  // Fetch listings from static JSON file
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('/api/listings.json');
        if (response.ok) {
          const data = await response.json();
          if (data?.currentListings?.length > 0) {
            setListings(data.currentListings);
          }
        }
      } catch (error) {
        console.error('Failed to fetch listings, using fallback data:', error);
      }
    };
    
    fetchListings();
  }, []);

  // Find the property in our data
  const property = listings.find(p => p.id === slug);

  if (!property) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Property Not Found</h1>
        <p>The property you are looking for could not be found.</p>
        <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700">
          <Link href="/">Return to Listings</Link>
        </Button>
      </main>
    );
  }

  // Helper function to get additional images based on property ID
  const getPropertyImages = (id: string) => {
    switch (id) {
      case 'tm1':
      case 'tm2':
      case 'tm3':
        return [
          "/images/taylor-morrison/ivy/exterior.jpeg",
          "/images/taylor-morrison/ivy/living-room.jpeg",
          "/images/taylor-morrison/ivy/kitchen.jpeg",
          "/images/taylor-morrison/ivy/bedroom.jpeg",
          "/images/taylor-morrison/ivy/bathroom.jpeg"
        ];
      case 'ln1':
        return [
          "/images/lennar/aspen/exterior.jpeg",
          "/images/lennar/interior.jpeg"
        ];
      case 'ln2':
        return [
          "/images/lennar/cypress/exterior.jpeg",
          "/images/lennar/interior.jpeg"
        ];
      case 'ln3':
        return [
          "/images/lennar/dawn/exterior.jpeg",
          "/images/lennar/interior.jpeg"
        ];
      default:
        return [];
    }
  };

  const allImages = [property.image, ...getPropertyImages(slug)];

  // Remove duplicates from the array of images
  const uniqueImages = [...new Set(allImages)];

  // Helper function to get image type label
  const getImageLabel = (img: string) => {
    if (img.includes("exterior")) return "Exterior View";
    if (img.includes("living-room") || img.includes("living")) return "Living Room";
    if (img.includes("kitchen")) return "Kitchen";
    if (img.includes("bedroom")) return "Bedroom";
    if (img.includes("bathroom")) return "Bathroom";
    if (img.includes("interior")) return "Interior View";
    return "Property View";
  };

  // Helper function to get floor plan link based on property ID
  const getFloorPlanLink = (id: string) => {
    switch (id) {
      case 'tm1':
      case 'tm2':
      case 'tm3':
        return "/floor-plans/tm/townhomes/Ivy-1219-SF.pdf";
      case 'ln1':
        return "/floor-plans/tm/townhomes/Hazel-1180-SF.pdf";
      case 'ln2':
        return "/floor-plans/lennar/aden-south-1/Atlanta-1879-SF.pdf";
      case 'ln3':
        return "/floor-plans/lennar/aden-south-1/Dawn-2174-SF.pdf";
      default:
        return "#";
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold mb-2">Photo Gallery</h1>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-xl text-gray-700">{property.address}, {property.city}, {property.state} {property.zip}</h2>
            <p className="text-gray-600 mt-1 mb-4 md:mb-0">{property.propertyType} | {property.beds} Beds | {property.baths} Baths | {property.sqft.toLocaleString()} Sq. Ft. | {property.price}</p>
          </div>
          <div className="flex space-x-3">
            <Button asChild variant="outline">
              <Link href={getFloorPlanLink(slug)} target="_blank" rel="noopener noreferrer">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  Floor Plan
                </span>
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href={`/property-details/${slug}`}>
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Property Details
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Image Gallery */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-xl shadow-lg mb-4 bg-gray-100 h-[500px] flex items-center justify-center">
          {uniqueImages.length > 0 ? (
            <Image
              src={uniqueImages[activeImage]}
              alt={`${property.address} - ${getImageLabel(uniqueImages[activeImage])}`}
              fill
              className="object-contain"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="text-center p-6">
              <p className="text-lg text-gray-500">No images available</p>
            </div>
          )}

          {uniqueImages.length > 1 && (
            <>
              <button
                onClick={() => setActiveImage((prevIndex) => (prevIndex === 0 ? uniqueImages.length - 1 : prevIndex - 1))}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setActiveImage((prevIndex) => (prevIndex === uniqueImages.length - 1 ? 0 : prevIndex + 1))}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        <p className="text-center text-gray-700 font-medium mb-6">
          {`${activeImage + 1} / ${uniqueImages.length}: ${getImageLabel(uniqueImages[activeImage])}`}
        </p>

        {/* Thumbnails */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-4">
          {uniqueImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`relative h-20 overflow-hidden rounded-md ${activeImage === index ? 'ring-2 ring-blue-600' : 'opacity-80 hover:opacity-100'}`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                crossOrigin="anonymous"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Property Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-2">Property Features</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              {property.propertyType}
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              {property.beds} Bedrooms
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
              {property.baths} Bathrooms
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-2">Specifications</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              {property.sqft.toLocaleString()} Sq. Ft.
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              {property.pricePerSqFt} Price/Sq Ft
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {property.lotSize} Lot Size
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-2">Additional Details</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Built in {property.yearBuilt}
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              Listed by: {property.listedBy}
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z" clipRule="evenodd" />
              </svg>
              {property.company}
            </li>
          </ul>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button asChild variant="outline">
          <Link href="/">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Return to Listings
            </span>
          </Link>
        </Button>

        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href={`/property-details/${slug}`}>
            <span className="flex items-center">
              Property Details
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>
        </Button>
      </div>
    </main>
  );
}