import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useVendor } from '@/hooks/api/useVendors';

export const ViewVendorPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const { data, isLoading, isError, error } = useVendor(id);

  const vendor = data?.data;

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
      <View className="space-y-4 px-4 py-6">
        {/* Header Card */}
        <View className="mb-2 rounded-2xl bg-blue-600 p-6 shadow-lg dark:bg-blue-700">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20">
                <Ionicons name="storefront-outline" size={24} color="#ffffff" />
              </View>
              <Text className="text-2xl font-bold text-white">{vendor.name}</Text>
            </View>
            <Badge variant="secondary">{vendor.status}</Badge>
          </View>
          <View className="flex-row items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-3">
            <Ionicons name="call-outline" size={18} color="#ffffff" />
            <Text className="text-base font-semibold text-white">{vendor.phone}</Text>
          </View>
        </View>

        {/* Address Card */}
        <Card className="mb-2">
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                <Ionicons name="location-outline" size={18} color="#2563eb" />
              </View>
              <CardTitle>Address</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <Text className="text-gray-900 dark:text-slate-100">
              {vendor.address?.line1 || 'N/A'}
            </Text>
            {vendor.address?.line2 && (
              <Text className="text-gray-900 dark:text-slate-100">{vendor.address.line2}</Text>
            )}
            {vendor.address?.code && (
              <Text className="text-gray-600 dark:text-slate-400">
                Pincode: {vendor.address.code}
              </Text>
            )}
            {vendor.address?.city && (
              <Text className="text-gray-600 dark:text-slate-400">City: {vendor.address.city}</Text>
            )}
            {vendor.address?.state && (
              <Text className="text-gray-600 dark:text-slate-400">
                State: {vendor.address.state}
              </Text>
            )}
            {vendor.address?.country && (
              <Text className="text-gray-600 dark:text-slate-400">
                Country: {vendor.address.country}
              </Text>
            )}
          </CardContent>
        </Card>

        {/* Service Places */}
        <Card className="mb-2">
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                <Ionicons name="globe-outline" size={18} color="#2563eb" />
              </View>
              <CardTitle>Service Places</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <View className="flex-row flex-wrap gap-2">
              {vendor.servicePlaces?.length ? (
                vendor.servicePlaces.map((place) => (
                  <Badge key={place} variant="secondary">
                    {place}
                  </Badge>
                ))
              ) : (
                <Text className="text-gray-500 dark:text-slate-400">No service places</Text>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Brands & Services */}
        <Card className="mb-2">
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                <Ionicons name="pricetag-outline" size={18} color="#2563eb" />
              </View>
              <CardTitle>Brands</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <View className="flex-row flex-wrap gap-2">
              {vendor.serviceSpeciality?.brands?.length ? (
                vendor.serviceSpeciality.brands.map((brand) => (
                  <Badge key={brand} variant="outline">
                    {brand}
                  </Badge>
                ))
              ) : (
                <Text className="text-gray-500 dark:text-slate-400">No brands</Text>
              )}
            </View>

            {vendor.serviceSpeciality?.servicesOffered?.length > 0 && (
              <View className="mt-2">
                <Text className="mb-1 text-gray-500 dark:text-slate-400">Services Offered</Text>
                <View className="flex-row flex-wrap gap-2">
                  {vendor.serviceSpeciality.servicesOffered.map((service) => (
                    <Badge key={service} variant="default">
                      {service}
                    </Badge>
                  ))}
                </View>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Operating Hours */}
        {vendor.timeSetUp && (
          <Card className="mb-2">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                  <Ionicons name="time-outline" size={18} color="#2563eb" />
                </View>
                <CardTitle>Operating Hours</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <Text className="text-gray-900 dark:text-slate-100">
                {vendor.timeSetUp.businessStartTime} - {vendor.timeSetUp.businessEndTime}
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        <Card className="mb-2">
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                <Ionicons name="information-circle-outline" size={18} color="#2563eb" />
              </View>
              <CardTitle>Additional Info</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="space-y-2">
            {vendor.priority && (
              <View>
                <Text className="text-xs font-medium uppercase text-gray-500 dark:text-slate-500">
                  Priority
                </Text>
                <Badge variant="default">{vendor.priority}</Badge>
              </View>
            )}
            <View>
              <Text className="text-xs font-medium uppercase text-gray-500 dark:text-slate-500">
                Created At
              </Text>
              <Text className="text-gray-900 dark:text-slate-100">
                {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            {vendor.note && (
              <View>
                <Text className="text-xs font-medium uppercase text-gray-500 dark:text-slate-500">
                  Note
                </Text>
                <Text className="text-gray-900 dark:text-slate-100">{vendor.note}</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Follow-ups */}
        <Card className="mb-2">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 shadow-sm dark:bg-blue-900/30">
                  <Ionicons name="calendar-outline" size={18} color="#2563eb" />
                </View>
                <CardTitle>Follow-ups</CardTitle>
              </View>
              <TouchableOpacity
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('AddFollowUp', { vendorId: vendor._id });
                }}
                className="rounded-xl bg-blue-600 px-4 py-2">
                <Text className="text-sm font-semibold text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </CardHeader>
          <CardContent>
            {vendor.followUps?.length ? (
              <View className="space-y-4">
                {vendor.followUps.map((fu) => (
                  <View
                    key={fu._id}
                    className="border-b border-gray-100 pb-4 last:border-0 dark:border-slate-700">
                    <View className="flex-row items-start gap-3">
                      <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
                        <Ionicons name="time-outline" size={18} color="#2563eb" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {new Date(fu.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                        <Text className="text-sm text-gray-700 dark:text-slate-300">{fu.note}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500 dark:text-slate-400">No follow-ups yet</Text>
            )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
};
