import { z } from "zod";

export const registerSchema = z.object({
  businessName: z.string().min(2),
  businessType: z.enum(["Field services", "Retail", "Services", "Manufacturing", "Other"]),
  city: z.string().min(2),
  ownerName: z.string().min(2),
  phone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/]/, "Add at least one special character"),
  teamSize: z.string().min(1),
});

/** Public employee login: find workplaces for this mobile + PIN. */
export const employeeLookupSchema = z.object({
  phone: z.string().min(1),
  pin: z.string().min(4).max(6),
});

export const employeeCreateSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^[0-9]{10}$/),
  email: z.union([z.literal(""), z.string().email()]).optional(),
  role: z.enum(["field_agent", "shop_staff", "manager"]),
  department: z.string().min(1),
  joiningDate: z.string().min(1),
  checkInPin: z.string().regex(/^[0-9]{4,6}$/, "PIN must be 4–6 digits"),
});

export const employeeUpdateSchema = employeeCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
  checkInPin: z.string().regex(/^[0-9]{4,6}$/).optional(),
});

export const attendanceQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  employeeId: z.string().optional(),
  status: z.enum(["present", "absent", "late", "half_day"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const checkInBodySchema = z.object({
  employeeId: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  accuracy: z.number().optional(),
  address: z.string().optional(),
  photoDataUrl: z.string().optional(),
  deviceInfo: z.string().optional(),
});

export const checkOutBodySchema = z.object({
  lat: z.number(),
  lng: z.number(),
  accuracy: z.number().optional(),
  address: z.string().optional(),
  photoDataUrl: z.string().optional(),
  deviceInfo: z.string().optional(),
});

export const businessSettingsSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  logoUrl: z.string().optional(),
  geofenceRadius: z.number().min(50).max(2000).optional(),
  geofenceCenterLat: z.number().optional(),
  geofenceCenterLng: z.number().optional(),
  workStartTime: z.string().optional(),
  workEndTime: z.string().optional(),
  graceMinutes: z.number().min(0).max(120).optional(),
  workingDays: z.array(z.boolean()).length(7).optional(),
  notifications: z
    .object({
      lateAlerts: z.boolean().optional(),
      absenceAlerts: z.boolean().optional(),
      weeklyReportEmail: z.boolean().optional(),
    })
    .optional(),
});

export const reportsPdfQuerySchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  employeeIds: z.string().optional(),
});
