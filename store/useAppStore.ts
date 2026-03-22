import { create } from "zustand";

type AppState = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
  employeeSearch: string;
  setEmployeeSearch: (v: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
  employeeSearch: "",
  setEmployeeSearch: (v) => set({ employeeSearch: v }),
}));
