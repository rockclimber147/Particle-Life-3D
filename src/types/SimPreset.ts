export const SIM_PRESET_VERSION = 1;

/** Serializable simulation settings (excludes runtime particle state). */
export type SimPreset = {
  version: typeof SIM_PRESET_VERSION;
  timeStep: number;
  particleKinds: number;
  numParticles: number;
  forceFactor: number;
  rMax: number;
  frictionHalfLife: number;
  is2D: boolean;
  attractionMatrix: number[];
  betaMatrix: number[];
};
