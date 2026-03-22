import "dotenv/config";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../lib/mongodb";
import Attendance from "../models/Attendance";
import Business from "../models/Business";
import Employee from "../models/Employee";
import { deriveStatus, formatDateKey } from "../lib/attendance-helpers";
import { isWithinGeofence } from "../lib/geofence";

const BASE_LAT = 10.5276;
const BASE_LNG = 76.2144;

function offsetCoord(): { lat: number; lng: number } {
  return {
    lat: BASE_LAT + (Math.random() - 0.5) * 0.012,
    lng: BASE_LNG + (Math.random() - 0.5) * 0.012,
  };
}

function randomStatus(): "present" | "absent" | "late" | "half_day" {
  const r = Math.random();
  if (r < 0.08) return "absent";
  if (r < 0.18) return "late";
  if (r < 0.24) return "half_day";
  return "present";
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Set MONGODB_URI before running seed.");
  }
  await connectDB();
  await Promise.all([
    Attendance.deleteMany({}),
    Employee.deleteMany({}),
    Business.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("Demo@1234", 12);
  const pinHash = await bcrypt.hash("1234", 10);

  const business = await Business.create({
    name: "Summit Field Services (Demo)",
    ownerName: "Demo Owner",
    email: "demo@geoattend.in",
    passwordHash,
    phone: "9895000000",
    address: "Industrial Estate, Phase 2",
    city: "Thrissur",
    businessType: "Field services",
    teamSize: "6–15",
    geofenceRadius: 150,
    geofenceCenter: { lat: BASE_LAT, lng: BASE_LNG },
    workStartTime: "09:30",
    workEndTime: "19:00",
    graceMinutes: 15,
  });

  const team = [
    { name: "Arun Kumar", role: "field_agent" as const, department: "Sales", phone: "9876543210" },
    { name: "Priya Menon", role: "shop_staff" as const, department: "Showroom", phone: "9845612345" },
    { name: "Sreejith Nair", role: "manager" as const, department: "Operations", phone: "9812345678" },
    { name: "Divya Krishnan", role: "field_agent" as const, department: "Sales", phone: "9867123456" },
    { name: "Rahul Das", role: "shop_staff" as const, department: "Showroom", phone: "9834567890" },
  ];

  const employees = await Employee.insertMany(
    team.map((t) => ({
      businessId: business._id,
      name: t.name,
      phone: t.phone,
      email: `${t.phone}@team.geoattend.local`,
      role: t.role,
      department: t.department,
      joiningDate: new Date(),
      checkInPinHash: pinHash,
      isActive: true,
    })),
  );

  const today = new Date();
  for (let day = 0; day < 30; day += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - day);
    const dateKey = formatDateKey(d);
    for (const emp of employees) {
      const statusRoll = randomStatus();
      if (statusRoll === "absent") {
        await Attendance.create({
          businessId: business._id,
          employeeId: emp._id,
          date: dateKey,
          status: "absent",
        });
        continue;
      }
      const checkInTime = new Date(d);
      checkInTime.setHours(9, Math.floor(Math.random() * 90), 0, 0);
      if (statusRoll === "late") {
        checkInTime.setHours(10, 5 + Math.floor(Math.random() * 25), 0, 0);
      }
      const checkOutTime = new Date(d);
      if (statusRoll === "half_day") {
        checkOutTime.setTime(checkInTime.getTime() + 3 * 60 * 60 * 1000);
      } else {
        checkOutTime.setHours(18 + Math.floor(Math.random() * 2), 30 + Math.floor(Math.random() * 45), 0, 0);
      }
      const cin = offsetCoord();
      const cout = offsetCoord();
      const withinIn = isWithinGeofence(BASE_LAT, BASE_LNG, business.geofenceRadius, cin.lat, cin.lng);
      const withinOut = isWithinGeofence(BASE_LAT, BASE_LNG, business.geofenceRadius, cout.lat, cout.lng);
      const hours = Math.max(0, (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60));
      let status = deriveStatus({
        checkInTime,
        workStartTime: business.workStartTime,
        graceMinutes: business.graceMinutes,
        hasCheckout: true,
        hoursWorked: hours,
      });
      if (statusRoll === "late") status = "late";
      if (statusRoll === "half_day") status = "half_day";
      await Attendance.create({
        businessId: business._id,
        employeeId: emp._id,
        date: dateKey,
        status,
        totalHours: Math.round(hours * 10) / 10,
        checkIn: {
          time: checkInTime,
          location: {
            lat: cin.lat,
            lng: cin.lng,
            accuracy: 8 + Math.random() * 20,
            address: "Near depot, Thrissur",
          },
          isWithinGeofence: withinIn,
          deviceInfo: "seed",
        },
        checkOut: {
          time: checkOutTime,
          location: {
            lat: cout.lat,
            lng: cout.lng,
            accuracy: 10 + Math.random() * 25,
            address: "Near depot, Thrissur",
          },
          isWithinGeofence: withinOut,
          deviceInfo: "seed",
        },
      });
    }
  }

  // Ensure today's row for first employee is "checked in" for live demo
  const todayKey = formatDateKey(new Date());
  await Attendance.deleteMany({ businessId: business._id, employeeId: employees[0]._id, date: todayKey });
  const liveIn = new Date();
  liveIn.setHours(9, 20, 0, 0);
  const c = offsetCoord();
  await Attendance.create({
    businessId: business._id,
    employeeId: employees[0]._id,
    date: todayKey,
    status: "present",
    checkIn: {
      time: liveIn,
      location: {
        lat: c.lat,
        lng: c.lng,
        accuracy: 12,
        address: "Near Vadakkumnathan, Thrissur",
      },
      isWithinGeofence: true,
      deviceInfo: "live-demo",
    },
  });

  console.log("Seed complete.");
  console.log("Business ID (owner/API):", business._id.toString());
  console.log("Owner login: demo@geoattend.in / Demo@1234");
  console.log("Employee login: mobile + PIN 1234 — e.g. 9876543210, 9845612345, 9812345678 (see seed team). No business ID required.");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
