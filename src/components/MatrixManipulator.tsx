import { to2DMatrix } from "../utils/MatrixHelper";

export type MatrixManipulatorProps = {
    title: string;
    matrix: Float32Array;
    particleKinds: number;
    min: number;
    max: number;
    delta: number;
    updateMatrixValueAtCoords: (matrix: Float32Array, i: number, j: number, delta: number, min: number, max: number) => void;
    randomizeMatrix: (matrix: Float32Array, min: number, max: number, step: number) => void;
    getCellColor: (val: number) => string;
}

export default function MatrixManipulator(props: MatrixManipulatorProps) {

    return (
        <>
            <p></p>
            <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginBottom: '8px' 
            }}>
                <span>{props.title}</span> {/* Wrap text in a span for cleaner flex handling */}
                
                <button 
                    onClick={() => props.randomizeMatrix(props.matrix, props.min, props.max, props.delta)}
                    style={{ 
                        fontSize: '11px', 
                        padding: '2px 8px', 
                        cursor: 'pointer',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '4px',
                        color: 'white',
                        outline: 'none'
                    }}
                >
                    Randomize
                </button>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${props.particleKinds + 1}, 1fr)`,
                gap: '2px',
                width: '100%',
                marginTop: '10px',
                backgroundColor: '#000000',
                padding: '2px',
                borderRadius: '4px'
            }}>
                <div style={{ aspectRatio: '1 / 1' }} /> 

                {Array.from({ length: props.particleKinds }).map((_, i) => (
                    <div key={`h-${i}`} style={{ 
                        backgroundColor: `hsl(${360 * (i / props.particleKinds)}, 100%, 50%)`, 
                        aspectRatio: '1 / 1',
                        borderRadius: '2px'
                    }} />
                ))}

                {to2DMatrix(props.matrix, props.particleKinds).map((row, i) => (
                    <div key={`row-group-${i}`} style={{ display: 'contents' }}> 
                        {/* Left Header Cell (Row label) */}
                        <div style={{ 
                            backgroundColor: `hsl(${360 * (i / props.particleKinds)}, 100%, 50%)`, 
                            aspectRatio: '1 / 1',
                            borderRadius: '2px'
                        }} />
                        
                        {/* Data Cells */}
                        {row.map((val, j) => (
                            <div 
                                key={`${i}-${j}`} 
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    props.updateMatrixValueAtCoords(props.matrix, i, j, -props.delta, props.min, props.max); 
                                }}
                                onClick={() => props.updateMatrixValueAtCoords(props.matrix, i, j, props.delta, props.min, props.max)}
                                style={{
                                    backgroundColor: props.getCellColor(val),
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
                                {val.toFixed(2)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    )
}