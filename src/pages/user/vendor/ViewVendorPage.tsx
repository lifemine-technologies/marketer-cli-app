import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useVendor } from '@/hooks/api/useVendors';
import type { MainStackParamList } from '@/navigation/types';
import { ServiceCoverageMap } from './components/ServiceCoverageMap';

type ViewVendorNavigation = NativeStackNavigationProp<
  MainStackParamList,
  'ViewVendor'
>;

// Format time to AM/PM
const formatTime = (hour?: number) => {
  if (hour === undefined) return 'N/A';
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${period}`;
};

export const ViewVendorPage = () => {
  const route = useRoute();
  const navigation = useNavigation<ViewVendorNavigation>();
  const { id } = route.params as { id: string };
  const { data, isLoading, isError, error } = useVendor(id);

  // Extract vendor from API response
  const vendor = React.useMemo(() => {
    if (!data) return null;
    if (data && typeof data === 'object' && 'data' in data && data.data) {
      const vendorData = data.data;
      if (
        vendorData &&
        typeof vendorData === 'object' &&
        vendorData !== null &&
        'name' in vendorData &&
        '_id' in vendorData
      ) {
        return vendorData;
      }
    }
    if (
      data &&
      typeof data === 'object' &&
      data !== null &&
      'name' in data &&
      '_id' in data
    ) {
      if (!('status' in data && typeof (data as any).status === 'string')) {
        return data;
      }
    }
    return null;
  }, [data]);

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-center text-gray-600 dark:text-slate-400">
          Loading vendor details...
        </Text>
      </View>
    );
  }

  if (isError || !vendor) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6 dark:bg-slate-900">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-center text-base font-semibold text-red-600 dark:text-red-400">
          Error loading vendor
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
          {error instanceof Error ? error.message : 'Vendor not found'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <View className="px-4 py-6">
        {/* Header Card */}
        <View className="mb-4 rounded-2xl bg-blue-600 p-6 shadow-lg dark:bg-blue-700">
          <View className="mb-4 flex-row items-center justify-between">
            <View
              className="flex-1 flex-row items-center"
              style={{ marginRight: 12 }}
            >
              <View className="h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20">
                <Ionicons name="storefront-outline" size={24} color="#ffffff" />
              </View>
              <View className="flex-1" style={{ marginLeft: 12 }}>
                <Text className="text-2xl font-bold text-white">
                  {vendor.name || 'N/A'}
                </Text>
                {vendor.companyName && (
                  <Text className="mt-1 text-base text-white/90">
                    {vendor.companyName}
                  </Text>
                )}
              </View>
            </View>
            {vendor.status && (
              <Badge variant="default" className="bg-white/20">
                {vendor.status}
              </Badge>
            )}
          </View>

          <View className="mb-3 flex-row flex-wrap">
            {vendor.priority && (
              <View style={{ marginRight: 8, marginBottom: 8 }}>
                <Badge
                  variant="secondary"
                  className="bg-white/20 border-white/30"
                >
                  {vendor.priority} Priority
                </Badge>
              </View>
            )}
            {vendor.source && (
              <View style={{ marginRight: 8, marginBottom: 8 }}>
                <Badge
                  variant="secondary"
                  className="bg-white/20 border-white/30"
                >
                  {vendor.source}
                </Badge>
              </View>
            )}
          </View>

          {vendor.phone && (
            <TouchableOpacity
              onPress={() => handlePhonePress(vendor.phone!)}
              className="flex-row items-center rounded-xl border border-white/30 bg-white/20 px-4 py-3"
            >
              <Ionicons name="call-outline" size={18} color="#ffffff" />
              <Text className="ml-2 text-base font-semibold text-white">
                {vendor.phone}
              </Text>
            </TouchableOpacity>
          )}

          {vendor.email && (
            <TouchableOpacity
              onPress={() => handleEmailPress(vendor.email!)}
              className="mt-2 flex-row items-center rounded-xl border border-white/30 bg-white/20 px-4 py-3"
            >
              <Ionicons name="mail-outline" size={18} color="#ffffff" />
              <Text className="ml-2 text-base font-semibold text-white">
                {vendor.email}
              </Text>
            </TouchableOpacity>
          )}

          <View className="mt-4">
            <Text className="text-xs text-white/80 uppercase tracking-wide font-semibold">
              Vendor ID
            </Text>
            <View className="mt-1 bg-white/15 px-3 py-2 rounded-lg border border-white/20">
              <Text className="font-mono text-xs text-white" numberOfLines={1}>
                {vendor._id}
              </Text>
            </View>
          </View>
        </View>

        {/* Service Speciality */}
        {vendor?.serviceSpeciality && (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                  <Ionicons name="star-outline" size={18} color="#2563eb" />
                </View>
                <CardTitle className="ml-2 text-base">
                  Service Speciality
                </CardTitle>
              </View>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendor.serviceSpeciality.speciality &&
              Array.isArray(vendor.serviceSpeciality.speciality) &&
              vendor.serviceSpeciality.speciality.length > 0 ? (
                <View className="flex-row flex-wrap">
                  {vendor.serviceSpeciality.speciality.map(
                    (
                      spec: { label: string; experience: number },
                      index: number,
                    ) => (
                      <View
                        key={index}
                        className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
                        style={{ marginRight: 12, minWidth: 140 }}
                      >
                        <Text className="text-base font-bold text-gray-900 dark:text-slate-100">
                          {spec?.label || 'N/A'}
                        </Text>
                        <View className="mt-1.5 flex-row items-center">
                          <Ionicons
                            name="trophy-outline"
                            size={14}
                            color="#2563eb"
                          />
                          <Text className="ml-1.5 text-sm font-medium text-gray-600 dark:text-slate-400">
                            {spec?.experience || 0} years
                          </Text>
                        </View>
                      </View>
                    ),
                  )}
                </View>
              ) : (
                <Text className="text-sm text-gray-500 dark:text-slate-400">
                  No specialities listed
                </Text>
              )}
            </CardContent>
          </Card>
        )}

        {/* Services & Brands */}
        {vendor?.serviceSpeciality && (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                  <Ionicons name="target-outline" size={18} color="#2563eb" />
                </View>
                <CardTitle className="ml-2 text-base">
                  Services & Brands
                </CardTitle>
              </View>
            </CardHeader>
            <CardContent className="space-y-4">
              {vendor.serviceSpeciality.servicesOffered &&
              Array.isArray(vendor.serviceSpeciality.servicesOffered) &&
              vendor.serviceSpeciality.servicesOffered.length > 0 ? (
                <View>
                  <View className="mb-3 flex-row items-center">
                    <Ionicons
                      name="briefcase-outline"
                      size={16}
                      color="#2563eb"
                    />
                    <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-300">
                      Services Offered
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap">
                    {vendor.serviceSpeciality.servicesOffered.map(
                      (service: string, index: number) => (
                        <View
                          key={index}
                          style={{ marginRight: 8, marginBottom: 8 }}
                        >
                          <Badge variant="default">{service}</Badge>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              ) : (
                <View>
                  <View className="mb-3 flex-row items-center">
                    <Ionicons
                      name="briefcase-outline"
                      size={16}
                      color="#2563eb"
                    />
                    <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-300">
                      Services Offered
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-500 dark:text-slate-400">
                    No services specified
                  </Text>
                </View>
              )}

              {vendor.serviceSpeciality.brands &&
              Array.isArray(vendor.serviceSpeciality.brands) &&
              vendor.serviceSpeciality.brands.length > 0 ? (
                <View>
                  <View className="mb-3 flex-row items-center">
                    <Ionicons name="trophy-outline" size={16} color="#2563eb" />
                    <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-300">
                      Brands
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap">
                    {vendor.serviceSpeciality.brands.map(
                      (brand: string, index: number) => (
                        <View
                          key={index}
                          style={{ marginRight: 8, marginBottom: 8 }}
                        >
                          <Badge variant="outline">{brand}</Badge>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              ) : (
                <View>
                  <View className="mb-3 flex-row items-center">
                    <Ionicons name="trophy-outline" size={16} color="#2563eb" />
                    <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-slate-300">
                      Brands
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-500 dark:text-slate-400">
                    No brands specified
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <View className="mb-4 flex-col gap-4">
          {vendor?.timeSetUp && (
            <Card className="flex-1" style={{ marginRight: 8 }}>
              <CardContent className="p-4">
                <View className="flex-row items-center">
                  <View className="h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Ionicons name="time-outline" size={20} color="#2563eb" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-xs font-medium text-gray-600 dark:text-slate-400">
                      Business Hours
                    </Text>
                    <Text className="mt-1 text-sm font-bold text-gray-900 dark:text-slate-100">
                      {formatTime(vendor.timeSetUp.businessStartTime)} -{' '}
                      {formatTime(vendor.timeSetUp.businessEndTime)}
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          )}

          <Card className="flex-1">
            <CardContent className="p-4">
              <View className="flex-row items-center">
                <View
                  className={`h-10 w-10 items-center justify-center rounded-lg ${
                    vendor.isTechnicianAvailable
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}
                >
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color={vendor.isTechnicianAvailable ? '#2563eb' : '#ef4444'}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-xs font-medium text-gray-600 dark:text-slate-400">
                    Technicians
                  </Text>
                  <Text
                    className={`mt-1 text-sm font-bold ${
                      vendor.isTechnicianAvailable
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {vendor.isTechnicianAvailable
                      ? `${vendor.noOfTechnicians || 0} Available`
                      : 'Unavailable'}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Address */}
        {vendor.address && (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                  <Ionicons name="location-outline" size={18} color="#2563eb" />
                </View>
                <CardTitle className="ml-2 text-base">Address</CardTitle>
              </View>
            </CardHeader>
            <CardContent className="space-y-2">
              <Text className="text-base font-medium text-gray-900 dark:text-slate-100">
                {vendor.address.line1}
              </Text>
              {vendor.address.line2 && (
                <Text className="text-base font-medium text-gray-900 dark:text-slate-100">
                  {vendor.address.line2}
                </Text>
              )}
              <Text className="text-sm text-gray-600 dark:text-slate-400">
                {vendor.address.city}, {vendor.address.state}{' '}
                {vendor.address.code}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-slate-400">
                {vendor.address.country}
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Service Places */}
        {vendor.servicePlaces && vendor.servicePlaces.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                  <Ionicons name="globe-outline" size={18} color="#2563eb" />
                </View>
                <CardTitle className="ml-2 text-base">
                  Service Locations
                </CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <View className="flex-row flex-wrap">
                {vendor.servicePlaces.map((place: string, index: number) => (
                  <View key={index} style={{ marginRight: 8, marginBottom: 8 }}>
                    <Badge variant="secondary">
                      <View className="flex-row items-center">
                        <Ionicons
                          name="location-outline"
                          size={12}
                          color="#2563eb"
                        />
                        <Text className="ml-1">{place}</Text>
                      </View>
                    </Badge>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Service Coverage Map */}
        {vendor.serviceArea?.location?.coordinates &&
          vendor.serviceArea.radius && (
            <View className="mb-4">
              <ServiceCoverageMap
                coordinates={
                  vendor.serviceArea.location.coordinates as [number, number]
                }
                radiusKm={vendor.serviceArea.radius}
              />
            </View>
          )}

        {/* Tags */}
        {vendor.tags && vendor.tags.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                  <Ionicons name="pricetag-outline" size={18} color="#2563eb" />
                </View>
                <CardTitle className="ml-2 text-base">Tags</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <View className="flex-row flex-wrap">
                {vendor.tags.map((tag: string, index: number) => (
                  <View key={index} style={{ marginRight: 8, marginBottom: 8 }}>
                    <Badge variant="default">#{tag}</Badge>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {vendor.note && (
          <Card className="mb-4">
            <CardHeader>
              <View className="flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#2563eb"
                  />
                </View>
                <CardTitle className="ml-2 text-base">Notes</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <Text className="text-sm leading-6 text-gray-600 dark:text-slate-400">
                {vendor.note}
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Follow-ups */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                  <Ionicons name="calendar-outline" size={18} color="#2563eb" />
                </View>
                <CardTitle className="ml-2 text-base">Follow-ups</CardTitle>
              </View>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('AddFollowUp', { vendorId: vendor._id })
                }
                className="rounded-lg bg-blue-600 px-4 py-2"
              >
                <Text className="text-sm font-semibold text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </CardHeader>
          <CardContent className="space-y-3 gap-2">
            {vendor.followUps && vendor.followUps.length > 0 ? (
              vendor.followUps.map((fu: any) => (
                <View
                  key={fu._id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <Text className=" text-base font-semibold text-gray-900 dark:text-slate-100">
                    {fu.note}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#2563eb"
                    />
                    <Text className="ml-1.5 text-sm font-medium text-gray-600 dark:text-slate-400">
                      {new Date(fu.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="items-center py-8">
                <Ionicons
                  name="calendar-outline"
                  size={48}
                  color="#9ca3af"
                  style={{ opacity: 0.4 }}
                />
                <Text className="mt-3 text-sm text-gray-500 dark:text-slate-400">
                  No follow-up activities scheduled
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-gray-100/50 dark:bg-slate-800/50">
          <CardContent className="p-4">
            <View>
              <Text className="text-sm text-gray-600 dark:text-slate-400">
                <Text className="font-semibold">Created:</Text>{' '}
                {vendor.createdAt
                  ? new Date(vendor.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'}
              </Text>
              {vendor.updatedAt && (
                <Text className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                  <Text className="font-semibold">Last Updated:</Text>{' '}
                  {new Date(vendor.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
};
