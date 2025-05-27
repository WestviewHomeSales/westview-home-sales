import { PhotoGalleryClient } from "./photo-gallery-client";

// Generate static params for static export
export async function generateStaticParams() {
  // Get current listings from the static JSON file
  try {
    const fs = require('fs');
    const path = require('path');
    const listingsPath = path.join(process.cwd(), 'public', 'api', 'listings.json');
    
    if (fs.existsSync(listingsPath)) {
      const data = JSON.parse(fs.readFileSync(listingsPath, 'utf8'));
      return data.currentListings.map((listing: { id: string }) => ({
        slug: listing.id
      }));
    }
  } catch (error) {
    console.error('Error generating static params for photo gallery:', error);
  }
  
  // Fallback to empty array if no static data
  return [];
}

export default async function PhotoGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PhotoGalleryClient slug={slug} />;
}