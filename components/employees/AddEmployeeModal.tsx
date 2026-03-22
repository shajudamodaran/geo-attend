"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { employeeCreateSchema } from "@/lib/schemas";
import type { z } from "zod";

type FormValues = z.infer<typeof employeeCreateSchema>;

export default function AddEmployeeModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(employeeCreateSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      role: "shop_staff",
      department: "",
      joiningDate: new Date().toISOString().slice(0, 10),
      checkInPin: "",
    },
  });

  const submit = handleSubmit(async (values) => {
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      toast.error(typeof j.error === "string" ? j.error : "Could not add team member");
      return;
    }
    toast.success("Team member added — share their mobile PIN for check-in.");
    reset();
    onCreated();
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add team member</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Full name" {...register("name")} error={Boolean(errors.name)} helperText={errors.name?.message} />
          <TextField label="Mobile (10 digits)" {...register("phone")} error={Boolean(errors.phone)} helperText={errors.phone?.message} />
          <TextField label="Email (optional)" {...register("email")} error={Boolean(errors.email)} helperText={errors.email?.message} />
          <TextField select label="Role" {...register("role")} error={Boolean(errors.role)} helperText={errors.role?.message}>
            <MenuItem value="field_agent">Field agent</MenuItem>
            <MenuItem value="shop_staff">Shop staff</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
          </TextField>
          <TextField label="Department" {...register("department")} error={Boolean(errors.department)} helperText={errors.department?.message} />
          <TextField type="date" label="Joining date" InputLabelProps={{ shrink: true }} {...register("joiningDate")} error={Boolean(errors.joiningDate)} helperText={errors.joiningDate?.message} />
          <TextField
            label="Check-in PIN (4–6 digits)"
            type="password"
            {...register("checkInPin")}
            error={Boolean(errors.checkInPin)}
            helperText={errors.checkInPin?.message ?? "They will use this with their mobile number on the check-in screen."}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => void submit()} disabled={isSubmitting}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
