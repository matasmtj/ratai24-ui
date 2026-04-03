import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';

// Pages
import { HomePage } from './pages/HomePage';
import { CarsPage } from './pages/CarsPage';
import { CarSalePage } from './pages/CarSalePage';
import { CarDetailPage } from './pages/CarDetailPage';
import { CarSaleDetailPage } from './pages/CarSaleDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ContactsPage } from './pages/ContactsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { RentalTermsPage } from './pages/RentalTermsPage';
import { UserDashboard } from './pages/UserDashboard';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCitiesPage } from './pages/admin/AdminCitiesPage';
import { AdminCarsPage } from './pages/admin/AdminCarsPage';
import { AdminContractsPage } from './pages/admin/AdminContractsPage';
import { AdminContactsPage } from './pages/AdminContactsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminPricingDashboard } from './pages/admin/AdminPricingDashboard';
import { AdminPricingRulesPage } from './pages/admin/AdminPricingRulesPage';
import { AdminSeasonalFactorsPage } from './pages/admin/AdminSeasonalFactorsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/car-sale" element={<CarSalePage />} />
            <Route path="/car-sale/:id" element={<CarSaleDetailPage />} />
            <Route path="/cars/:id" element={<CarDetailPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/rental-terms" element={<RentalTermsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="USER">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requiredRole="USER">
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/cars" replace />} />
              <Route path="cities" element={<AdminCitiesPage />} />
              <Route path="cars" element={<AdminCarsPage />} />
              <Route path="contracts" element={<AdminContractsPage />} />
              <Route path="contacts" element={<AdminContactsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="pricing" element={<AdminPricingDashboard />} />
              <Route path="pricing/rules" element={<AdminPricingRulesPage />} />
              <Route path="pricing/seasonal" element={<AdminSeasonalFactorsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
