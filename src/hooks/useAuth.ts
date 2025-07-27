import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { loginActions } from "@/store/loginReducer";
import { useNavigate } from "react-router-dom";

interface DecodedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  metadata: any;
  is_active: boolean;
  timezone: number;
  exp: number;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const userProfile = useSelector((store: any) => store.auth.userDetails);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserFromToken = () => {
      // If userProfile is already loaded, stop loading
      if (userProfile) {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("sessionToken");
      if (token) {
        try {
          const decodedUser = jwtDecode<DecodedUser>(token);
          
          // Check if token is still valid
          const currentTime = Date.now() / 1000;
          if (decodedUser.exp > currentTime) {
            // Dispatch user details to Redux store
            dispatch(loginActions.setUserDetails(decodedUser));
            setIsLoading(false);
          } else {
            // Token is expired, remove it
            localStorage.removeItem("sessionToken");
            navigate("/login");
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("sessionToken");
          navigate("/login");
        }
      } else {
        // No token found, redirect to login
        navigate("/login");
      }
    };

    loadUserFromToken();
  }, [dispatch, navigate, userProfile]);

  return {
    user: userProfile,
    isLoading,
    isAuthenticated: !!userProfile,
  };
};