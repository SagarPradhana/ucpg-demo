import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { loginActions } from "@/store/loginReducer";
import { singleUserDetailsActions } from "@/store/singleUserDetailsReducer";
import { useNavigate } from "react-router-dom";

import { User, RootState } from "@/types";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const authUser = useSelector((store: RootState) => store.auth.userDetails); // For token validation
  const singleUserDetails = useSelector((store: RootState) => store.singleUserDetails); // For full profile data
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Use singleUserDetails as primary, fallback to authUser for authentication check
  const userProfile = singleUserDetails.userDetails || authUser;

  console.log("🔐 useAuth: Hook state", {
    hasAuthUser: !!authUser,
    hasSingleUserDetails: !!singleUserDetails.userDetails,
    singleUserLoading: singleUserDetails.loading,
    finalUserProfile: {
      id: userProfile?.id,
      name: userProfile?.name,
      email: userProfile?.email,
    },
    isAuthenticated: !!userProfile,
    isLoading,
  });

  useEffect(() => {
    const loadUserFromToken = () => {
      // If we have auth user or are already loading profile, stop loading
      if (authUser || singleUserDetails.loading) {
        setIsLoading(singleUserDetails.loading);
        return;
      }

      const token = localStorage.getItem("sessionToken");
      if (token) {
        try {
          const decodedUser = jwtDecode<User>(token);
          
          // Check if token is still valid
          const currentTime = Date.now() / 1000;
          if (decodedUser.exp > currentTime) {
            console.log("🔄 useAuth: Storing auth user from token");
            // Dispatch user details to Redux store (authUser for ID/auth)
            dispatch(loginActions.setUserDetails(decodedUser));
            // Profile will be fetched by individual pages using useQuery
            setIsLoading(false);
          } else {
            // Token is expired, remove it
            console.log("❌ useAuth: Token expired");
            localStorage.removeItem("sessionToken");
            dispatch(loginActions.clearUserDetails());
            dispatch(singleUserDetailsActions.clearSingleUserDetails());
            navigate("/login");
          }
        } catch (error) {
          console.error("❌ useAuth: Error decoding token:", error);
          localStorage.removeItem("sessionToken");
          dispatch(loginActions.clearUserDetails());
          dispatch(singleUserDetailsActions.clearSingleUserDetails());
          navigate("/login");
        }
      } else {
        // No token found, redirect to login
        console.log("❌ useAuth: No token found");
        navigate("/login");
      }
    };

    loadUserFromToken();
  }, [dispatch, navigate, authUser, singleUserDetails.loading]);

  return {
    user: userProfile,
    isLoading,
    isAuthenticated: !!userProfile,
  };
};