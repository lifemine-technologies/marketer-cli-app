import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  passwordSchema,
  phoneNumberSchema,
} from '../../../utils/validations/primitive';
import { useContext } from 'react';
import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { authAPI, setAccessToken, setRefreshToken } from '@/config/axios';
import { API_ENDPOINTS } from '@/config/url';
import { AuthUserContext } from '../../../utils/contexts/authUserContext';
import { useEncryption } from '@/hooks/useEncryption';
import { API_CONFIG } from '@/config/url';

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const schema = z.object({
  phone: phoneNumberSchema(),
  password: passwordSchema(),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof schema>;

interface AuthLoginResponse {
  status: 'success' | 'error';
  message: string;
  type?: string;
  data: {
    _id: string;
    transactionId?: string;
    accessToken: string;
    refreshToken: string;
    phone?: string;
    role?: string;
    createdAt?: string;
    identifier?: string;
    updatedAt?: string;
    __v?: number;
  };
}

export const useLoginLogic = () => {
  const authContext = useContext(AuthUserContext);

  let encryptAesKeyFn: ((data: Record<string, unknown>) => string) | null =
    null;
  try {
    const encryption = useEncryption();
    encryptAesKeyFn = encryption.encryptAesKey;
  } catch (error) {
    console.warn('Encryption hook not available:', error);
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: '',
      password: '',
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: async (data: LoginFormData & { session: string }) => {
      try {
        // Prepare payload - try encrypted first, fallback to unencrypted
        let payload: {
          encrypted?: string;
          phone?: string;
          password?: string;
          rememberMe?: boolean;
          session?: string;
        };

        // Check if encryption is available
        if (
          encryptAesKeyFn &&
          authContext?.publicKey &&
          authContext.publicKey !== 'dummy-public-key' &&
          authContext.publicKey
        ) {
          // Encrypt the data using the hook (it expects an object)
          const dataToEncrypt = {
            phone: data.phone,
            password: data.password,
            rememberMe: data.rememberMe,
            session: data.session,
          };

          const encrypted = encryptAesKeyFn(dataToEncrypt);
          payload = { encrypted };
          console.log('Using encrypted payload');
        } else {
          // Fallback: send unencrypted data (API may accept this)
          console.warn('Public key not available, sending unencrypted data');
          payload = {
            phone: data.phone,
            password: data.password,
            rememberMe: data.rememberMe,
            session: data.session,
          };
        }

        const fullUrl = `${API_CONFIG.IDP_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`;
        console.log('Sending login request to:', fullUrl);
        console.log('Payload:', JSON.stringify(payload, null, 2));

        const response = await authAPI.post<AuthLoginResponse>(
          API_ENDPOINTS.AUTH.LOGIN,
          payload,
        );

        // If status is error, throw to trigger onError handler
        if (response.data.status === 'error') {
          throw new Error(response.data.message || 'Login failed');
        }

        return response.data;
      } catch (error: any) {
        console.error('Login API error:', error);
        // Provide more detailed error information
        if (error?.response) {
          console.error('Response status:', error.response.status);
          console.error(
            'Response data:',
            JSON.stringify(error.response.data, null, 2),
          );
          console.error('Response headers:', error.response.headers);
          console.error('Request URL:', error.config?.url);
          console.error('Request baseURL:', error.config?.baseURL);
          console.error(
            'Full URL:',
            `${error.config?.baseURL}${error.config?.url}`,
          );
        } else if (error?.request) {
          console.error('Request made but no response:', error.request);
          console.error('Request URL:', error.config?.url);
          console.error('Request baseURL:', error.config?.baseURL);
        } else {
          console.error('Error setting up request:', error.message);
        }
        throw error;
      }
    },
    onSuccess: async data => {
      // This should not be called if status is error (we throw in mutationFn)
      // But handle it just in case
      if (data.status === 'success') {
        // Store tokens
        await setAccessToken(data.data.accessToken);
        await setRefreshToken(data.data.refreshToken);

        // The API response only contains _id and tokens, not full user data
        // User details (including correct role) will be fetched automatically by the contextProviderHook
        // via the userDetails query after the token is set
        // Just trigger the login function to check for token - it won't set hardcoded userData
        // The userDetails query will automatically fetch the real user data with correct role from /v1/marketer/details
        if (authContext?.login) {
          authContext.login();
        }
      } else {
        // This shouldn't happen as we throw on error, but handle it
        Alert.alert(
          'Login Failed',
          data.message || 'Login failed. Please try again.',
        );
      }
    },
    onError: (error: any) => {
      console.error('Login error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
      });

      let errorMessage = 'Login failed. Please try again.';

      // Handle 404 specifically
      if (error?.response?.status === 404) {
        const fullUrl = `${error?.config?.baseURL || API_CONFIG.IDP_BASE_URL}${error?.config?.url || API_ENDPOINTS.AUTH.LOGIN}`;
        errorMessage = `API endpoint not found (404). Please verify:\n1. API server is running\n2. Base URL: ${API_CONFIG.IDP_BASE_URL}\n3. Endpoint: ${API_ENDPOINTS.AUTH.LOGIN}\n4. Full URL: ${fullUrl}`;
      } else if (error?.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.status === 'error') {
          errorMessage =
            error.response.data.message ||
            'Login failed. Please check your credentials.';
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert('Login Failed', errorMessage);
    },
  });

  const onSubmit = loginForm.handleSubmit((data: LoginFormData) =>
    loginMutation.mutate({ ...data, session: generateUUID() }),
  );

  return {
    loginForm,
    loginMutation,
    onSubmit,
  };
};
