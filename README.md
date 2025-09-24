# Legacy In Order

This readme provides information on both the frontend and and backend of the LIO application.

The frontend is a React application built with Vite while the backend is a NoCode app built on Xano.


## Backend
The Xano backend has 3 configured environments: 
- **local** (use this for development)
- **dev-env** (use this is for the UAT environments spun on vercel)
- **v1** (this is for production)

The backend also has 2 configured databases **live** and **dev**.

### Connecting to the backend

The frontend connects to different backend environments based on the `VITE_ENV` environment variable:

- **Development**: Uses `local` branch with `dev` database (X-Data-Source: dev header)
- **UAT/Staging**: Uses `dev-env` branch with `dev` database (X-Data-Source: dev header)  
- **Production**: Uses `v1` branch (default on Xano) with `live` database (no X-Data-Source header)

The frontend automatically includes the `X-Data-Source: dev` header for all non-production environments to ensure proper database routing.

### Deployment: Migrating the backend

When deploying backend changes:

1. **Local Development**: Make changes directly in the `local` environment
2. **UAT Testing**: 
   - Export changes from `local` environment
   - Import to `dev-env` environment
   - Test thoroughly on Vercel UAT deployments
3. **Production Deployment**:
   - Export changes from `dev-env` environment  
   - Import to `v1` environment
   - Verify all functionality in production

Here's a link to documentation on how to properly merge branches: https://docs.xano.com/team-collaboration/branching-and-merging#merging 

### Deployment: Migrating the database

Database migrations should be handled carefully:

1. **Development Database (`dev`)**:
   - Safe for testing schema changes
   - Can be reset/recreated as needed
   - Used by both `local` and `dev-env` environments

2. **Production Database (`live`)**:
   - Contains real user data - handle with extreme care
   - Always backup before making changes
   - Test migrations on `dev` database first
   - Use Xano's built-in migration tools

Here's a link to documentation on db migration: https://www.xano.com/learn/Migrate-Data-Between-Data-Source-Environments/

### Environment Variables
The following environment variables need to be set on Xano's backend
```
mailgun_private_key
mailgun_domain
mailgun_from_email
stripe_api_secret
admin_emails
debug_emails
test_stripe_api_secret
```

## Frontend
The frontend is hosted on Vercel.

### Prerequisites for local development

- Node.js (version 18 or higher)
- npm (comes with Node.js)
- Git (for version control)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd legacyInOrder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local` (if available)
   - Configure required environment variables (see Environment Variables section)

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
```

### Deployment

The frontend is automatically deployed to Vercel:

1. **Automatic Deployment**: 
   - Pushes to `main` branch trigger production deployment
   - Pull requests create preview deployments for testing

2. **Manual Deployment**:
   - Use Vercel CLI: `vercel --prod`
   - Or deploy through Vercel dashboard

3. **Environment Configuration**:
   - Production: Uses production environment variables
   - Preview: Uses development environment variables
   - Local: Uses `.env` file

### Environment Variables

The following environment variables need to be configured:

**Required for all environments:**
```
VITE_API_BASE_URL=<backend-api-url>
VITE_ENV=<environment-name>
VITE_STRIPE_WILL_PRICE_ID=<stripe-will-price-id>
```