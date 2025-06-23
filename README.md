# Cosmolaser Content Gap Analyzer UI

A web-based content gap analyzer for Cosmolaser.dk built with Next.js and deployed on Vercel.

## Features

- 🎯 **Content Gap Analysis**: Identify keywords competitors rank for but you don't
- 👥 **Competitor Management**: Add/remove competitor domains
- 🔍 **Treatment Keywords**: Filter analysis by specific cosmetic treatment types
- 📊 **Priority Scoring**: Automatic priority calculation based on search volume, competition, and CPC
- 📈 **Results Dashboard**: Sortable table with filtering options
- 📥 **Excel Export**: Download detailed analysis results

## Setup

### 1. Environment Variables

Create a `.env.local` file with your DataForSEO credentials:

```bash
cp .env.example .env.local
# Edit .env.local with your actual credentials
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### 1. Connect to GitHub

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository

### 2. Configure Environment Variables

In your Vercel project settings, add the following environment variables:

- `DATAFORSEO_LOGIN`: Your DataForSEO login
- `DATAFORSEO_PASSWORD`: Your DataForSEO password
- `TARGET_DOMAIN`: Your target domain (optional, defaults to cosmolaser.dk)

### 3. Deploy

Vercel will automatically deploy your application. Every push to the main branch will trigger a new deployment.

## Usage

### 1. Configure Settings

- Click "⚙️ Indstillinger" to open the configuration panel
- Set your target domain
- Add competitor domains
- Select treatment keywords or add custom ones
- Enable/disable keyword filtering

### 2. Run Analysis

- Click "🚀 Start Content Gap Analyse" to begin the analysis
- Wait for the analysis to complete (usually 30-60 seconds)
- Review the results in the table

### 3. Export Results

- Click "📥 Download Excel" to export the results to an Excel file
- The file includes separate sheets for target keywords, competitor keywords, and content gaps

## API Endpoints

- `GET /api/settings` - Load current settings
- `POST /api/settings` - Save settings
- `POST /api/analyze` - Run content gap analysis
- `POST /api/export` - Export results to Excel

## Project Structure

```
cosmolaser-ui/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/          # Analysis API endpoint
│   │   │   ├── export/           # Excel export endpoint
│   │   │   └── settings/         # Settings management
│   │   └── page.tsx              # Main application page
│   └── components/
│       ├── Dashboard.tsx         # Main dashboard component
│       ├── Configuration.tsx     # Settings configuration
│       └── Results.tsx           # Results display and filtering
├── data/
│   └── settings.json            # Persistent settings storage
└── requirements.txt             # Python dependencies for serverless functions
```

## Treatment Keywords Categories

The application includes predefined categories of cosmetic treatment keywords:

- **Permanent hårfjerning**: Laser hair removal terms
- **Botox**: Botox and wrinkle treatments
- **Filler**: Dermal filler treatments
- **Karsprængninger**: Vascular treatments
- **Pigmentforandringer**: Pigmentation treatments
- **CO2 laser**: CO2 laser treatments

## Troubleshooting

### Analysis Fails

1. Check that your DataForSEO credentials are correct
2. Ensure you have sufficient API credits
3. Verify that competitor domains are accessible
4. Check Vercel function logs for detailed error messages

### Export Doesn't Work

1. Ensure the analysis completed successfully
2. Check browser console for JavaScript errors
3. Verify that results contain data

### Settings Don't Save

1. Check that the data directory is writable
2. Verify API endpoints are responding
3. Check network tab in browser dev tools

## Support

For issues and questions:
1. Check the Vercel function logs
2. Review browser console for errors
3. Verify API credentials and settings

## License

This project is for internal use at Cosmolaser.dk.
