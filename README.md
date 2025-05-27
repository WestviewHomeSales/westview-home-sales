# Westview Home Sales Website

Automated website for Westview Home Sales with daily listing updates and FTP deployment.

## 🏠 About

This is a Next.js-based real estate website that automatically updates property listings daily and deploys to a shared hosting environment via FTP. The site features current listings from IDX Broker and sold property history from Homes.com.

## 🚀 Features

- **Automated Daily Updates**: Current and sold listings update automatically at 1 AM EST
- **Append-Only Sold Listings**: Sold properties are never removed, only new ones are added
- **Static Site Generation**: Optimized for shared hosting environments
- **FTP Deployment**: Automated deployment to production server
- **Search Engine Notifications**: Automatic sitemap pings to Google and Bing

## 🛠 Technology Stack

- **Framework**: Next.js 15.2.0 with static export
- **Styling**: Tailwind CSS
- **Runtime**: Bun
- **Language**: TypeScript
- **Deployment**: GitHub Actions + FTP
- **Data Sources**: IDX Broker API, Homes.com scraping

## 📦 Project Structure

```
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── data/         # Static data files
│   └── lib/          # Utility functions
├── server/
│   └── functions/    # Update scripts and automation
├── public/           # Static assets
├── .github/
│   └── workflows/    # GitHub Actions automation
└── scripts/          # Build and deployment scripts
```

## 🔄 Automated Update System

### Daily Schedule
- **Time**: 1 AM EST (6 AM UTC) daily
- **Current Listings**: Fetched from IDX Broker API
- **Sold Listings**: Scraped from Homes.com (append-only)
- **Build & Deploy**: Static site generation and FTP upload

### Update Process
1. Fetch new current listings from IDX Broker
2. Fetch and append new sold listings from Homes.com
3. Generate static data for Next.js
4. Build static site with `bun run build`
5. Deploy to FTP server
6. Commit updated data to repository
7. Notify search engines of sitemap changes

### Data Sources
- **Current Listings**: `http://borchinirealty.idxbroker.com/i/westview`
- **Sold Listings**: `https://www.homes.com/sold/?sk=ktIpHZv3jTy30im3fzhdtCpyRhOqcbf_4OOs0F_GCt4&bb=_pg20o6_6Gk5kglG`

## 🔧 Setup & Configuration

### Repository Secrets Required
```
FTP_SERVER=ftp.westviewhomesales.com
FTP_USERNAME=your_ftp_username
FTP_PASSWORD=your_ftp_password
```

### Local Development
```bash
# Install dependencies
bun install

# Install server function dependencies
cd server/functions && bun install

# Run development server
bun run dev

# Build for production
bun run build
```

### Manual Update Testing
```bash
# Test current listings update
cd server/functions
node update-current-listings.js

# Test sold listings update (append-only)
node update-sold-listings.js

# Generate static data
node scripts/generate-static-data.js
```

## 📁 Key Files

- **Update Scripts**:
  - `server/functions/update-current-listings.js` - IDX Broker integration
  - `server/functions/update-sold-listings.js` - Homes.com scraping (append-only)
  
- **Automation**:
  - `.github/workflows/daily-update.yml` - GitHub Actions workflow
  - `scripts/generate-static-data.js` - Static data generation
  
- **Configuration**:
  - `next.config.js` - Next.js static export configuration
  - `package.json` - Dependencies and scripts

## 🎯 Deployment

The site automatically deploys to https://westviewhomesales.com via:
1. GitHub Actions workflow triggers daily or manually
2. Static site built with Next.js export
3. Files uploaded to FTP server at `public_html/`
4. Live site updated with new listings

## 📊 Monitoring

- **GitHub Actions**: View workflow runs in the Actions tab
- **Data Updates**: Check commit history for automated data updates
- **Build Status**: Monitor workflow summaries for success/failure reports

## 🔒 Data Integrity

- **Sold Listings**: Never deleted, only appended to preserve history
- **Backup System**: Automatic backups created before data updates
- **Error Handling**: Continues operation even if individual steps fail
- **Rollback Protection**: Safety checks prevent data loss

## 🌐 Live Website

Visit the live site at: https://westviewhomesales.com

## 📞 Support

For technical issues or questions about the automation system, check the GitHub Issues tab or review the workflow logs in GitHub Actions.