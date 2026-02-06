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
        let payload: {
          encrypted?: string;
          phone?: string;
          password?: string;
          rememberMe?: boolean;
          session?: string;
        };
        if (
          encryptAesKeyFn &&
          authContext?.publicKey &&
          authContext.publicKey !== 'dummy-public-key' &&
          authContext.publicKey
        ) {
          const dataToEncrypt = {
            phone: data.phone,
            password: data.password,
            rememberMe: data.rememberMe,
            session: data.session,
          };

          const encrypted = encryptAesKeyFn(dataToEncrypt);
          payload = { encrypted };
        } else {
          payload = {
            phone: data.phone,
            password: data.password,
            rememberMe: data.rememberMe,
            session: data.session,
          };
        }

        const response = await authAPI.post<AuthLoginResponse>(
          API_ENDPOINTS.AUTH.LOGIN,
          payload,
        );
        if (response.data.status === 'error') {
          throw new Error(response.data.message || 'Login failed');
        }
        return response.data;
      } catch (error: any) {
        console.error('Login API error:', error);
        throw error;
      }
    },
    onSuccess: async data => {
      if (data.status === 'success') {
        await setAccessToken(data.data.accessToken);
        await setRefreshToken(data.data.refreshToken);
        if (authContext?.login) {
          authContext.login();
        }
      } else {
        Alert.alert(
          'Login Failed',
          data.message || 'Login failed. Please try again.',
        );
      }
    },
    onError: (error: any) => {
      Alert.alert(
        'Login Failed',
        error?.message || 'An error occurred during login.',
      );
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
