import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealTimeProvider } from "@/contexts/RealTimeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LoginUser from "./pages/LoginUser";
import LoginAdmin from "./pages/LoginAdmin";
import SignupUser from "./pages/SignupUser";
import LoginProfessional from "./pages/LoginProfessional";
import SignupProfessional from "./pages/SignupProfessional";
import ForgotPassword from "./pages/ForgotPassword";
import UserDashboard from "./pages/UserDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProfessionalsListing from "./pages/ProfessionalsListing";
import CreateJob from "./pages/CreateJob";
import NotFound from "./pages/NotFound";
import { JobDetailsPage } from "@/components/job";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuth } from "@/contexts/AuthContext";
import "leaflet/dist/leaflet.css";

const queryClient = new QueryClient();

// Admin Route Wrapper to check isAdmin flag
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user || !(user as any).isAdmin) {
    return <NotFound />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RealTimeProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login/user" element={<LoginUser />} />
            <Route path="/login/admin" element={<LoginAdmin />} />
            <Route path="/signup/user" element={<SignupUser />} />
            <Route path="/login/professional" element={<LoginProfessional />} />
            <Route path="/signup/professional" element={<SignupProfessional />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/professionals" element={<ProfessionalsListing />} />
            <Route path="/create-job" element={<CreateJob />} />
            <Route
              path="/job/:jobId"
              element={
                <ProtectedRoute>
                  <JobDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/user"
              element={
                <ProtectedRoute requiredUserType="user">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/provider"
              element={
                <ProtectedRoute requiredUserType="professional">
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredUserType="user">
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </RealTimeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
