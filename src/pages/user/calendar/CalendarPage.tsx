import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { navigateToViewVendor } from '@/navigation/rootNavigation';
import { useCalendarPage } from '@/hooks/useCalendarPage';
import {
  DayVisitsCard,
  CalendarToolbar,
  WeekdayLabelsRow,
  MonthGridView,
  WeekView,
} from './components';

function CalendarPageContent() {
  const {
    view,
    handleViewChange,
    setSelectedDate,
    currentDate,
    selectedDate,
    today,
    isFetching,
    refetch,
    selectedDayEvents,
    monthRows,
    weekDays,
    getEventsForDate,
    handlePrev,
    handleNext,
    jumpToToday,
    contentWidth,
    monthCellSize,
    scrollPaddingBottom,
    topInset,
    isSelectedToday,
    isViewShowingToday,
  } = useCalendarPage();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-900">
      {/* Loading indicator at top */}
      {isFetching && (
        <View className="h-0.5 bg-blue-200 dark:bg-blue-900 overflow-hidden">
          <View className="h-full w-1/3 bg-blue-500 rounded-r-full" />
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: topInset,
          paddingBottom: scrollPaddingBottom,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refetch()}
            tintColor="#2563eb"
          />
        }
      >
        {/* Selected day's events (sidebar card) */}
        <DayVisitsCard
          selectedDate={selectedDate}
          events={selectedDayEvents}
          isSelectedToday={isSelectedToday}
          onEventPress={navigateToViewVendor}
        />

        {/* Week/Month toggle, prev/next, refresh, today */}
        <CalendarToolbar
          view={view}
          onViewChange={handleViewChange}
          currentDate={currentDate}
          weekDays={weekDays}
          onPrev={handlePrev}
          onNext={handleNext}
          onRefresh={() => refetch()}
          onJumpToToday={jumpToToday}
          isFetching={isFetching}
          isSelectedToday={isSelectedToday}
          isViewShowingToday={isViewShowingToday}
        />

        {/* Mon, Tue, Wed... labels */}
        <WeekdayLabelsRow />

        {/* Month grid or Week columns */}
        {view === 'Month' && monthCellSize > 0 && (
          <MonthGridView
            monthRows={monthRows}
            contentWidth={contentWidth}
            monthCellSize={monthCellSize}
            currentDate={currentDate}
            selectedDate={selectedDate}
            today={today}
            getEventsForDate={getEventsForDate}
            onSelectDate={date => setSelectedDate(new Date(date))}
          />
        )}
        {view === 'Week' && (
          <WeekView
            weekDays={weekDays}
            selectedDate={selectedDate}
            today={today}
            getEventsForDate={getEventsForDate}
            onSelectDate={date => setSelectedDate(new Date(date))}
          />
        )}
      </ScrollView>
    </View>
  );
}

export const CalendarPage = () => <CalendarPageContent />;
