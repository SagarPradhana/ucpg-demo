// Debug utility for Dashboard issues
import { RootState } from "@/types";

export const logDashboardState = (state: {
  authUser: any;
  singleUserDetails: any;
  userData: any;
  userDataLoading: boolean;
  userDataError: any;
  sessionToken: string | null;
}) => {
  console.group("🔍 Dashboard Debug State");
  
  console.log("📱 Session Management:");
  console.log("  - Session Token Exists:", !!localStorage.getItem("sessionToken"));
  console.log("  - Session Token State:", !!state.sessionToken);
  
  console.log("👤 Auth User (from Redux auth store):");
  console.log("  - Exists:", !!state.authUser);
  console.log("  - ID:", state.authUser?.id);
  console.log("  - Email:", state.authUser?.email);
  console.log("  - Metadata:", state.authUser?.metadata);
  
  console.log("🧑‍💼 Single User Details (from Redux singleUserDetails store):");
  console.log("  - Exists:", !!state.singleUserDetails.userDetails);
  console.log("  - ID:", state.singleUserDetails.userDetails?.id);
  console.log("  - Email:", state.singleUserDetails.userDetails?.email);
  console.log("  - Loading:", state.singleUserDetails.loading);
  console.log("  - Error:", state.singleUserDetails.error);
  
  console.log("🔄 API Query State:");
  console.log("  - Query Enabled:", !!state.authUser?.id);
  console.log("  - Is Loading:", state.userDataLoading);
  console.log("  - Has Data:", !!state.userData);
  console.log("  - Has Error:", !!state.userDataError);
  console.log("  - Error Details:", state.userDataError);
  
  console.log("🎯 Expected Flow:");
  console.log("  1. Dashboard loads → authUser is null");
  console.log("  2. loadUserFromToken runs → sets authUser from JWT");
  console.log("  3. useQuery triggers → fetches fresh user data");
  console.log("  4. Query success → updates singleUserDetails");
  
  // Diagnose common issues
  if (localStorage.getItem("sessionToken") && !state.authUser) {
    console.warn("⚠️ ISSUE: Session token exists but authUser not loaded");
    console.warn("   → Check loadUserFromToken function");
  }
  
  if (state.authUser?.id && !state.userDataLoading && !state.userData && !state.userDataError) {
    console.warn("⚠️ ISSUE: authUser exists but query not running");
    console.warn("   → Check useQuery enabled condition");
  }
  
  if (state.userDataError) {
    console.error("❌ ISSUE: API query failed");
    console.error("   → Check network/API endpoint");
  }
  
  if (state.userData && !state.singleUserDetails.userDetails) {
    console.warn("⚠️ ISSUE: Query successful but Redux not updated");
    console.warn("   → Check Redux update effect");
  }
  
  console.groupEnd();
};

export const testManualUserFetch = async (userId: string) => {
  try {
    console.log("🧪 Testing manual user fetch for ID:", userId);
    const { getUser } = await import("@/service/auth");
    const result = await getUser(userId);
    console.log("✅ Manual fetch successful:", result);
    return result;
  } catch (error) {
    console.error("❌ Manual fetch failed:", error);
    throw error;
  }
};

export const debugTokenDecoding = () => {
  const token = localStorage.getItem("sessionToken");
  if (!token) {
    console.log("❌ No session token found");
    return null;
  }
  
  try {
    const { jwtDecode } = require("jwt-decode");
    const decoded = jwtDecode(token);
    console.log("🔓 Token decoded successfully:", decoded);
    
    const currentTime = Date.now() / 1000;
    const isExpired = decoded.exp < currentTime;
    console.log("⏰ Token expired:", isExpired);
    
    return decoded;
  } catch (error) {
    console.error("❌ Token decoding failed:", error);
    return null;
  }
};