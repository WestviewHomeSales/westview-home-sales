import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { memo, useState, useEffect } from "react";

export interface PropertyCardProps {
  id: string;
  image: string;
  status: "active" | "sold";
  soldDate?: string;
  listingDate?: string;
  priceReduction?: string;
  propertyType: string;
  price: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  pricePerSqFt: string;
  yearBuilt: string;
  lotSize: string;
  description: string;
  listedBy: string;
  company: string;
  photoGalleryLink?: string;
  moreDetailsLink?: string;
}

function PropertyCard({
  id,
  image,
  status,
  soldDate,
  listingDate,
  priceReduction,
  propertyType,
  price,
  address,
  city,
  state,
  zip,
  beds,
  baths,
  sqft,
  pricePerSqFt,
  yearBuilt,
  lotSize,
  description,
  listedBy,
  company,
  photoGalleryLink = "#",
  moreDetailsLink = "#",
}: PropertyCardProps) {
  // Add state to track image source, trimming any leading/trailing spaces
  const [imageSrc, setImageSrc] = useState(image ? image.trim() : "");

  // Only show photo gallery for active listings, never for sold listings
  const hasPhotoGallery =
    status === "active" && photoGalleryLink && photoGalleryLink !== "#";

  const imageAlt = `${address}, ${city}, ${state} ${zip}`;

  // Calculate zestimate once
  const zestimate = Math.floor(
    Number.parseInt(price.replace(/[^0-9]/g, "")) * 1.01
  ).toLocaleString();

  // Generate fallback image URL based on property status
  const fallbackImage =
    status === "active"
      ? "/images/current-fallback.jpeg"
      : "/images/sold-fallback.jpeg";

  // Format the listing attribution to avoid duplication
  const getFormattedListingAttribution = () => {
    // Handle empty or undefined values
    if (!listedBy && !company) return "";
    if (!listedBy) return `Listed by: ${company}`;
    if (!company) return `Listed by: ${listedBy}`;

    // Normalize strings by trimming whitespace and converting to lowercase for comparison
    const normalizedListedBy = listedBy.trim().toLowerCase();
    const normalizedCompany = company.trim().toLowerCase();

    // For sold listings, always show both agent and company
    if (status === "sold") {
      return `Listed by: ${listedBy} | ${company}`;
    }

    // Special case for Lennar listings - show only "Lennar"
    if (
      (normalizedListedBy.includes("lennar") || normalizedCompany.includes("lennar")) &&
      (normalizedListedBy.includes("lennar") || normalizedCompany.includes("lennar realty"))
    ) {
      return "Listed by: Lennar";
    }

    // Case 1: If both are exactly the same, show just one
    if (normalizedListedBy === normalizedCompany) {
      return `Listed by: ${listedBy}`;
    }

    // Case 2: If one string completely contains the other, show only the longer one
    if (normalizedListedBy.includes(normalizedCompany)) {
      return `Listed by: ${listedBy}`;
    }

    if (normalizedCompany.includes(normalizedListedBy)) {
      return `Listed by: ${company}`;
    }

    // Split strings into parts and clean them
    const listedByParts = normalizedListedBy
      .split(/\s*[|,;\/]\s*/)
      .map(part => part.trim())
      .filter(part => part.length > 0);

    const companyParts = normalizedCompany
      .split(/\s*[|,;\/]\s*/)
      .map(part => part.trim())
      .filter(part => part.length > 0);

    // Function to check if a part is a subset of another part or vice versa
    const isRelated = (a: string, b: string): boolean => {
      const simpleA = a.replace(/\bof\b|\binc\b|\bcorp\b|\brealty\b|\bgroup\b/gi, '').trim();
      const simpleB = b.replace(/\bof\b|\binc\b|\bcorp\b|\brealty\b|\bgroup\b/gi, '').trim();

      return (
        simpleA.includes(simpleB) ||
        simpleB.includes(simpleA) ||
        // Check for common company names (e.g., "Taylor Morrison" and "TAYLOR MORRISON REALTY")
        (simpleA.length > 3 && simpleB.length > 3 &&
          (simpleA.startsWith(simpleB) || simpleB.startsWith(simpleA)))
      );
    };

    // Find the primary company name (usually the shortest meaningful one)
    const allParts = [...listedByParts, ...companyParts];

    // Group related parts together
    const groups = [];

    // Process each part
    for (const part of allParts) {
      // Skip empty parts
      if (part.length === 0) continue;

      // Check if this part belongs to an existing group
      let foundGroup = false;
      for (const group of groups) {
        // If any item in the group is related to this part, add it to that group
        if (group.some(groupPart => isRelated(part, groupPart))) {
          group.push(part);
          foundGroup = true;
          break;
        }
      }

      // If not found in any group, create a new group
      if (!foundGroup) {
        groups.push([part]);
      }
    }

    // For each group, find the best representative (prioritize shorter names for cleaner display)
    const bestRepresentatives = groups.map(group => {
      // Sort by length (shortest first) as a starting point
      const sorted = [...group].sort((a, b) => a.length - b.length);

      // Prefer parts from listedBy over company
      const listedByRepresentatives = sorted.filter(part =>
        listedByParts.includes(part)
      );

      return listedByRepresentatives.length > 0 ? listedByRepresentatives[0] : sorted[0];
    });

    // Get the original case versions from the input strings
    const allOriginalParts = [
      ...listedBy.split(/\s*[|,;\/]\s*/).map(p => p.trim()),
      ...company.split(/\s*[|,;\/]\s*/).map(p => p.trim())
    ].filter(p => p.length > 0);

    // Map from normalized parts to original case
    const normalizedToOriginal: Record<string, string> = {};
    for (const part of allOriginalParts) {
      const normalized = part.toLowerCase();
      // Prefer listedBy parts (they come first in the array)
      if (!normalizedToOriginal[normalized]) {
        normalizedToOriginal[normalized] = part;
      }
    }

    // Get original case for each best representative
    const originalCaseRepresentatives = bestRepresentatives.map(rep => {
      return normalizedToOriginal[rep] || rep;
    });

    // Join the unique, representative parts
    return `Listed by: ${originalCaseRepresentatives.join(' | ')}`;
  };

  // Check if image URL is valid on component mount
  useEffect(() => {
    // First, ensure the image URL has no leading/trailing spaces
    const trimmedImage = image ? image.trim() : "";

    // Hardcoded images for specific properties
    if (address === "3124 Skyline Loop") {
      setImageSrc("/images/sold-properties/3124-skyline-loop.jpg");
    } else if (address === "5863 Le Marin Way") {
      setImageSrc("/images/sold-properties/5863-le-marin-way.jpg");
    } else if (address === "4796 Yellow Elder Way") {
      setImageSrc("/images/sold-properties/4796-yellow-elder-way.jpg");
    } else if (address === "4707 Coral Harbour Rd") {
      setImageSrc("/images/sold-properties/4707-coral-harbour-rd.jpg");
    } else if (address === "2626 Skyline Loop") {
      setImageSrc("/images/sold-properties/2626-skyline-loop-new.jpeg");
    } else if (!trimmedImage) {
      setImageSrc(fallbackImage);
    } else if (trimmedImage.startsWith('/')) {
      // Local image path, use as is
      setImageSrc(trimmedImage);
    } else if (trimmedImage.startsWith('https://')) {
      // Remote image URL, use with caution
      setImageSrc(trimmedImage);
    } else {
      // Other formats or invalid URLs, use fallback
      setImageSrc(fallbackImage);
    }
  }, [address, image, fallbackImage]);

  return (
    <div className="bg-white rounded-md shadow-md overflow-hidden h-full flex flex-col">
      <div className="relative">
        {status === "active" && (
          <div className="property-badge badge-active">Active</div>
        )}
        {status === "sold" && soldDate && (
          <div className="property-badge badge-active">SOLD {soldDate}</div>
        )}
        {priceReduction && (
          <div className="property-badge badge-reduced">
            REDUCED {priceReduction}
          </div>
        )}
        <Image
          key={`property-image-${id}-${imageSrc}`}
          src={imageSrc}
          alt={imageAlt}
          width={500}
          height={300}
          className="w-full h-48 object-cover"
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={80}
          onError={() => {
            console.log(`Error loading image for ${id}: ${imageSrc}`);
            setImageSrc(fallbackImage);
          }}
          unoptimized={imageSrc.startsWith('/')}
        />
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <div className="flex flex-col xs:flex-row justify-between mb-2">
          <h3 className="text-xl font-bold">{price}</h3>
          <p className="text-gray-500 text-sm mt-1 xs:mt-0">
            Zestimate: ${zestimate}
          </p>
        </div>
        <p className="text-gray-700 mb-3 break-words">
          {address}, {city}, {state} {zip}
        </p>

        <div className="property-details-grid">
          <div>
            <p className="property-info-label">Beds</p>
            <p className="property-info-value">{beds}</p>
          </div>
          <div>
            <p className="property-info-label">Baths</p>
            <p className="property-info-value">{baths}</p>
          </div>
          <div>
            <p className="property-info-label">Sq Ft</p>
            <p className="property-info-value">{sqft.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center my-3">
          <div>
            <p className="property-info-label">Price/Sq Ft</p>
            <p className="property-info-value">{pricePerSqFt}</p>
          </div>
          <div>
            <p className="property-info-label">Year Built</p>
            <p className="property-info-value">{yearBuilt}</p>
          </div>
          <div>
            <p className="property-info-label">Lot Size</p>
            <p className="property-info-value">{lotSize}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 mt-auto">
          {getFormattedListingAttribution()}
        </p>

        <div
          className={`${
            hasPhotoGallery
              ? "grid grid-cols-1 xs:grid-cols-2 gap-2"
              : "flex justify-center"
          }`}
        >
          <Button
            className={`w-full bg-blue-600 hover:bg-blue-700 ${
              !hasPhotoGallery ? "max-w-xs" : ""
            }`}
            size="sm"
            asChild
          >
            <Link
              href={moreDetailsLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              More Details
            </Link>
          </Button>

          {hasPhotoGallery && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              size="sm"
              asChild
            >
              <Link
                href={photoGalleryLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Photo Gallery
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(PropertyCard);
