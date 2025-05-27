"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { currentListings } from "@/data/new-properties";

interface PropertyDetailsClientProps {
  slug: string;
}

// Helper function to get floor plan links based on property ID
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

// Helper function to get property images
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

// Helper function to get builder website link
const getBuilderLink = (company: string) => {
  if (company.toLowerCase().includes("taylor morrison")) {
    return "https://www.taylormorrison.com/fl/orlando/kissimmee/the-townhomes-at-westview/available-homes";
  } else if (company.toLowerCase().includes("lennar")) {
    return "https://www.lennar.com/new-homes/florida/orlando/kissimmee/westview";
  }
  return "#";
};

export function PropertyDetailsClient({ slug }: PropertyDetailsClientProps) {
  const [activeImage, setActiveImage] = useState("");
  const [enlargedView, setEnlargedView] = useState(false);
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

  const propertyImages = getPropertyImages(slug);
  const floorPlanLink = getFloorPlanLink(slug);
  const builderLink = getBuilderLink(property.company);

  // Set the main image as the active image if not set
  if (!activeImage) {
    setActiveImage(property.image);
  }

  // Function to handle image click to enlarge
  const handleImageClick = (img: string) => {
    setActiveImage(img);
    setEnlargedView(true);
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Enlarged Image Modal */}
      {enlargedView && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setEnlargedView(false)}
        >
          <div className="relative w-full max-w-4xl">
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
              onClick={() => setEnlargedView(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full h-[80vh] relative">
              <Image
                src={activeImage}
                alt="Enlarged view"
                fill
                sizes="100vw"
                className="object-contain"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </div>
      )}

      {/* Property Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">{property.address}</h1>
          <p className="text-xl text-gray-700">{property.city}, {property.state} {property.zip}</p>
          <div className="flex items-center mt-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
              {property.propertyType}
            </span>
            <span className="text-gray-600 text-sm">Listed by {property.listedBy} | {property.company}</span>
          </div>
        </div>
        <div className="mt-4 lg:mt-0">
          <h2 className="text-3xl font-bold text-blue-600">{property.price}</h2>
          <p className="text-gray-600 text-sm">Zestimate: ${Math.floor(Number.parseInt(property.price.replace(/[^0-9]/g, "")) * 1.01).toLocaleString()}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images */}
        <div className="lg:col-span-2">
          {/* Primary Image */}
          <div className="mb-6 overflow-hidden rounded-xl shadow-lg relative">
            <div className="w-full h-0 pb-[66.67%] relative">
              <Image
                src={activeImage || property.image}
                alt={`${property.address}, ${property.city}, ${property.state} ${property.zip}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                className="object-cover hover:scale-105 transition-transform duration-300 absolute top-0 left-0 cursor-pointer"
                crossOrigin="anonymous"
                onClick={() => setEnlargedView(true)}
              />
              <div className="absolute bottom-4 right-4">
                <Button
                  className="bg-blue-600 text-white rounded-full p-2"
                  onClick={() => setEnlargedView(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[property.image, ...propertyImages].filter((img, index, self) =>
              self.indexOf(img) === index
            ).slice(0, 6).map((img, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow relative cursor-pointer" onClick={() => handleImageClick(img)}>
                <div className="w-full h-0 pb-[75%] relative">
                  <Image
                    src={img}
                    alt={`Additional view ${index + 1} of ${property.address}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                    className="object-cover hover:scale-105 transition-transform duration-300 absolute top-0 left-0"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Property Description */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{property.description}</p>

            <div className="flex flex-wrap mt-6 gap-4">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href={`/photo-gallery/${slug}`}>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    View All Photos
                  </span>
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link href={floorPlanLink} target="_blank" rel="noopener noreferrer">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                    Download Floor Plan
                  </span>
                </Link>
              </Button>

              <Button asChild variant="outline" className="border-blue-600 text-blue-600">
                <Link href={builderLink} target="_blank" rel="noopener noreferrer">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    Visit Builder's Website
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-1">
          {/* Property Details Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Property Details</h2>

            {/* Key Details */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{property.beds}</p>
                <p className="text-sm text-gray-500">Beds</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{property.baths}</p>
                <p className="text-sm text-gray-500">Baths</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{property.sqft.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Sq Ft</p>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Price per Sq Ft</span>
                <span className="font-semibold">{property.pricePerSqFt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Year Built</span>
                <span className="font-semibold">{property.yearBuilt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lot Size</span>
                <span className="font-semibold">{property.lotSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">MLS #</span>
                <span className="font-semibold">{slug.toUpperCase()}</span>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Request Information
              </Button>
              <Button variant="outline" className="w-full">
                Schedule a Viewing
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Return to Listings</Link>
              </Button>
            </div>
          </div>

          {/* Floor Plan Preview */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Floor Plan</h2>
            <div className="bg-gray-100 p-8 rounded-lg text-center flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-600 mb-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-600 mb-4">View the complete floor plan for this property</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href={floorPlanLink} target="_blank" rel="noopener noreferrer">
                  Download PDF
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Similar Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings
            .filter(p => p.id !== slug && p.propertyType === property.propertyType)
            .slice(0, 3)
            .map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="w-full h-0 pb-[66.67%] relative">
                    <Image
                      src={p.image}
                      alt={p.address}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover absolute top-0 left-0"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{p.address}</h3>
                  <p className="text-gray-600 mb-2">{p.city}, {p.state}</p>
                  <div className="flex justify-between mb-4">
                    <span className="font-bold text-blue-600">{p.price}</span>
                    <span className="text-gray-500 text-sm">{p.sqft.toLocaleString()} sq ft</span>
                  </div>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href={`/property-details/${p.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}