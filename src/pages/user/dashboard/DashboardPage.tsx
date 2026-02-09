import React from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { navigateToViewVendor } from '@/navigation/rootNavigation';
import { useDashboardPage } from '@/hooks/useDashboardPage';
import {
  DashboardHeader,
  AttendanceCard,
  TodaysFollowUps,
  QuickActions,
} from './components';

function DashboardPageContent() {
  const {
    userRole,
    userPhone,
    isAdmin,
    attendance,
    isActive,
    isGettingLocation,
    isPunchInPending,
    isPunchOutPending,
    handlePunchIn,
    handlePunchOut,
    todaysFollowUps,
    isLoadingFollowUps,
    filteredActions,
    handleLogout,
    navigateToScreen,
  } = useDashboardPage();

  const handleEventPress = (eventId: string) => {
    navigateToViewVendor(eventId);
  };

  const handleViewCalendar = () => {
    navigateToScreen('Calendar');
  };

  if (isLoadingFollowUps) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <DashboardHeader
        userRole={userRole}
        userPhone={userPhone}
        onLogout={handleLogout}
      />

      <View className="px-4 pb-6">
        {!isAdmin && (
          <AttendanceCard
            attendance={attendance}
            isActive={isActive}
            isGettingLocation={isGettingLocation}
            isPunchInPending={isPunchInPending}
            isPunchOutPending={isPunchOutPending}
            onPunchIn={handlePunchIn}
            onPunchOut={handlePunchOut}
          />
        )}

        <TodaysFollowUps
          events={todaysFollowUps}
          isLoading={isLoadingFollowUps}
          onEventPress={handleEventPress}
          onViewCalendar={handleViewCalendar}
        />

        <QuickActions
          actions={filteredActions}
          onActionPress={screen => navigateToScreen(screen)}
        />
      </View>
    </ScrollView>
  );
}

export const DashboardPage = () => <DashboardPageContent />;
