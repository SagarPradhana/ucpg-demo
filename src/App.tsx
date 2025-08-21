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
import History from "./pages/History";
import ChatbotDemo from "./pages/ChatbotDemo";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import TokenManager from "./utils/tokenManager";
import StorageDebugger from "./utils/storageDebugger";
import { loginActions } from "./store/loginReducer";
import { singleUserDetailsActions } from "./store/singleUserDetailsReducer";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { jwtDecode } from "jwt-decode";
import { RootState } from "./types";
// import RouteProtectionDebug from "./components/RouteProtectionDebug";
import { ROUTE_CONFIG } from "./config/routes";
import { SupportChatbot } from "./components/SupportChatbot";
import { getUser } from "./service/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
      gcTime: 60_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

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
      console.log("Token expired, redirecting to login");
      // Force redirect to login to prevent stuck UI
      try {
        window.location.assign("/login");
      } catch (e) {
        window.location.href = "/login";
      }
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

  // Fetch and store full user profile globally so theme from metadata applies everywhere
  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (!token) return;

    // If profile already present, skip
    if (singleUserDetails.userDetails) return;

    // Determine user id from auth user or token
    let userId: string | undefined = authUser?.id;
    if (!userId) {
      try {
        const decoded: any = jwtDecode<any>(token);
        userId =
          decoded?.id || decoded?.user_id || decoded?.userId || decoded?.sub;
      } catch {
        userId = undefined;
      }
    }

    if (!userId) return;

    (async () => {
      try {
        const res: any = await getUser(userId as string);
        const normalized = res?.data?.user || res?.data || res;
        if (normalized) {
          dispatch(singleUserDetailsActions.setSingleUserDetails(normalized));
        }
      } catch (e) {
        console.error("❌ App: Failed to fetch user profile:", e);
      }
    })();
  }, [authUser?.id, dispatch, singleUserDetails.userDetails]);

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
                    <Route
                      path="/chatbot-demo"
                      element={
                        <ProtectedRoute requireAuth={false}>
                          <ChatbotDemo />
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
                    <Route
                      path={ROUTE_CONFIG.USER.HISTORY}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          allowedRoles={["user", "admin", "super_admin"]}
                          blockAdmins={false}
                        >
                          <History />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Routes - Only for non-user roles */}
                    <Route
                      path={ROUTE_CONFIG.ADMIN.PANEL}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          requireNonUser={true}
                        >
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.ADMIN.DASHBOARD}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          requireNonUser={true}
                        >
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.ADMIN.TRANSACTIONS}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          requireNonUser={true}
                        >
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.ADMIN.USER_ROLES}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          requireNonUser={true}
                        >
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.ADMIN.PROMO_CODES}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          requireNonUser={true}
                        >
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.ADMIN.PROVIDERS}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          requireNonUser={true}
                        >
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.ADMIN.EXCHANGE_RATES}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          requireNonUser={true}
                        >
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.ADMIN.COMMISSION_SETTINGS}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          requireNonUser={true}
                        >
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.ADMIN.SETTINGS}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          requireNonUser={true}
                        >
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.ADMIN.ERROR_LOGS}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          requireNonUser={true}
                        >
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.ADMIN.REPORTS}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          requireNonUser={true}
                        >
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path={ROUTE_CONFIG.ADMIN.REVENUE_OPS}
                      element={
                        <ProtectedRoute
                          requireAuth={true}
                          requireNonUser={true}
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
