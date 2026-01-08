import type { SimState, SimActions } from "../types/Sim"
import { SIM_LIMITS } from "../constants/SimConstants"
import NumericLabelSlider from "./LabelSlider"

export type ControlPanelProps = {
    state: SimState
    actions: SimActions
    updateTick: number
}

export default function ControlPanel(props: ControlPanelProps) {
    const actions = props.actions;
    const sim = props.state;

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
            onChange={actions.updateParticleKinds}
        />

        <NumericLabelSlider
            title="Total Particles"
            initialValue={sim.numParticles}
            min={SIM_LIMITS.MIN_PARTICLES} max={SIM_LIMITS.MAX_PARTICLES} step={1}
            onChange={actions.resetParticles}
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
            <button style={{ flex: 1, padding: '8px' }} onClick={actions.randomizeRules}>Randomize Rules</button>
        </div>

        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${sim.particleKinds + 1}, 1fr)`,
            gap: '2px',
            width: '100%',
            marginTop: '10px',
            backgroundColor: '#000000',
            padding: '2px',
            borderRadius: '4px'
        }}>
            <div style={{ aspectRatio: '1 / 1' }} /> 

            {Array.from({ length: sim.particleKinds }).map((_, i) => (
                <div key={`h-${i}`} style={{ 
                    backgroundColor: `hsl(${360 * (i / sim.particleKinds)}, 100%, 50%)`, 
                    aspectRatio: '1 / 1',
                    borderRadius: '2px'
                }} />
            ))}

            {sim.matrix.map((row, i) => (
                <div key={`row-group-${i}`} style={{ display: 'contents' }}> 
                    {/* Left Header Cell (Row label) */}
                    <div style={{ 
                        backgroundColor: `hsl(${360 * (i / sim.particleKinds)}, 100%, 50%)`, 
                        aspectRatio: '1 / 1',
                        borderRadius: '2px'
                    }} />
                    
                    {/* Data Cells */}
                    {row.map((val, j) => (
                        <div 
                            key={`${i}-${j}`} 
                            onContextMenu={(e) => {
                                e.preventDefault();
                                actions.updateMatrixValueAtCoords(i, j, -0.1); 
                            }}
                            onClick={() => actions.updateMatrixValueAtCoords(i, j, 0.1)}
                            style={{
                                backgroundColor: getCellColor(val),
                                aspectRatio: '1 / 1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                color:'#fff',
                                cursor: 'pointer',
                                userSelect: 'none',
                                borderRadius: '2px',
                                fontWeight: 'bold'
                            }}
                        >
                            {val.toFixed(1)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
        </>
    )
}