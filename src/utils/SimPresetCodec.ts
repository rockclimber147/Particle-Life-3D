import { SIM_LIMITS } from "../constants/SimConstants";
import type { SimPreset } from "../types/SimPreset";
import { SIM_PRESET_VERSION } from "../types/SimPreset";
import type { SimState } from "../types/Sim";

export type PresetDecodeResult =
  | { ok: true; preset: SimPreset }
  | { ok: false; error: string };

export function frictionHalfLifeFromFactor(
  timeStep: number,
  frictionFactor: number,
): number {
  if (frictionFactor <= 0 || frictionFactor >= 1) {
    return SIM_LIMITS.DEFAULT_FRICTION_HL;
  }
  return Number(
    ((timeStep * Math.log(0.5)) / Math.log(frictionFactor)).toFixed(2),
  );
}

export function createPresetFromState(
  state: SimState,
  is2D: boolean,
): SimPreset {
  return {
    version: SIM_PRESET_VERSION,
    timeStep: state.timeStep,
    particleKinds: state.particleKinds,
    numParticles: state.numParticles,
    forceFactor: state.forceFactor,
    rMax: state.rMax,
    frictionHalfLife: frictionHalfLifeFromFactor(
      state.timeStep,
      state.frictionFactor,
    ),
    is2D,
    attractionMatrix: Array.from(state.attractionCoefficientMatrix),
    betaMatrix: Array.from(state.betaCoefficientMatrix),
  };
}

export function encodePreset(preset: SimPreset): string {
  return JSON.stringify(preset);
}

export function decodePreset(text: string): PresetDecodeResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text.trim());
  } catch {
    return { ok: false, error: "Invalid preset format" };
  }

  const preset = migratePreset(raw);
  if (!preset) {
    return { ok: false, error: "Unsupported or unknown preset version" };
  }

  const error = validatePreset(preset);
  if (error) {
    return { ok: false, error };
  }

  return { ok: true, preset };
}

function migratePreset(raw: unknown): SimPreset | null {
  if (typeof raw !== "object" || raw === null) return null;

  const candidate = raw as Partial<SimPreset>;
  if (candidate.version === SIM_PRESET_VERSION) {
    return candidate as SimPreset;
  }

  // Future: add version migrations here (e.g. v1 -> v2).
  return null;
}

export function validatePreset(preset: SimPreset): string | null {
  const {
    timeStep,
    particleKinds,
    numParticles,
    forceFactor,
    rMax,
    frictionHalfLife,
    attractionMatrix,
    betaMatrix,
  } = preset;

  if (
    timeStep < SIM_LIMITS.MIN_TIMESTEP ||
    timeStep > SIM_LIMITS.MAX_TIMESTEP
  ) {
    return "Time step is out of range";
  }
  if (
    particleKinds < SIM_LIMITS.MIN_KINDS ||
    particleKinds > SIM_LIMITS.MAX_KINDS
  ) {
    return "Particle kinds is out of range";
  }
  if (
    numParticles < SIM_LIMITS.MIN_PARTICLES ||
    numParticles > SIM_LIMITS.MAX_PARTICLES
  ) {
    return "Particle count is out of range";
  }
  if (forceFactor < SIM_LIMITS.MIN_FORCE || forceFactor > SIM_LIMITS.MAX_FORCE) {
    return "Force factor is out of range";
  }
  if (rMax < SIM_LIMITS.MIN_RMAX || rMax > SIM_LIMITS.MAX_RMAX) {
    return "Radius is out of range";
  }
  if (
    frictionHalfLife < SIM_LIMITS.MIN_FRICTION_HL ||
    frictionHalfLife > SIM_LIMITS.MAX_FRICTION_HL
  ) {
    return "Friction half-life is out of range";
  }

  const expectedMatrixSize = particleKinds * particleKinds;
  if (attractionMatrix.length !== expectedMatrixSize) {
    return "Attraction matrix size does not match particle kinds";
  }
  if (betaMatrix.length !== expectedMatrixSize) {
    return "Repulsion matrix size does not match particle kinds";
  }

  return null;
}
