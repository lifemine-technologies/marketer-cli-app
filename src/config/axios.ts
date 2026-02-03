import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS } from './url';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.IDP_BASE_URL}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

export const setAccessToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting access token:', error);
  }
};

export const removeAccessToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing access token:', error);
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

export const setRefreshToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
};

export const removeRefreshToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing refresh token:', error);
  }
};

apiClient.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    const token = await getAccessToken();
    const isAuthRequest =
      config.url &&
      Object.values(API_ENDPOINTS.AUTH).some(endpoint =>
        config.url?.includes(endpoint),
      );
    if (token && config.headers && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

const refreshAccessToken = async (
  originalRequest: CustomAxiosRequestConfig,
) => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const refreshResponse = await axios.post(
    `${API_CONFIG.IDP_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
    { token: refreshToken },
  );
  if (refreshResponse.data?.status !== 'success') {
    throw new Error('Token refresh failed');
  }

  const newToken = refreshResponse.data.data.accessToken;
  await setAccessToken(newToken);

  if (originalRequest.headers) {
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
  }

  return apiClient(originalRequest);
};

const clearTokensAndReload = async () => {
  await removeAccessToken();
  await removeRefreshToken();
  // In React Native, we can't reload like in web
  // Navigation will handle redirecting to login
};

apiClient.interceptors.response.use(
  async (response: AxiosResponse) => {
    if (response.data?.status === 'success') {
      return response;
    }

    if (response.data?.status === 'error') {
      const errorMessage = response.data.message || '';
      if (
        errorMessage.includes('not active') ||
        errorMessage.includes('Authorization header is missing or malformed')
      ) {
        await clearTokensAndReload();
        return Promise.reject(new Error('Unexpected response status'));
      }

      if (
        errorMessage.includes('Token has expired') ||
        errorMessage.includes('Token is not yet valid') ||
        (errorMessage.includes('Invalid token') &&
          response.config.url !== API_ENDPOINTS.AUTH.REFRESH)
      ) {
        const originalRequest = response.config as CustomAxiosRequestConfig;

        if (!originalRequest._retry) {
          originalRequest._retry = true;

          try {
            return await refreshAccessToken(originalRequest);
          } catch (refreshError) {
            await clearTokensAndReload();
            return Promise.reject(refreshError);
          }
        }
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    // Handle network errors (no response: timeout, no connection, DNS, etc.)
    if (error.request && !error.response) {
      const msg = error.message || 'No response from server.';
      console.error('Network error - no response received:', msg);
      return Promise.reject(
        new Error(
          'Network error. Check your internet connection and that the API server is reachable.',
        ),
      );
    }

    // Handle HTTP errors (401, 403, 404, 500, etc.)
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.message || error.message;

      // Handle 401 Unauthorized - token might be expired
      if (status === 401) {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Try to refresh token if we haven't already retried
        if (
          !originalRequest._retry &&
          error.config?.url !== API_ENDPOINTS.AUTH.REFRESH
        ) {
          originalRequest._retry = true;
          try {
            return await refreshAccessToken(originalRequest);
          } catch (refreshError) {
            await clearTokensAndReload();
            return Promise.reject(
              new Error('Session expired. Please login again.'),
            );
          }
        }
      }

      // Handle 403 Forbidden
      if (status === 403) {
        return Promise.reject(
          new Error("You don't have permission to access this resource."),
        );
      }

      // Handle 404 Not Found
      if (status === 404) {
        return Promise.reject(new Error('Resource not found.'));
      }

      // Handle 500+ server errors
      if (status >= 500) {
        return Promise.reject(
          new Error('Server error. Please try again later.'),
        );
      }

      // Return the error message from the API if available
      return Promise.reject(
        new Error(errorMessage || `Request failed with status ${status}`),
      );
    }

    return Promise.reject(error);
  },
);

export const handleLogout = async (): Promise<void> => {
  await removeAccessToken();
  await removeRefreshToken();
  // Navigation will handle redirecting to login
};

export const authAPI = {
  get: <T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.get<T>(url, config),

  post: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.post<T>(url, data, config),

  put: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.put<T>(url, data, config),

  patch: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.patch<T>(url, data, config),

  delete: <T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => apiClient.delete<T>(url, config),
};

export const userAPI = {
  get: <T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> =>
    apiClient.get<T>(url, { ...config, baseURL: API_CONFIG.BASE_URL }),

  post: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> =>
    apiClient.post<T>(url, data, { ...config, baseURL: API_CONFIG.BASE_URL }),

  put: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> =>
    apiClient.put<T>(url, data, { ...config, baseURL: API_CONFIG.BASE_URL }),

  patch: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> =>
    apiClient.patch<T>(url, data, { ...config, baseURL: API_CONFIG.BASE_URL }),

  delete: <T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> =>
    apiClient.delete<T>(url, { ...config, baseURL: API_CONFIG.BASE_URL }),
};

export default apiClient;

export type BasicReturnType =
  | {
      status: 'success';
      message: string;
      data: any;
    }
  | {
      status: 'error';
      message: string;
      data: any;
    };

export type BasicReturnWithType<T> =
  | {
      status: 'success';
      message: string;
      data: T;
    }
  | {
      status: 'error';
      message: string;
      data: any;
    };

export const handleMutationError = (
  error: AxiosError<BasicReturnType> | Error,
) => {
  console.error(error);
  let message = 'Something went wrong. Please try again.';
  if (error instanceof AxiosError && error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error instanceof Error) {
    message = error.message;
  }
  // In React Native, we'll use Alert instead of toast
  // Alert will be called from the component level
  return message;
};

export const handleMutationSuccess = (response: BasicReturnType | any) => {
  if (response?.data?.status === 'error') {
    console.log('response.message', response.data.message);
    // Alert will be called from the component level
    return response.data.message;
  }
  return null;
};
