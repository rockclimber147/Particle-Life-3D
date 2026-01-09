export type SimState = {
    numParticles: number;
    particleKinds: number;
    forceFactor: number;
    frictionFactor: number;
    rMax: number;
    attractionCoefficientMatrix: number[][];
    betaCoefficientMatrix: number[][];

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
    updateMatrixValueAtCoords: (i: number, j: number, delta: number) => void
}