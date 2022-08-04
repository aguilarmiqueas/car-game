import create from "zustand";

const useGlobalStore = create((set) => ({
  car: null,
  setCar: (carProp) => set((state) => ({ car: carProp })),
  vel: 0,
  setVel: (newVel) => set((state) => ({ vel: newVel })),
  path: null,
  setPath: (newPath) => set((state) => ({ path: newPath })),
  floor: null,
  setFloor: (newFloor) => set((state) => ({ floor: newFloor })),
  boosters: null,
  setBoosters: (newBoosters) => set((state) => ({ boosters: newBoosters })),
}));

export { useGlobalStore };
