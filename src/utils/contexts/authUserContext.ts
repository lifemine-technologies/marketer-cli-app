import { createContext } from "react";

export const AuthUserContext = createContext<null | {
  user: { accessToken: string } | null;
  userLoading: boolean;
  userFetching: boolean;
  publicKey: string;
  login?: () => void;
  logout?: () => void;
}>(null);

export type UserRole = "ADMIN" | "MANAGER" | "COORDINATOR" | "TELECALLER";

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface Attendance {
  punchInTime: string;
  punchOutTime: string;
  checkInGeoLocation: GeoPoint;
  checkOutGeoLocation: GeoPoint;
  isActive: boolean;
}

export interface UserData {
  _id: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  identifier: string;
  updatedAt: string;
  __v: number;
  attendance?: Attendance;
}

export const UserProviderContext = createContext<undefined | UserData>(
  undefined,
);
