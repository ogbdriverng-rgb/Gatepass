# Gatepass - WhatsApp Forms Made Easy

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your credentials

3. Run development server:
```bash
npm run dev
```

4. Open http://localhost:3000

## Project Structure

- `/pages` - Application pages and routes
- `/components` - Vue components
- `/composables` - Composable functions
- `/server/api` - API endpoints
- `/layouts` - Page layouts
- `/stores` - Pinia stores
- `/types` - TypeScript types

## Features

- ✅ Form builder
- ✅ WhatsApp integration
- ✅ Response management
- ✅ Analytics dashboard
- ✅ Admin panel
- ✅ Billing integration

## Tech Stack

- Nuxt 3
- Vue 3
- TypeScript
- Tailwind CSS
- Supabase
- WhatsApp Cloud API

Quick tip: Auto-regenerate types
Whenever you modify your database schema in Supabase (add/remove tables, columns, etc.), just run:
bashnpm run supabase:types