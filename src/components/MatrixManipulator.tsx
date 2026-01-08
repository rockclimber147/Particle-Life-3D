export type MatrixManipulatorProps = {
    matrix: number[][];
    particleKinds: number;
    updateMatrixValueAtCoords: (i: number, j: number, delta: number) => void;
    getCellColor: (val: number) => string;
}

export default function MatrixManipulator(props: MatrixManipulatorProps) {

    return (
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

            {props.matrix.map((row, i) => (
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
                                props.updateMatrixValueAtCoords(i, j, -0.1); 
                            }}
                            onClick={() => props.updateMatrixValueAtCoords(i, j, 0.1)}
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
                            {val.toFixed(1)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}