import { useContext, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  phoneNumberSchema,
  passwordSchema,
} from '@/utils/validations/primitive';
import { UserProviderContext } from '@/utils/contexts/authUserContext';
import { useAddMarketer, type AddMarketerData } from '@/hooks/api/useMarketers';

const createMarketerSchema = (
  allowedRoles: ('MANAGER' | 'COORDINATOR' | 'TELECALLER')[],
) => {
  return z.object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be at most 50 characters'),
    phone: phoneNumberSchema(),
    password: passwordSchema(),
    role: z.enum(allowedRoles as [string, ...string[]], {
      errorMap: () => ({ message: 'Role is required' }),
    }),
  });
};

export type MarketerFormData = z.infer<ReturnType<typeof createMarketerSchema>>;

export interface UseAddMarketerPageReturn {
  // Form
  control: ReturnType<typeof useForm<MarketerFormData>>['control'];
  errors: ReturnType<typeof useForm<MarketerFormData>>['formState']['errors'];
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;

  allowedRoles: ('MANAGER' | 'COORDINATOR' | 'TELECALLER')[];
  isAdmin: boolean;
  isPending: boolean;
  handleCancel: () => void;
}

export function useAddMarketerPage(): UseAddMarketerPageReturn {
  const navigation = useNavigation();
  const user = useContext(UserProviderContext);
  const userRole = user?.role ?? 'COORDINATOR';
  const isAdmin = userRole === 'ADMIN';

  const allowedRoles: ('MANAGER' | 'COORDINATOR' | 'TELECALLER')[] = useMemo(
    () =>
      isAdmin ? ['MANAGER', 'COORDINATOR', 'TELECALLER'] : ['COORDINATOR'],
    [isAdmin],
  );

  const marketerSchema = useMemo(
    () => createMarketerSchema(allowedRoles),
    [allowedRoles],
  );

  const addMarketerMutation = useAddMarketer();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MarketerFormData>({
    resolver: zodResolver(marketerSchema),
    defaultValues: {
      name: '',
      phone: '',
      password: '',
      role: allowedRoles[0],
    },
  });

  const onSubmit = handleSubmit(async data => {
    try {
      const result = await addMarketerMutation.mutateAsync(
        data as AddMarketerData,
      );

      if (result.status === 'success') {
        Alert.alert(
          'Success',
          result.message ?? 'Coordinator added successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                (navigation as any).goBack?.();
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'Error',
          result.message ?? 'Failed to add coordinator. Please try again.',
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ??
        error?.message ??
        'Failed to add coordinator. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  });

  const handleCancel = () => {
    (navigation as any).goBack?.();
  };

  return {
    control,
    errors,
    onSubmit,
    allowedRoles,
    isAdmin,
    isPending: addMarketerMutation.isPending,
    handleCancel,
  };
}
