import React from 'react';
import { ScrollView, View } from 'react-native';
import { navigateToViewVendor } from '@/navigation/rootNavigation';
import { useDashboardPage } from '@/hooks/useDashboardPage';
import {
  DashboardHeader,
  AttendanceCard,
  StatsGrid,
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
    stats,
    todaysFollowUps,
    isLoadingFollowUps,
    filteredActions,
    handleLogout,
    navigateToScreen,
  } = useDashboardPage();

  const handleStatPress = (stat: { label: string }) => {
    if (stat.label.includes('Vendors')) {
      navigateToScreen('Vendors');
    } else if (stat.label.includes('Coordinators')) {
      navigateToScreen('Coordinators');
    }
  };

  const handleEventPress = (eventId: string) => {
    navigateToViewVendor(eventId);
  };

  const handleViewCalendar = () => {
    navigateToScreen('Calendar');
  };

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

        <StatsGrid stats={stats} onStatPress={handleStatPress} />

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
