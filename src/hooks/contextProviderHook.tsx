import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AuthUserContext,
  UserProviderContext,
  type UserData,
} from '../utils/contexts/authUserContext';
import {
  getAccessToken,
  removeAccessToken,
  removeRefreshToken,
  authAPI,
} from '@/config/axios';
import { userAPI, type BasicReturnWithType } from '@/config/axios';
import { API_ENDPOINTS } from '@/config/url';
import { convertJwkToPem } from '../utils/crypto.util';
import { stopBackgroundLocationTracking } from '@/services/locationTracking';

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<{ accessToken: string } | null>(null);
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const [userLoading, setUserLoading] = useState(true);

  // Fetch public key
  const { data: wellknownData, isLoading: isLoadingPublicKey } = useQuery({
    queryKey: ['wellknownPublic'],
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
        console.error('Error fetching public key:', error);
        return { publicKey: '' };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    retry: false,
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
        console.error('Error checking auth:', error);
      } finally {
        setUserLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch user details when token exists
  const { data: userDetailsData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['userDetails'],
    queryFn: async () => {
      const response = await userAPI.get<BasicReturnWithType<UserData>>(
        API_ENDPOINTS.PROFILE.DETAILS,
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
    const token = await getAccessToken();
    if (token) {
      setUser({ accessToken: token });
    }
  }, []);

  // Function to logout user
  const logout = useCallback(async () => {
    // Stop location tracking on logout
    await stopBackgroundLocationTracking();
    await removeAccessToken();
    await removeRefreshToken();
    setUser(null);
    setUserData(undefined);
  }, []);

  const isLoading =
    userLoading || isLoadingPublicKey || (!!user?.accessToken && isLoadingUser);
  const publicKey = wellknownData?.publicKey || '';

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
