import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const employeeSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    role: {
      type: String,
      enum: ["field_agent", "shop_staff", "manager"],
      required: true,
    },
    department: { type: String, default: "" },
    joiningDate: { type: Date, default: Date.now },
    avatar: { type: String },
    checkInPinHash: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

employeeSchema.index({ businessId: 1, phone: 1 }, { unique: true });

export type Employee = InferSchemaType<typeof employeeSchema> & { _id: mongoose.Types.ObjectId };

const EmployeeModel: Model<Employee> =
  mongoose.models.Employee ?? mongoose.model<Employee>("Employee", employeeSchema);

export default EmployeeModel;
