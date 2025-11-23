# Ratai24 Frontend - Quick Start Guide

## ✅ Installation Complete!

Your Ratai24 car rental frontend application has been successfully created!

## 🚀 Getting Started

The development server is already running at: **http://localhost:5173**

### Available Commands

```bash
npm run dev      # Start development server (already running!)
npm run build    # Create production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## 📂 Project Structure

```
ratai24-ui/
├── src/
│   ├── api/              # API integration (auth, cars, cities, contracts)
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Button, Input, Modal, Card, etc.
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/        # React Context (AuthContext)
│   ├── lib/            # API client with interceptors
│   ├── pages/          # All page components
│   │   ├── admin/      # Admin dashboard pages
│   │   ├── HomePage.tsx
│   │   ├── CarsPage.tsx
│   │   ├── CarDetailPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── UserDashboard.tsx
│   ├── types/          # TypeScript definitions
│   ├── App.tsx         # Main app with routing
│   └── main.tsx        # Entry point
├── .env                # Environment variables
└── README.md          # Full documentation
```

## 🔑 Features Implemented

### Public Access (No Login Required)
- ✅ Landing page with city showcase
- ✅ Car catalog with advanced filters
- ✅ Car detail view
- ✅ Login/Register pages

### User Features (Requires Login)
- ✅ Create car reservations
- ✅ View my contracts
- ✅ Complete/cancel reservations
- ✅ Personal dashboard

### Admin Features (Admin Role Only)
- ✅ Manage cities (CRUD)
- ✅ Manage cars (CRUD)
- ✅ Manage all contracts
- ✅ Admin dashboard with tabs

## 🎨 UI/UX Features

- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Modern Tailwind CSS styling
- ✅ Lithuanian language interface
- ✅ Loading states and spinners
- ✅ Error handling
- ✅ Accessible forms
- ✅ Modal dialogs
- ✅ Protected routes with role-based access

## 🔐 Authentication

- ✅ JWT-based authentication
- ✅ Automatic token refresh
- ✅ Secure API requests
- ✅ Role-based access control (USER/ADMIN)

## 🌐 API Integration

- **Base URL**: https://ratai24.onrender.com
- **Auto-retry**: Failed requests are retried once
- **Token refresh**: Automatic JWT renewal
- **Type-safe**: Full TypeScript support

## 📱 Routes

```
Public Routes:
  /                    - Home page
  /cars                - Car catalog
  /cars/:id            - Car details
  /login               - Login page
  /register            - Register page

User Routes (Protected):
  /dashboard           - User dashboard

Admin Routes (Protected):
  /admin               - Admin dashboard (redirects to /admin/cities)
  /admin/cities        - Manage cities
  /admin/cars          - Manage cars
  /admin/contracts     - View all contracts
```

## 🧪 Testing the Application

### As a Guest:
1. Open http://localhost:5173
2. Browse cars on the home page
3. Click "Automobiliai" to see full catalog
4. Use filters to search for specific cars
5. Click on a car to see details

### As a User:
1. Click "Registruotis" to create an account
2. Login with your credentials
3. Browse cars and click "Rezervuoti"
4. Fill in booking details
5. View your reservations in "Mano Rezervacijos"

### As an Admin:
1. Login with admin credentials
2. Navigate to "Administravimas"
3. Manage cities, cars, and contracts
4. Try CRUD operations on each resource

## 🐛 Known Considerations

### Render.com Cold Start
Your backend on Render.com may go to sleep after inactivity. The first request might take 30-60 seconds to wake up the server. The frontend handles this gracefully with:
- Loading states
- Retry logic
- User-friendly error messages

### Future Enhancements (Optional)
- Toast notifications for better UX feedback
- Image upload for cars
- Advanced date picker for reservations
- Email notifications
- Payment integration
- Car availability calendar

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify the backend is running
3. Check `.env` file has correct API_URL
4. Ensure you're using Node.js 20.19+ or 22.12+

## 🎉 You're All Set!

Your car rental frontend is ready to use. The application is:
- ✅ Fully functional
- ✅ Type-safe with TypeScript
- ✅ Responsive and accessible
- ✅ Connected to your backend API
- ✅ Ready for production deployment

Enjoy building your car rental platform! 🚗💨
