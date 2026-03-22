import type { Types } from "mongoose";

export type EmployeeRole = "field_agent" | "shop_staff" | "manager";

export type AttendanceStatus = "present" | "absent" | "late" | "half_day";

export interface GeoPoint {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
}

export interface CheckPayload {
  time: Date;
  location: GeoPoint;
  photo?: string;
  isWithinGeofence?: boolean;
  deviceInfo?: string;
}

export interface BusinessDoc {
  _id: Types.ObjectId;
  name: string;
  ownerName: string;
  email: string;
  passwordHash: string;
  phone: string;
  address: string;
  city: string;
  businessType?: string;
  teamSize?: string;
  geofenceRadius: number;
  geofenceCenter: { lat: number; lng: number };
  workStartTime: string;
  workEndTime: string;
  graceMinutes: number;
  workingDays: boolean[];
  logoUrl?: string;
  notifications: {
    lateAlerts: boolean;
    absenceAlerts: boolean;
    weeklyReportEmail: boolean;
  };
  plan: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeDoc {
  _id: Types.ObjectId;
  businessId: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  role: EmployeeRole;
  department: string;
  joiningDate: Date;
  avatar?: string;
  checkInPinHash?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceDoc {
  _id: Types.ObjectId;
  businessId: Types.ObjectId;
  employeeId: Types.ObjectId;
  date: string;
  checkIn?: CheckPayload;
  checkOut?: CheckPayload;
  status: AttendanceStatus;
  totalHours?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionRole = "owner" | "employee";
