# Ratai24 - Automobilių nuomos sistema
For testing & demo purposes, a site was published with limited resources, but needs to wait a bit for server-side to load:
https://ratai24-ui.onrender.com/
Modern car rental platform built with React, TypeScript, and Tailwind CSS.

## Features

- 🚗 **Car Browsing**: Browse available cars with advanced filtering
- 🔐 **Authentication**: Secure login and registration with JWT
- 📅 **Booking System**: Easy car reservation with date selection
- 👤 **User Dashboard**: Manage your reservations
- ⚙️ **Admin Panel**: Complete CRUD operations for cities, cars, and contracts
- 🌍 **Multi-city Support**: Rent cars in different Lithuanian cities
- 📱 **Responsive Design**: Works seamlessly on all devices

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/matasmtj/ratai24-ui.git
cd ratai24-ui
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API URL:
```
VITE_API_URL=https://ratai24.onrender.com
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## User Roles

### Guest (Unauthenticated)
- View landing page
- Browse cars catalog
- View car details
- View available cities

### User (Authenticated)
- All guest permissions
- Create car reservations
- View and manage own contracts
- Cancel reservations
- Complete contracts

### Admin
- All user permissions
- Manage cities (CRUD)
- Manage cars (CRUD)
- Manage all contracts (CRUD)
- View all system data

## API Integration

The frontend integrates with the Ratai24 REST API. Key features:

- **Automatic token refresh**: Handles JWT token expiration automatically
- **Request interceptors**: Adds authentication headers to requests
- **Error handling**: Graceful error handling with user feedback
- **Type safety**: Full TypeScript support with generated types from OpenAPI spec

## Environment Variables

- `VITE_API_URL`: Backend API base URL (default: https://ratai24.onrender.com)

## License

This project is part of an academic project.
