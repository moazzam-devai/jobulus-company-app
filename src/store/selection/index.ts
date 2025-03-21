import { create } from "zustand";

interface SelectionState {
  selectedCompany: string;
  selectedLocation: any;
  setSelectedCompany: (data: any) => void;
  setSelectedLocation: (data: any) => void;
}

export const useSelection = create<SelectionState>((set) => ({
  selectedCompany: "",
  selectedLocation: "",

  setSelectedCompany: (data: string) => {
    set({ selectedCompany: data });
  },
  setSelectedLocation: (data: string) => {
    set({ selectedLocation: data });
  },
}));

export const setSelectedCompany = (data) => {
  return useSelection.getState().setSelectedCompany(data);
};

export const setSelectedLocation = (data) => {
  return useSelection.getState().setSelectedLocation(data);
};
