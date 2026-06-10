import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';
import { LocaleLayout } from './components/LocaleLayout';
import { DEFAULT_LANG } from './i18n/routes';

// Pages
import { HomePage } from './pages/HomePage';
import { CarsPage } from './pages/CarsPage';
import { CarSalePage } from './pages/CarSalePage';
import { CarDetailPage } from './pages/CarDetailPage';
import { CarSaleDetailPage } from './pages/CarSaleDetailPage';
import { PartsPage } from './pages/PartsPage';
import { PartDetailPage } from './pages/PartDetailPage';
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
import { AdminPartsPage } from './pages/admin/AdminPartsPage';
import { AdminContractsPage } from './pages/admin/AdminContractsPage';
import { AdminContactsPage } from './pages/AdminContactsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminLegalPagesPage } from './pages/admin/AdminLegalPagesPage';
import { AdminPricingDashboard } from './pages/admin/AdminPricingDashboard';
import { AdminPricingRulesPage } from './pages/admin/AdminPricingRulesPage';
import { AdminSeasonalFactorsPage } from './pages/admin/AdminSeasonalFactorsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function LegacyRedirect({ path }: { path: string }) {
  const { id } = useParams<{ id: string }>();
  const target = id ? `${path}/${id}` : path;
  return <Navigate to={`/${DEFAULT_LANG}${target}`} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Locale-prefixed public routes */}
      <Route path="/:lang" element={<LocaleLayout />}>
        <Route index element={<HomePage />} />
        <Route path="rent-cars" element={<CarsPage />} />
        <Route path="rent-cars/:id" element={<CarDetailPage />} />
        <Route path="sale-cars" element={<CarSalePage />} />
        <Route path="sale-cars/:id" element={<CarSaleDetailPage />} />
        <Route path="parts" element={<PartsPage />} />
        <Route path="parts/:id" element={<PartDetailPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="rental-terms" element={<RentalTermsPage />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />

      {/* Legacy redirects (no locale prefix) */}
      <Route path="/rent-cars" element={<Navigate to={`/${DEFAULT_LANG}/rent-cars`} replace />} />
      <Route path="/rent-cars/:id" element={<LegacyRedirect path="/rent-cars" />} />
      <Route path="/sale-cars" element={<Navigate to={`/${DEFAULT_LANG}/sale-cars`} replace />} />
      <Route path="/sale-cars/:id" element={<LegacyRedirect path="/sale-cars" />} />
      <Route path="/parts" element={<Navigate to={`/${DEFAULT_LANG}/parts`} replace />} />
      <Route path="/parts/:id" element={<LegacyRedirect path="/parts" />} />
      <Route path="/contacts" element={<Navigate to={`/${DEFAULT_LANG}/contacts`} replace />} />
      <Route path="/privacy-policy" element={<Navigate to={`/${DEFAULT_LANG}/privacy-policy`} replace />} />
      <Route path="/rental-terms" element={<Navigate to={`/${DEFAULT_LANG}/rental-terms`} replace />} />
      <Route path="/cars" element={<Navigate to={`/${DEFAULT_LANG}/rent-cars`} replace />} />
      <Route path="/cars/:id" element={<LegacyRedirect path="/rent-cars" />} />
      <Route path="/car-sale" element={<Navigate to={`/${DEFAULT_LANG}/sale-cars`} replace />} />
      <Route path="/car-sale/:id" element={<LegacyRedirect path="/sale-cars" />} />

      {/* Auth routes (no locale prefix) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* User routes */}
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

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/contracts" replace />} />
        <Route path="cities" element={<AdminCitiesPage />} />
        <Route path="cars" element={<AdminCarsPage />} />
        <Route path="parts" element={<AdminPartsPage />} />
        <Route path="contracts" element={<AdminContractsPage />} />
        <Route path="contacts" element={<AdminContactsPage />} />
        <Route path="legal" element={<AdminLegalPagesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="pricing" element={<AdminPricingDashboard />} />
        <Route path="pricing/rules" element={<AdminPricingRulesPage />} />
        <Route path="pricing/seasonal" element={<AdminSeasonalFactorsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
