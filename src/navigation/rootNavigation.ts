import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/**
 * Navigate to ViewVendor from anywhere without using navigation context.
 * Use this when useNavigation() is not available (e.g. in Calendar tab when switching views).
 */
export function navigateToViewVendor(id: string): void {
  if (!navigationRef.isReady()) return;
  try {
    navigationRef.navigate('Protected', {
      screen: 'ViewVendor',
      params: { id },
    });
  } catch {
    // ignore
  }
}
