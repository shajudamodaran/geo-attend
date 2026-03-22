import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const locationSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    accuracy: { type: Number },
    address: { type: String },
  },
  { _id: false },
);

const checkSchema = new Schema(
  {
    time: { type: Date, required: true },
    location: { type: locationSchema, required: true },
    photo: { type: String },
    isWithinGeofence: { type: Boolean },
    deviceInfo: { type: String },
  },
  { _id: false },
);

const attendanceSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    date: { type: String, required: true, index: true },
    checkIn: { type: checkSchema },
    checkOut: { type: checkSchema },
    status: {
      type: String,
      enum: ["present", "absent", "late", "half_day"],
      required: true,
    },
    totalHours: { type: Number },
    notes: { type: String },
  },
  { timestamps: true },
);

attendanceSchema.index({ businessId: 1, date: -1 });
attendanceSchema.index({ employeeId: 1, date: -1 });

export type Attendance = InferSchemaType<typeof attendanceSchema> & { _id: mongoose.Types.ObjectId };

const AttendanceModel: Model<Attendance> =
  mongoose.models.Attendance ?? mongoose.model<Attendance>("Attendance", attendanceSchema);

export default AttendanceModel;
