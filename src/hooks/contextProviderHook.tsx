import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AuthUserContext,
  UserProviderContext,
  type UserData,
} from "../utils/contexts/authUserContext";
import { getAccessToken, removeAccessToken, removeRefreshToken, authAPI } from "@/config/axios";
import { userAPI, type BasicReturnWithType } from "@/config/axios";
import { API_ENDPOINTS } from "@/config/url";
import { convertJwkToPem } from "../utils/crypto.util";

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<{ accessToken: string } | null>(null);
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const [userLoading, setUserLoading] = useState(true);

  // Fetch public key from well-known endpoint (optional - may not exist)
  const { data: wellknownData, isLoading: isLoadingPublicKey } = useQuery({
    queryKey: ["wellknownPublic"],
    queryFn: async () => {
      try {
        const response = await authAPI.get<{
          keys: Array<{
            kty: string;
            alg: string;
            use: string;
            kid: string;
            n: string;
            e: string;
          }>;
        }>(API_ENDPOINTS.WELL_KNOWN.PUBLIC);

        const publicKey = convertJwkToPem({
          e: response.data.keys[0].e,
          n: response.data.keys[0].n,
        });

        return { ...response.data, publicKey };
      } catch (error: any) {
        // If 404, the endpoint doesn't exist - allow app to continue without encryption
        if (error?.response?.status === 404) {
          console.warn("Public key endpoint not found (404). Login may work without encryption.");
          return { publicKey: "" };
        }
        console.error("Error fetching public key:", error);
        // Return empty public key if fetch fails (encryption will fail gracefully)
        return { publicKey: "" };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    retry: false, // Don't retry on 404
  });

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          setUser({ accessToken: token });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setUserLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch user details when token exists
  const { data: userDetailsData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const response = await userAPI.get<BasicReturnWithType<UserData>>(
        API_ENDPOINTS.PROFILE.DETAILS
      );
      return response.data;
    },
    enabled: !!user?.accessToken,
    retry: 1,
  });

  // Update userData when fetched
  useEffect(() => {
    if (userDetailsData?.data) {
      setUserData(userDetailsData.data);
    }
  }, [userDetailsData]);

  // Function to login user - just trigger token check, don't set hardcoded userData
  const login = useCallback(async () => {
    // Token is already stored by setAccessToken in LoginPageLogic
    // Just check for token and set it - the userDetails query will automatically fetch the real data
    const token = await getAccessToken();
    if (token) {
      setUser({ accessToken: token });
      // Don't set any userData here - let the userDetails query fetch the real data
      // This ensures we get the correct role from the API, not hardcoded values
      // The userDetails query will automatically fetch and update userData with correct role
    }
  }, []);

  // Function to logout user
  const logout = useCallback(async () => {
    await removeAccessToken();
    await removeRefreshToken();
    setUser(null);
    setUserData(undefined);
  }, []);

  const isLoading = userLoading || isLoadingPublicKey || (!!user?.accessToken && isLoadingUser);
  const publicKey = wellknownData?.publicKey || "";

  return (
    <AuthUserContext.Provider
      value={{
        user,
        userLoading: isLoading,
        userFetching: false,
        publicKey,
        login,
        logout,
      }}
    >
      <UserProviderContext.Provider value={userData}>
        {children}
      </UserProviderContext.Provider>
    </AuthUserContext.Provider>
  );
};
