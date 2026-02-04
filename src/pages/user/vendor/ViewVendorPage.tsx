import React from 'react';
import { View, ScrollView } from 'react-native';
import { useViewVendorPage } from '@/hooks/useViewVendorPage';
import {
  VendorHeader,
  ServiceSpecialityCard,
  ServicesBrandsCard,
  QuickStatsCard,
  AddressCard,
  ServiceLocationsCard,
  TagsCard,
  NotesCard,
  FollowUpsCard,
  VendorFooterCard,
  LoadingState,
  ErrorState,
  ServiceCoverageMap,
} from './components';

function ViewVendorPageContent() {
  const {
    vendor,
    isLoading,
    isError,
    error,
    handlePhonePress,
    handleEmailPress,
    handleAddFollowUp,
  } = useViewVendorPage();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !vendor) {
    return <ErrorState error={error} />;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <View className="px-4 py-6">
        {/* Header Card */}
        <VendorHeader
          vendor={vendor}
          onPhonePress={handlePhonePress}
          onEmailPress={handleEmailPress}
        />

        {/* Service Speciality */}
        <ServiceSpecialityCard
          speciality={vendor.serviceSpeciality?.speciality}
        />

        {/* Services & Brands */}
        <ServicesBrandsCard
          servicesOffered={vendor.serviceSpeciality?.servicesOffered}
          brands={vendor.serviceSpeciality?.brands}
        />

        {/* Quick Stats */}
        <QuickStatsCard
          businessStartTime={vendor.timeSetUp?.businessStartTime}
          businessEndTime={vendor.timeSetUp?.businessEndTime}
          isTechnicianAvailable={vendor.isTechnicianAvailable}
          noOfTechnicians={vendor.noOfTechnicians}
        />

        {/* Address */}
        <AddressCard address={vendor.address} />

        {/* Service Places */}
        <ServiceLocationsCard servicePlaces={vendor.servicePlaces} />

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
        <TagsCard tags={vendor.tags} />

        {/* Notes */}
        <NotesCard note={vendor.note} />

        {/* Follow-ups */}
        <FollowUpsCard
          followUps={vendor.followUps}
          vendorId={vendor._id}
          onAddFollowUp={handleAddFollowUp}
        />

        {/* Footer */}
        <VendorFooterCard
          createdAt={vendor.createdAt}
          updatedAt={vendor.updatedAt}
        />
      </View>
    </ScrollView>
  );
}

export const ViewVendorPage = () => <ViewVendorPageContent />;
