import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from './src/hooks/contextProviderHook';
import { ThemeProvider, useTheme } from './src/hooks/useTheme';
import { Router } from './src/navigation/Router';
import { handleMutationError, handleMutationSuccess } from './src/config/axios';
import { StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      onError: handleMutationError,
      onSuccess: handleMutationSuccess,
    },
  },
});

const AppContent = () => {
  const { isDark } = useTheme();

  return (
    <View className={isDark ? 'dark' : ''} style={styles.root}>
      <Router />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
