import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const geoSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false },
);

const businessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    businessType: { type: String, default: "" },
    teamSize: { type: String, default: "" },
    geofenceRadius: { type: Number, default: 200 },
    geofenceCenter: {
      type: geoSchema,
      default: () => ({ lat: 10.5276, lng: 76.2144 }),
    },
    workStartTime: { type: String, default: "09:30" },
    workEndTime: { type: String, default: "19:00" },
    graceMinutes: { type: Number, default: 15 },
    workingDays: {
      type: [Boolean],
      default: () => [true, true, true, true, true, false, false],
    },
    logoUrl: { type: String },
    notifications: {
      lateAlerts: { type: Boolean, default: true },
      absenceAlerts: { type: Boolean, default: true },
      weeklyReportEmail: { type: Boolean, default: false },
    },
    plan: { type: String, default: "free" },
  },
  { timestamps: true },
);

export type Business = InferSchemaType<typeof businessSchema> & { _id: mongoose.Types.ObjectId };

const BusinessModel: Model<Business> =
  mongoose.models.Business ?? mongoose.model<Business>("Business", businessSchema);

export default BusinessModel;
