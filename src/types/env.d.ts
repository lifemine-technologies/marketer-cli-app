declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_IDP_BASE_URL?: string;
      EXPO_PUBLIC_API_BASE_URL?: string;
      GOOGLE_MAPS_API_KEY?: string;
      NODE_ENV?: string;
    }
  }

  const process: {
    env: NodeJS.ProcessEnv;
  };
}

export {};
