import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAddNewVendor } from '@/hooks/useAddVendor';
import { BasicInfo } from './components/BasicInfo';
import { AddressInfo } from './components/AddressInfo';
import { ServiceCoverage } from './components/ServiceCoverage';
import { ExpertiseSpecialityInfo } from './components/ExpertiseSpecialityInfo';
import { Operations } from './components/Operations';
import { FollowUp } from './components/FollowUp';
import { PreviewStep } from './components/PreviewData';

const STEPS = [
  'Basic Info',
  'Address',
  'Service Coverage',
  'Services',
  'Operations',
  'Follow Up',
  'Preview',
];

const STEP_FIELDS: Record<number, string[]> = {
  0: ['name', 'phone'],
  1: [
    'address.line1',
    'address.city',
    'address.state',
    'address.country',
    'address.code',
  ],
  2: ['serviceArea.radius'],
  3: [],
  4: [],
  5: [],
  6: [],
};

export const NewVendorPage = () => {
  const {
    control,
    errors,
    setValue,
    watch,
    specialityFields,
    appendSpeciality,
    removeSpeciality,
    followUpFields,
    appendFollowUp,
    removeFollowUp,
    servicePlacesInput,
    setServicePlacesInput,
    brandInput,
    setBrandInput,
    serviceInput,
    setServiceInput,
    tagInput,
    setTagInput,
    tags,
    addTag,
    removeTag,
    brands,
    addBrand,
    removeBrand,
    servicesOffered,
    addService,
    removeService,
    onSubmit,
    addVendorMutation,
    navigation,
    trigger,
  } = useAddNewVendor();

  const [step, setStep] = useState(0);

  const isFirstStep = step === 0;
  const isLastStep = step === STEPS.length - 1;
  const formValues = watch();
  const [canGoNext, setCanGoNext] = useState(false);

  useEffect(() => {
    const checkStepValid = () => {
      const requiredFields = STEP_FIELDS[step] ?? [];
      if (requiredFields.length === 0) return true;
      for (const field of requiredFields) {
        const parts = field.split('.');
        let value: unknown = formValues;
        for (const p of parts) {
          value = (value as Record<string, unknown>)?.[p];
        }
        if (value == null || String(value).trim() === '') return false;
      }
      return true;
    };
    setCanGoNext(checkStepValid());
  }, [formValues, step]);

  const nextStep = async () => {
    const valid = await trigger(STEP_FIELDS[step] as any);
    if (valid && !isLastStep) setStep(step + 1);
  };

  const prevStep = () => {
    if (!isFirstStep) setStep(step - 1);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 bg-gray-50 px-3 pt-4 dark:bg-slate-900">
            <View className="mb-2 rounded-2xl bg-blue-600 p-6 shadow-lg">
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <Ionicons name="add" size={24} color="#fff" />
                </View>
                <View>
                  <Text className="text-2xl font-bold text-white">
                    Add New Vendor
                  </Text>
                  <Text className="text-sm text-blue-100">
                    Step {step + 1} of {STEPS.length} — {STEPS[step]}
                  </Text>
                </View>
              </View>
            </View>

            <Card>
              <CardContent className="space-y-6">
                <View className="flex-row gap-2">
                  {STEPS.map((_, index) => (
                    <View
                      key={index}
                      className={`h-2 flex-1 rounded-full ${
                        index <= step ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </View>

                {step === 0 && <BasicInfo control={control} errors={errors} />}
                {step === 1 && (
                  <AddressInfo
                    control={control}
                    errors={errors}
                    setValue={setValue}
                    addressLatitude={formValues.address?.latitude}
                    addressLongitude={formValues.address?.longitude}
                  />
                )}
                {step === 2 && (
                  <ServiceCoverage
                    control={control}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                    servicePlacesInput={servicePlacesInput}
                    setServicePlacesInput={setServicePlacesInput}
                    addressLatitude={formValues.address?.latitude}
                    addressLongitude={formValues.address?.longitude}
                  />
                )}
                {step === 3 && (
                  <ExpertiseSpecialityInfo
                    brandInput={brandInput}
                    setBrandInput={setBrandInput}
                    serviceInput={serviceInput}
                    setServiceInput={setServiceInput}
                    appendSpeciality={appendSpeciality}
                    removeSpeciality={removeSpeciality}
                    specialityFields={specialityFields}
                    control={control}
                    errors={errors}
                    brands={brands}
                    servicesOffered={servicesOffered}
                    addBrand={addBrand}
                    removeBrand={removeBrand}
                    addService={addService}
                    removeService={removeService}
                  />
                )}
                {step === 4 && (
                  <Operations
                    control={control}
                    errors={errors}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    tags={tags}
                    addTag={addTag}
                    removeTag={removeTag}
                  />
                )}
                {step === 5 && (
                  <FollowUp
                    control={control}
                    errors={errors}
                    appendFollowUp={appendFollowUp}
                    removeFollowUp={removeFollowUp}
                    followUpFields={followUpFields}
                  />
                )}
                {step === 6 && (
                  <PreviewStep
                    data={formValues}
                    onSubmit={onSubmit}
                    isSubmitting={addVendorMutation.isPending}
                  />
                )}

                <View className="flex-row gap-3 border-t border-gray-200 pt-4 dark:border-slate-700">
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onPress={prevStep}
                    >
                      <Text>Back</Text>
                    </Button>
                  )}
                  {!isLastStep && (
                    <Button
                      className="flex-1 rounded-xl bg-blue-600"
                      onPress={nextStep}
                      disabled={!canGoNext}
                    >
                      <Text className="font-semibold text-white">Next</Text>
                    </Button>
                  )}
                </View>

                <Button
                  variant="outline"
                  className="mt-2 rounded-xl border-gray-300 dark:border-slate-600"
                  onPress={() => (navigation as any)?.goBack?.()}
                >
                  <Text className="text-gray-700 dark:text-slate-300">
                    Cancel
                  </Text>
                </Button>
              </CardContent>
            </Card>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
