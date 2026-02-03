import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Button } from '@/components/ui/Button';
import type { VendorFormData } from '@/utils/validations/vendorSchema';

interface PreviewStepProps {
  data: VendorFormData;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const PreviewStep = ({ data, onSubmit, isSubmitting }: PreviewStepProps) => {
  if (!data) return null;

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 15 }}>
      <View className="mb-4">
        <Text className="text-lg font-bold text-gray-800 dark:text-slate-100">Basic Info</Text>
        <Text className="text-gray-700 dark:text-slate-300">Vendor Name: {data.name || '-'}</Text>
        <Text className="text-gray-700 dark:text-slate-300">Phone: {data.phone || '-'}</Text>
        <Text className="text-gray-700 dark:text-slate-300">Email: {data.email || '-'}</Text>
        <Text className="text-gray-700 dark:text-slate-300">Company: {data.companyName || '-'}</Text>
        <Text className="text-gray-700 dark:text-slate-300">Priority: {data.priority || '-'}</Text>
        <Text className="text-gray-700 dark:text-slate-300">Source: {data.source || '-'}</Text>
      </View>

      {data.address && (
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 dark:text-slate-100">Address</Text>
          <Text className="text-gray-700 dark:text-slate-300">Line 1: {data.address.line1 || '-'}</Text>
          <Text className="text-gray-700 dark:text-slate-300">Line 2: {data.address.line2 || '-'}</Text>
          <Text className="text-gray-700 dark:text-slate-300">City: {data.address.city || '-'}</Text>
          <Text className="text-gray-700 dark:text-slate-300">State: {data.address.state || '-'}</Text>
          <Text className="text-gray-700 dark:text-slate-300">Country: {data.address.country || '-'}</Text>
          <Text className="text-gray-700 dark:text-slate-300">Code: {data.address.code || '-'}</Text>
        </View>
      )}

      {data.serviceSpeciality?.speciality && data.serviceSpeciality.speciality.length > 0 && (
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 dark:text-slate-100">
            Service Speciality
          </Text>
          {data.serviceSpeciality.speciality.map((s, i) => (
            <Text key={i} className="text-gray-700 dark:text-slate-300">
              {i + 1}. {s.label} ({s.experience ?? 0} yrs)
            </Text>
          ))}
        </View>
      )}

      {data.serviceSpeciality?.brands && data.serviceSpeciality.brands.length > 0 && (
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 dark:text-slate-100">Brands</Text>
          {data.serviceSpeciality.brands.map((b, i) => (
            <Text key={i} className="text-gray-700 dark:text-slate-300">
              {i + 1}. {b}
            </Text>
          ))}
        </View>
      )}

      {data.serviceSpeciality?.servicesOffered &&
        data.serviceSpeciality.servicesOffered.length > 0 && (
          <View className="mb-4">
            <Text className="text-lg font-bold text-gray-800 dark:text-slate-100">
              Services Offered
            </Text>
            {data.serviceSpeciality.servicesOffered.map((s, i) => (
              <Text key={i} className="text-gray-700 dark:text-slate-300">
                {i + 1}. {s}
              </Text>
            ))}
          </View>
        )}

      {data.tags && data.tags.length > 0 && (
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 dark:text-slate-100">Tags</Text>
          {data.tags.map((t, i) => (
            <Text key={i} className="text-gray-700 dark:text-slate-300">
              {i + 1}. {t}
            </Text>
          ))}
        </View>
      )}

      <View className="mb-4">
        <Text className="text-lg font-bold text-gray-800 dark:text-slate-100">Technicians</Text>
        <Text className="text-gray-700 dark:text-slate-300">
          No of Technicians: {data.noOfTechnicians ?? 0}
        </Text>
      </View>

      {data.timeSetUp && (
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 dark:text-slate-100">
            Business Hours
          </Text>
          <Text className="text-gray-700 dark:text-slate-300">
            Start: {data.timeSetUp.businessStartTime}:00 - End: {data.timeSetUp.businessEndTime}:00
          </Text>
        </View>
      )}

      {data.note && (
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 dark:text-slate-100">Note</Text>
          <Text className="text-gray-700 dark:text-slate-300">{data.note}</Text>
        </View>
      )}

      {data.followUps && data.followUps.length > 0 && (
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 dark:text-slate-100">Follow Ups</Text>
          {data.followUps.map((f, i) => (
            <Text key={i} className="text-gray-700 dark:text-slate-300">
              {i + 1}. {f.date || '-'} - {f.note || '-'}
            </Text>
          ))}
        </View>
      )}

      <Button
        className="mt-4 flex-1 rounded-xl bg-blue-600"
        onPress={onSubmit}
        disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center font-semibold text-white">Submit Vendor</Text>
        )}
      </Button>
    </ScrollView>
  );
};
