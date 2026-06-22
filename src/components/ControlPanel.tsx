import type { SimState, SimActions } from "../types/Sim";
import { SIM_LIMITS } from "../constants/SimConstants";
import NumericLabelSlider from "./LabelSlider";
import MatrixManipulator from "./MatrixManipulator";
import { useState, type CSSProperties } from "react";
import { decodePreset, encodePreset, frictionHalfLifeFromFactor } from "../utils/SimPresetCodec";
import PresetList from "./PresetList";
import type { SimPreset } from "../types/SimPreset";

export type ControlPanelProps = {
  state: SimState;
  actions: SimActions;
  configKey: number;
  onPresetApplied?: () => void;
};

const presetButtonStyle: CSSProperties = {
  flex: 1,
  padding: "8px",
  cursor: "pointer",
  backgroundColor: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "4px",
  color: "white",
};

export default function ControlPanel(props: ControlPanelProps) {
  const [_, setTick] = useState(0);
  const [presetMessage, setPresetMessage] = useState<string | null>(null);

  const actions = props.actions;
  const sim = props.state;
  const sliderKey = `${props.configKey}-${_}`;

  const handleMatrixUpdate = (
    matrix: Float32Array,
    i: number,
    j: number,
    delta: number,
    min: number,
    max: number,
  ) => {
    actions.updateMatrixValueAtCoords(matrix, i, j, delta, min, max);
    setTick((t) => t + 1);
  };

  const handleMatrixRandomize = (
    matrix: Float32Array,
    min: number,
    max: number,
    step: number,
  ) => {
    actions.randomizeMatrix(matrix, min, max, step);
    setTick((t) => t + 1);
  };

  const handleParticleKindChange = (val: number) => {
    actions.updateParticleKinds(val);
    setTick((t) => t + 1);
  };

  const getCellColor = (val: number) => {
    const intensity = Math.floor(Math.abs(val) * 255);

    if (val < 0) return `rgb(${intensity}, 0, 0)`;
    if (val > 0) return `rgb(0, ${intensity}, 0)`;
    return `rgba(0, 0, 0, 1)`;
  };

  const showPresetMessage = (message: string) => {
    setPresetMessage(message);
    window.setTimeout(() => setPresetMessage(null), 2000);
  };

  const handleCopyPreset = async () => {
    try {
      await navigator.clipboard.writeText(encodePreset(actions.exportPreset()));
      showPresetMessage("Copied to clipboard");
    } catch {
      showPresetMessage("Failed to copy");
    }
  };

  const handlePastePreset = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const result = decodePreset(text);
      if (!result.ok) {
        showPresetMessage(result.error);
        return;
      }
      applyLoadedPreset(result.preset);
      showPresetMessage("Preset applied");
    } catch {
      showPresetMessage("Failed to paste");
    }
  };

  const applyLoadedPreset = (preset: SimPreset) => {
    actions.applyPreset(preset);
    setTick((t) => t + 1);
    props.onPresetApplied?.();
  };

  return (
    <>
      <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
        <button
          style={{ flex: 1, padding: "8px" }}
          onClick={actions.setRandomVelocities}
        >
          Shake
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button style={presetButtonStyle} onClick={handleCopyPreset}>
          Copy Config
        </button>
        <button style={presetButtonStyle} onClick={handlePastePreset}>
          Paste Config
        </button>
      </div>
      {presetMessage && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: "12px",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {presetMessage}
        </p>
      )}

      <NumericLabelSlider
        key={`timeStep-${sliderKey}`}
        title="Time Step"
        initialValue={sim.timeStep}
        min={SIM_LIMITS.MIN_TIMESTEP}
        max={SIM_LIMITS.MAX_TIMESTEP}
        step={SIM_LIMITS.MIN_TIMESTEP}
        onChange={actions.updateTimeStep}
      />

      <NumericLabelSlider
        key={`particleKinds-${sliderKey}`}
        title="Particle Kinds"
        initialValue={sim.particleKinds}
        min={SIM_LIMITS.MIN_KINDS}
        max={SIM_LIMITS.MAX_KINDS}
        step={1}
        onChange={handleParticleKindChange}
      />

      <NumericLabelSlider
        key={`numParticles-${sliderKey}`}
        title="Total Particles"
        initialValue={sim.numParticles}
        min={SIM_LIMITS.MIN_PARTICLES}
        max={SIM_LIMITS.MAX_PARTICLES}
        step={1}
        onChange={actions.updateTotalParticles}
      />

      <NumericLabelSlider
        key={`forceFactor-${sliderKey}`}
        title="Force Factor"
        initialValue={sim.forceFactor}
        min={SIM_LIMITS.MIN_FORCE}
        max={SIM_LIMITS.MAX_FORCE}
        step={0.1}
        onChange={actions.updateForceFactor}
      />

      <NumericLabelSlider
        key={`rMax-${sliderKey}`}
        title="Radius (rMax)"
        initialValue={sim.rMax}
        min={SIM_LIMITS.MIN_RMAX}
        max={SIM_LIMITS.MAX_RMAX}
        step={0.01}
        onChange={actions.updateMaxRadius}
      />

      <NumericLabelSlider
        key={`frictionHalfLife-${sliderKey}`}
        title="Friction Half-Life"
        initialValue={frictionHalfLifeFromFactor(
          sim.timeStep,
          sim.frictionFactor,
        )}
        min={SIM_LIMITS.MIN_FRICTION_HL}
        max={SIM_LIMITS.MAX_FRICTION_HL}
        step={0.01}
        onChange={actions.updateFrictionHalfLife}
      />

      <MatrixManipulator
        key={`attraction-${sliderKey}`}
        title="Attraction Coefficients"
        matrix={sim.attractionCoefficientMatrix}
        particleKinds={sim.particleKinds}
        updateMatrixValueAtCoords={handleMatrixUpdate}
        randomizeMatrix={handleMatrixRandomize}
        getCellColor={getCellColor}
        min={-1}
        max={1}
        delta={0.1}
      />

      <MatrixManipulator
        key={`beta-${sliderKey}`}
        title="Repulsion Coefficients"
        matrix={sim.betaCoefficientMatrix}
        particleKinds={sim.particleKinds}
        updateMatrixValueAtCoords={handleMatrixUpdate}
        randomizeMatrix={handleMatrixRandomize}
        getCellColor={getCellColor}
        min={0.05}
        max={1}
        delta={0.05}
      />

      <PresetList
        exportPreset={actions.exportPreset}
        onLoadPreset={applyLoadedPreset}
      />
    </>
  );
}
