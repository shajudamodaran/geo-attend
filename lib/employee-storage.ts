/** Remembered on device after a successful employee sign-in (convenience only). */
export const EMPLOYEE_LAST_PHONE_KEY = "geoattend-employee-phone";
export const EMPLOYEE_LAST_BUSINESS_KEY = "geoattend-business-id";

export function clearEmployeeDevicePrefs(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(EMPLOYEE_LAST_PHONE_KEY);
    window.localStorage.removeItem(EMPLOYEE_LAST_BUSINESS_KEY);
  } catch {
    /* ignore */
  }
}
