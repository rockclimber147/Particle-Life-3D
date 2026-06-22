import type { SimPreset } from "../types/SimPreset";
import type { StoredPreset } from "../types/StoredPreset";
import { validatePreset } from "./SimPresetCodec";

const STORAGE_KEY = "particle-life-sim-presets";

type PresetStore = {
  presets: StoredPreset[];
};

export type PresetSaveResult =
  | { ok: true }
  | { ok: false; error: string };

function readStore(): PresetStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { presets: [] };

    const parsed = JSON.parse(raw) as Partial<PresetStore>;
    if (!Array.isArray(parsed.presets)) return { presets: [] };

    return {
      presets: parsed.presets.filter(
        (entry): entry is StoredPreset =>
          typeof entry?.name === "string" && entry.preset != null,
      ),
    };
  } catch {
    return { presets: [] };
  }
}

function writeStore(store: PresetStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function hasDuplicateName(presets: StoredPreset[], name: string): boolean {
  const normalized = name.toLowerCase();
  return presets.some((entry) => entry.name.toLowerCase() === normalized);
}

export function listStoredPresets(): StoredPreset[] {
  return [...readStore().presets].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export function saveStoredPreset(
  name: string,
  preset: SimPreset,
): PresetSaveResult {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { ok: false, error: "Preset name cannot be empty" };
  }

  const validationError = validatePreset(preset);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const store = readStore();
  if (hasDuplicateName(store.presets, trimmedName)) {
    return { ok: false, error: "A preset with this name already exists" };
  }

  store.presets.push({ name: trimmedName, preset });
  writeStore(store);
  return { ok: true };
}

export function loadStoredPreset(name: string): SimPreset | null {
  const entry = readStore().presets.find((p) => p.name === name);
  if (!entry) return null;

  const validationError = validatePreset(entry.preset);
  if (validationError) return null;

  return entry.preset;
}

export function deleteStoredPreset(name: string): void {
  const store = readStore();
  store.presets = store.presets.filter((entry) => entry.name !== name);
  writeStore(store);
}
