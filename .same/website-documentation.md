# Westview Home Sales Website Documentation

## Project Overview
Next.js real estate website for Westview Home Sales, featuring current listings, sold properties, floor plans, and contact functionality.

## Technical Stack
- **Framework**: Next.js 15.2.0 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Type Safety**: TypeScript
- **Package Manager**: Bun
- **Deployment**: Static export to FTP server
- **Email**: Nodemailer with SMTP/SendGrid support

## Key Features
- Responsive design optimized for mobile and desktop
- Property listing cards with image galleries
- Interactive sorting by date and price
- Contact form with email notifications
- Floor plan downloads
- SEO optimization with meta tags and sitemap
- Static site generation for fast loading

## Recent Fixes

### Date Filter Button Issue (Fixed)
**Problem**: The Date filter button on the Current Listings page was not working properly. Clicking it would not sort the listings by date.

**Root Cause**: The static data generation script (`scripts/generate-static-data.js`) was creating artificial listing dates using random offsets, which resulted in an unsorted data structure that broke the client-side sorting functionality.

**Solution**: 
1. Modified the data generation script to create listing dates in proper descending order (newest to oldest)
2. Changed from random date generation to sequential date generation with small randomness for natural appearance
3. Each listing is now approximately 3 days older than the previous one, with 0-2 days of randomness

**Files Modified**:
- `scripts/generate-static-data.js` - Fixed date generation logic
- `src/app/page.tsx` - Added data-testid attributes for testing

**Result**: The Date filter button now works correctly, allowing users to sort listings by newest/oldest dates. The default view shows listings in chronological order (newest first).

## Overview

This is a Next.js-based real estate website for showcasing properties in the Westview community. The website features:

- Current property listings
- Sold property listings
- Floor plans from various builders
- Contact form
- Photo gallery
- Useful information for buyers

## Project Structure

### Main Directories

- `/src/app`: Next.js application routes and pages
- `/src/components`: Reusable React components
- `/src/data`: Data handling functions
- `/src/lib`: Utility libraries
- `/public`: Static assets (images, PDFs, etc.)
- `/db-cache`: JSON files containing property data
- `/server`: Server-side functions and utilities

### Key Files

- `src/app/page.tsx`: Homepage
- `src/app/property-details/[slug]/page.tsx`: Individual property page
- `src/app/sold/page.tsx`: Sold properties page
- `src/app/floor-plans/page.tsx`: Floor plans page
- `src/app/contact/page.tsx`: Contact page
- `src/app/api/contact/route.ts`: Contact form API endpoint
- `src/components/layout/header.tsx`: Site header
- `src/components/layout/footer.tsx`: Site footer
- `src/components/property/property-card.tsx`: Property listing card

## Data Structure

Property data is stored in JSON files in the `/db-cache` directory:
- `current-listings-latest.json`: Active property listings
- `sold-listings-latest.json`: Sold property listings
- `timestamps.json`: Data update timestamps

## Server Functions

The `/server/functions` directory contains scripts for:
- Updating property listings data
- Sending emails from the contact form
- Updating sold listings
- Pinging search engines with updates

## Deployment Requirements

### Environment Variables

The following environment variables should be set in production:
- `NEXT_PUBLIC_SITE_URL`: Your domain (https://westviewhomesales.com)
- `NEXT_PUBLIC_SITE_NAME`: Site name
- `EMAIL_FROM`: Sender email for contact form
- `EMAIL_TO`: Recipient email for contact form
- `SENDGRID_API_KEY` (optional): For email delivery

### Regular Updates

The website includes functionality for regular data updates. Consider setting up cron jobs using the scripts in `/server/setup`.

## Customization

### Branding

To customize the branding:
1. Update colors in `tailwind.config.ts`
2. Replace logos and favicon in `/public`
3. Update site name in `.env.local`

### Content

Property listings are updated automatically through the server functions, but you can manually edit:
- Static content in page files
- Images in `/public/images`
- Floor plans in `/public/floor-plans`

## Development

### Local Development

```bash
# Start development server
bun run dev

# Run linting
bun run lint

# Format code
bun run format
```

### Testing Data Updates

```bash
# Test the update process
bun run test-update

# Simulate a data update
bun run simulate-update
```