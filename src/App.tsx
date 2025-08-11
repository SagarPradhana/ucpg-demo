import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import NotFound from "./pages/NotFound";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "./store";
import Signup from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Services from "./pages/Services";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import TokenManager from "./utils/tokenManager";
import StorageDebugger from "./utils/storageDebugger";
import { loginActions } from "./store/loginReducer";
import { singleUserDetailsActions } from "./store/singleUserDetailsReducer";
import { useEffect } from "react";
import SupportChatbot from "./components/SupportChatbot";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { jwtDecode } from "jwt-decode";
import { RootState } from "./types";
// import RouteProtectionDebug from "./components/RouteProtectionDebug";
import { ROUTE_CONFIG } from "./config/routes";

const queryClient = new QueryClient();

// Component to initialize TokenManager and StorageDebugger
const AppInitializer = () => {
  useEffect(() => {
    // Initialize StorageDebugger
    const storageDebugger = StorageDebugger.getInstance();
    storageDebugger.initializeDefaults();
    storageDebugger.monitorStorage();
    storageDebugger.logStorageState("App Initialization");

    // Initialize TokenManager
    const tokenManager = TokenManager.getInstance();
    tokenManager.initialize(() => {
      // Clear Redux state on token expiration
      store.dispatch(loginActions.clearUserDetails());
      store.dispatch(singleUserDetailsActions.clearSingleUserDetails());
      console.log("Token expired, user should be redirected to login");
    });

    return () => {
      tokenManager.destroy();
    };
  }, []);

  return null;
};

// Component to initialize user profile from token
const UserProfileInitializer = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.userDetails);
  const singleUserDetails = useSelector(
    (state: RootState) => state.singleUserDetails
  );

  // Load user from token if not already in Redux
  useEffect(() => {
    const loadUserFromToken = () => {
      // If we already have user profile data, don't reload
      if (singleUserDetails.userDetails) {
        console.log("✅ App: User profile already loaded in Redux");
        return;
      }

      const token = localStorage.getItem("sessionToken");
      if (token) {
        try {
          const decodedUser = jwtDecode<any>(token);

          // Check if token is still valid
          const currentTime = Date.now() / 1000;
          if (decodedUser.exp > currentTime) {
            console.log(
              "🔄 App: Token valid, storing auth user and fetching profile",
              decodedUser
            );

            // Store auth user from token
            dispatch(loginActions.setUserDetails(decodedUser));

            console.log(
              "🔄 App: Auth user stored, profile will be fetched by pages"
            );
          } else {
            console.log("❌ App: Token expired, clearing storage");
            localStorage.removeItem("sessionToken");
            dispatch(loginActions.clearUserDetails());
            dispatch(singleUserDetailsActions.clearSingleUserDetails());
          }
        } catch (error) {
          console.error("❌ App: Error decoding token:", error);
          localStorage.removeItem("sessionToken");
        }
      }
    };

    loadUserFromToken();
  }, [dispatch, singleUserDetails.userDetails]);

  return null;
};

// Component to conditionally render Support Chatbot
const ConditionalSupportChatbot = () => {
  const location = useLocation();

  // Pages where chatbot should NOT appear
  const excludedPaths = ["/login", "/signup", "/forgotpassword", "/admin"];

  // Check if current path should exclude chatbot
  const shouldShowChatbot = !excludedPaths.some((path) =>
    location.pathname.toLowerCase().includes(path.toLowerCase())
  );

  return shouldShowChatbot ? <SupportChatbot /> : null;
};

const App = () => (
  <ErrorBoundary>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider defaultLanguage="en">
            <ThemeProvider defaultTheme="light">
              <AppInitializer />
              <UserProfileInitializer />
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Public Routes - No authentication required */}
                    <Route
                      path={ROUTE_CONFIG.PUBLIC.HOME}
                      element={
                        <ProtectedRoute requireAuth={false}>
                          <Index />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.PUBLIC.LOGIN}
                      element={
                        <ProtectedRoute requireAuth={false}>
                          <Login />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.PUBLIC.SIGNUP}
                      element={
                        <ProtectedRoute requireAuth={false}>
                          <Signup />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.PUBLIC.FORGOT_PASSWORD}
                      element={
                        <ProtectedRoute requireAuth={false}>
                          <ForgotPassword />
                        </ProtectedRoute>
                      }
                    />

                    {/* User Routes - Require authentication, allow both user and admin access */}
                    <Route
                      path={ROUTE_CONFIG.USER.DASHBOARD}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          allowedRoles={["user", "admin", "super_admin"]}
                          blockAdmins={false}
                        >
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.USER.SEND}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          allowedRoles={["user", "admin", "super_admin"]}
                          blockAdmins={false}
                        >
                          <Send />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.USER.RECEIVE}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          allowedRoles={["user", "admin", "super_admin"]}
                          blockAdmins={false}
                        >
                          <Receive />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.USER.RECEIVE_WITH_ID}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          allowedRoles={["user", "admin", "super_admin"]}
                          blockAdmins={false}
                        >
                          <Receive />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.USER.PROFILE}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          allowedRoles={["user", "admin", "super_admin"]}
                          blockAdmins={false}
                        >
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.USER.SERVICES}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          allowedRoles={["user", "admin", "super_admin"]}
                          blockAdmins={false}
                        >
                          <Services />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Routes - Only for admin users */}
                    <Route
                      path={ROUTE_CONFIG.ADMIN.PANEL}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          allowedRoles={["admin", "super_admin"]}
                          blockAdmins={false}
                        >
                          <Admin />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch-all route for 404 errors */}
                    <Route
                      path={ROUTE_CONFIG.ERROR.NOT_FOUND}
                      element={<NotFound />}
                    />
                  </Routes>
                  <ConditionalSupportChatbot />
                </BrowserRouter>
              </TooltipProvider>
            </ThemeProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </Provider>
    </GoogleOAuthProvider>
  </ErrorBoundary>
);

export default App;
