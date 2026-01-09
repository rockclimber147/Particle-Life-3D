import type { SimState, SimActions } from "../types/Sim"
import { SIM_LIMITS } from "../constants/SimConstants"
import NumericLabelSlider from "./LabelSlider"
import MatrixManipulator from "./MatrixManipulator"
import { useState } from "react"

export type ControlPanelProps = {
    state: SimState
    actions: SimActions
}

export default function ControlPanel(props: ControlPanelProps) {
    const [ _, setTick] = useState(0);
    
    const actions = props.actions;
    const sim = props.state;

    const handleMatrixUpdate = (i: number, j: number, delta: number) => {
        actions.updateMatrixValueAtCoords(i, j, delta);
        setTick(t => t + 1);
    };

    const handleParticleKindChange = (val: number) => {
        actions.updateParticleKinds(val);
        setTick(t => t + 1); 
    };

    const handleRandomize = () => {
        actions.randomizeRules();
        setTick(t => t + 1);
    };

    const getCellColor = (val: number) => {
        const intensity = Math.floor(Math.abs(val) * 255);
        
        if (val < 0) return `rgb(${intensity}, 0, 0)`;
        if (val > 0) return `rgb(0, ${intensity}, 0)`;
        return `rgba(0, 0, 0, 1)`;
    };

    return (
        <>
        <NumericLabelSlider
            title="Particle Kinds"
            initialValue={sim.particleKinds}
            min={SIM_LIMITS.MIN_KINDS} max={SIM_LIMITS.MAX_KINDS} step={1}
            onChange={handleParticleKindChange}
        />

        <NumericLabelSlider
            title="Total Particles"
            initialValue={sim.numParticles}
            min={SIM_LIMITS.MIN_PARTICLES} max={SIM_LIMITS.MAX_PARTICLES} step={1}
            onChange={actions.updateTotalParticles}
        />

        <NumericLabelSlider
            title="Force Factor"
            initialValue={sim.forceFactor}
            min={SIM_LIMITS.MIN_FORCE} max={SIM_LIMITS.MAX_FORCE} step={0.1}
            onChange={actions.updateForceFactor}
        />

        <NumericLabelSlider
            title="Radius (rMax)"
            initialValue={sim.rMax}
            min={SIM_LIMITS.MIN_RMAX} max={SIM_LIMITS.MAX_RMAX} step={0.01}
            onChange={actions.updateMaxRadius}
        />

        <NumericLabelSlider
            title="Friction Half-Life"
            initialValue={SIM_LIMITS.DEFAULT_FRICTION_HL}
            min={SIM_LIMITS.MIN_FRICTION_HL} max={SIM_LIMITS.MAX_FRICTION_HL} step={0.01}
            onChange={actions.updateFrictionHalfLife}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <button style={{ flex: 1, padding: '8px' }} onClick={actions.resetParticles}>Reset Pos</button>
            <button style={{ flex: 1, padding: '8px' }} onClick={handleRandomize}>Randomize Rules</button>
        </div>

        <MatrixManipulator 
                matrix={sim.matrix}
                particleKinds={sim.particleKinds}
                updateMatrixValueAtCoords={handleMatrixUpdate}
                getCellColor={getCellColor}
            />
        </>
    )
}