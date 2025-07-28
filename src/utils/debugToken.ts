import { jwtDecode } from "jwt-decode";

import { User } from "@/types";

export const debugToken = () => {
  const token = localStorage.getItem("sessionToken");
  
  if (!token) {
    console.log("❌ No token found in localStorage");
    return null;
  }

  try {
    const decodedUser = jwtDecode<User>(token);
    const currentTime = Date.now() / 1000;
    const timeLeft = decodedUser.exp - currentTime;
    const isValid = timeLeft > 0;

    console.log("🔍 Token Debug Info:");
    console.log("✅ Token found:", token.substring(0, 20) + "...");
    console.log("👤 User:", {
      id: decodedUser.id,
      name: decodedUser.name,
      email: decodedUser.email,
      role: decodedUser.role,
    });
    console.log("⏰ Expiration:", new Date(decodedUser.exp * 1000).toLocaleString());
    console.log("⏱️ Time left:", Math.floor(timeLeft / 60) + " minutes");
    console.log("✅ Valid:", isValid ? "Yes" : "No");

    return {
      token,
      decodedUser,
      isValid,
      timeLeft,
    };
  } catch (error) {
    console.log("❌ Error decoding token:", error);
    return null;
  }
};

// Add to window for easy debugging in console
if (typeof window !== "undefined") {
  (window as any).debugToken = debugToken;
}