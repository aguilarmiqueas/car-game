import create from "zustand";

const useGlobalStore = create((set) => ({
  loaded: false,
  setLoaded: (newLoaded) => set((state) => ({ loaded: newLoaded })),
  car: null,
  setCar: (carProp) => set((state) => ({ car: carProp })),
  carPos: [0, 0, 0],
  setCarPos: (newCarPos) => set((state) => ({ carPos: newCarPos })),
  vel: 0,
  setVel: (newVel) => set((state) => ({ vel: newVel })),
  path: null,
  button: null,
  setButton: (newButton) => set((state) => ({ button: newButton })),
  setPath: (newPath) => set((state) => ({ path: newPath })),
  floor: null,
  setFloor: (newFloor) => set((state) => ({ floor: newFloor })),
  boosters: null,
  setBoosters: (newBoosters) => set((state) => ({ boosters: newBoosters })),
  deviceOrientation: [0, 0, 0],
  setDeviceOrientation: (newOrientation) =>
    set((state) => ({ deviceOrientation: newOrientation })),
  deviceOrientationEnabled: false,
  setDeviceOrientationFlag: (bool) =>
    set((state) => ({ deviceOrientationEnabled: bool })),
  bdo: [0, 0, 0],
  setBdo: (newBdo) => set((state) => ({ bdo: newBdo })),
  HUDRef: null,
  setHUDRef: (newHUDRef) => set((state) => ({ HUDRef: newHUDRef })),
}));

export { useGlobalStore };
