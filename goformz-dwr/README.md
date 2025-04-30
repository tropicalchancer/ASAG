# GoFormz DWR Dashboard

A Next.js application that fetches Daily Work Reports from GoFormz and provides a web interface to view and download the data.

## Features

- Fetches Honda DWR forms from GoFormz API daily
- Displays forms in a clean, responsive table
- Export data to Excel with one click
- Automated daily data collection via Vercel Cron Jobs

## Prerequisites

- Node.js 18+ and npm
- GoFormz API credentials
- Vercel account (for deployment)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd goformz-dwr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment example file and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your GoFormz credentials:
   - `GOFORMZ_USER`: Your GoFormz email
   - `GOFORMZ_TOKEN`: Your GoFormz API token
   - `GOFORMZ_TEMPLATE_ID`: Your Honda DWR template ID

   To find your template ID:
   1. Make a GET request to `https://api.goformz.com/v2/templates`
   2. Look for the template named "Honda DWR"
   3. Copy the `id` field

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Visit `http://localhost:3000/daily` to view the dashboard

## Deployment

1. Push your code to a Git repository (GitHub, GitLab, etc.)

2. Import your project into Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Add the following environment variables:
     - `GOFORMZ_USER`
     - `GOFORMZ_TOKEN`
     - `GOFORMZ_TEMPLATE_ID`

3. Deploy!

## Customization

### Field Mapping

The field mappings in `src/lib/goformz.ts` need to match your GoFormz template field names. Update the `fetchFormData` function with your actual field names:

```typescript
return {
  date: form.fields['Your_Date_Field']?.value || '',
  name: form.fields['Your_Name_Field']?.value || '',
  // ... other fields
};
```

### TODO Items

The code includes several TODO comments for future enhancements:
- Authentication middleware
- Caching layer
- Database integration
- Additional features

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
