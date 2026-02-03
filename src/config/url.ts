// API Configuration
// Note: Set EXPO_PUBLIC_IDP_BASE_URL and EXPO_PUBLIC_API_BASE_URL environment variables
// Available environments:
// - Dev: IDP=https://dev-idp.fatafatservice.com, API=https://mark-api-dev.lifemine.io
// - Local: IDP=http://192.168.50.219:7008, API=http://192.168.50.219:9007
// - Trial: https://trial-api.fatafatservice.com
export const API_CONFIG = {
  IDP_BASE_URL: process.env.EXPO_PUBLIC_IDP_BASE_URL || 'https://dev-idp.fatafatservice.com',
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://mark-api-dev.lifemine.io',
  TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/v1/auth/Marketer/login',
    VERIFY_LOGIN: '/v1/auth/Marketer/verify-login',
    LOGOUT: '/v1/auth/Marketer/logout',
    REGISTER: '/v1/auth/Marketer/register',
    REFRESH: '/v1/auth/Marketer/refresh',
    IS_EXISTING_USER: '/v1/auth/Marketer/isExistingUser',
    FORGET_PASSWORD: '/v1/auth/Marketer/forgot-password',
    FORGET_PASSWORD_VERIFY: '/v1/auth/Marketer/forgot-password/verify',
    FORGET_PASSWORD_SET: '/v1/auth/Marketer/forgot-password/set',
  },
  configure: {
    SET_PASSWORD: '/v1/auth/Marketer/set-password',
  },
  WELL_KNOWN: {
    PUBLIC: '/.well-known/jwks.json',
  },
  ACCOUNT_SETUP: {
    ACTION_ITEMS: '/v1/auth/Marketer/action-items',
    VERIFY_PHONE: '/v1/auth/Marketer/action-item/verify-phone',
    CONFIRM_VERIFY_PHONE: '/v1/auth/Marketer/action-item/confirm-verify-phone',
    UPDATE_PASSWORD: '/v1/auth/Marketer/action-item/update-password',
  },
  PROFILE: {
    DETAILS: '/v1/marketer/details',
    CHANGE_PASSWORD: '/v1/auth/SuperAdmin/change-password',
  },
  ADMIN: {
    VENDORS: '/v1/admin/vendors',
    LOCATION_HISTORY: (id: string) => `/v1/admin/locations/${id}`,
  },
  VENDOR: {
    LIST: '/v1/vendor',
    ByMarketer: (marketerId: string) => `/v1/vendor/by-marketer/${marketerId}`,
    ADD: '/v1/vendor',
    VIEW: (id: string) => `/v1/vendor/single/${id}`,
  },
  MARKETER: {
    LIST: '/v1/marketer',
    ADD: '/v1/marketer',
    VIEW: (id: string) => `/v1/marketer/single/${id}`,
    GRAPH: (id: string) => `/v1/marketer/graph/${id}`,
    ATTENDANCE: {
      PUNCH_IN: '/v1/marketer/attendance/check-in',
      PUNCH_OUT: '/v1/marketer/attendance/check-out',
      PUNCH_TOGGLE: '/v1/marketer/attendance/check-toggle',
      LOCATION: '/v1/marketer/attendance/location',
    },
  },
  MANAGER: {
    DetailsUpdate: (id: string) => `/v1/manager/update-details/${id}`,
  },
  LOOKUP: {
    CITIES: '/v1/look-up/cities',
  },
  FOLLOWUP: {
    CALENDAR: '/v1/follow-ups/calendar',
    ADD: (id: string) => `/v1/follow-ups/${id}`,
  },
} as const;

// Log API configuration on startup (for debugging)
if (__DEV__) {
  console.log('API Configuration:', {
    IDP_BASE_URL: API_CONFIG.IDP_BASE_URL,
    BASE_URL: API_CONFIG.BASE_URL,
    hasEnvIDP: !!process.env.EXPO_PUBLIC_IDP_BASE_URL,
    hasEnvAPI: !!process.env.EXPO_PUBLIC_API_BASE_URL,
  });
}
