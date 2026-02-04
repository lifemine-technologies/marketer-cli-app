import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Card, CardContent } from '@/components/ui/Card';
import { useAddMarketerPage } from '@/hooks/useAddMarketerPage';
import {
  AddMarketerHeader,
  BasicInfoSection,
  RoleSelectionSection,
  FormActions,
} from './components';

function AddMarketerPageContent() {
  const { control, errors, onSubmit, allowedRoles, isPending, handleCancel } =
    useAddMarketerPage();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          className="flex-1 bg-gray-50 dark:bg-slate-900"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="px-4 pb-6">
            <View className="space-y-5">
              <AddMarketerHeader />
              <Card>
                <CardContent className="space-y-6">
                  <BasicInfoSection control={control} errors={errors} />

                  <RoleSelectionSection
                    control={control}
                    errors={errors}
                    allowedRoles={allowedRoles}
                  />

                  {/* Actions */}
                  <FormActions
                    onCancel={handleCancel}
                    onSubmit={onSubmit}
                    isPending={isPending}
                  />
                </CardContent>
              </Card>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

export const AddMarketerPage = () => <AddMarketerPageContent />;
