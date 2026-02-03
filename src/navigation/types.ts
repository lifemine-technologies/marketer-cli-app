export type RootStackParamList = {
  Login: undefined;
  Protected: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type TabParamList = {
  Home: undefined;
  Vendors: undefined;
  Coordinators?: undefined;
  Calendar: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Dashboard: undefined;
  MyVendors: undefined;
  NewVendor: undefined;
  ViewVendor: { id: string };
  AllVendors: undefined;
  Coordinators: undefined;
  ViewMarketer: { id: string };
  AddMarketer: undefined;
  AddFollowUp: { vendorId: string };
  MapPicker: { initialLat?: number; initialLng?: number } | undefined;
  Calendar: undefined;
  Settings: undefined;
};
