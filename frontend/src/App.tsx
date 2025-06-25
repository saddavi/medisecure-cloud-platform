import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import PatientDashboard from "./pages/PatientDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import PatientList from "./pages/PatientList";
import PatientDetail from "./pages/PatientDetail";
import CreatePatient from "./pages/CreatePatient";
import EditPatient from "./pages/EditPatient";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/common/ErrorBoundary";
import PublicSymptomChecker from "./pages/public/PublicSymptomChecker";
import { runIntegrationTests } from "./utils/testIntegration";
import DevTestPanel from "./components/dev/DevTestPanel";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  // Run integration tests on app startup (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("🔬 Running integration tests...");
      runIntegrationTests()
        .then((results) => {
          console.log("✅ Integration test results:", results);
          const failures = results.filter((r) => r.status === "error");
          if (failures.length > 0) {
            console.warn("⚠️ Some integration tests failed:", failures);
          }
        })
        .catch((error) => {
          console.error("❌ Integration tests failed:", error);
        });
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/symptom-checker" element={<PublicSymptomChecker />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    {/* Dashboard Routes */}
                    <Route path="/dashboard" element={<PatientDashboard />} />
                    <Route
                      path="/provider-dashboard"
                      element={<ProviderDashboard />}
                    />

                    {/* Patient Management Routes */}
                    <Route path="/patients" element={<PatientList />} />
                    <Route path="/patients/new" element={<CreatePatient />} />
                    <Route path="/patients/:id" element={<PatientDetail />} />
                    <Route
                      path="/patients/:id/edit"
                      element={<EditPatient />}
                    />

                    {/* Default redirect */}
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Route>
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>

              {/* Global Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#fff",
                    color: "#1f2937",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  },
                  success: {
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#fff",
                    },
                  },
                }}
              />

              {/* Development Test Panel (only in development) */}
              {import.meta.env.DEV && <DevTestPanel />}
            </div>
          </Router>
        </AuthProvider>

        {/* React Query DevTools (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}

        {/* Development Test Panel */}
        <DevTestPanel />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
