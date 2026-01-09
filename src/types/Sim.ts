export type SimState = {
    numParticles: number;
    particleKinds: number;
    forceFactor: number;
    frictionFactor: number;
    rMax: number;
    attractionCoefficientMatrix: Float32Array;
    betaCoefficientMatrix: Float32Array;

    colors: Int32Array;
    positionsX: Float32Array;
    positionsY: Float32Array;
    positionsZ: Float32Array;
    velocitiesX: Float32Array;
    velocitiesY: Float32Array;
    velocitiesZ: Float32Array;
};

export type SimActions = {
    updateParticleKinds: (val: number) => void
    updateTotalParticles: (val: number) => void
    updateForceFactor: (val: number) => void
    updateMaxRadius: (val: number) => void
    updateFrictionHalfLife: (val: number) => void
    randomizeRules: () => void
    resetParticles: () => void
    setRandomVelocities: () => void
    updateMatrixValueAtCoords: (matrix: Float32Array, i: number, j: number, delta: number, min: number, max: number) => void
    randomizeMatrix: (matrix: Float32Array, min: number, max: number, step: number) => void
}