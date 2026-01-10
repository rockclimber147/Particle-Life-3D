import { initializeExactMatrix, initializeRandomMatrix, randomizeInPlace } from "./MatrixHelper";
import type { SimActions, SimState } from "../types/Sim";
import { SIM_LIMITS } from "../constants/SimConstants";
import { UniormGridPartition } from "./UniformGridPartition";

export class SimulationEngine {
    private s: SimState
    private uniformGrid = new UniormGridPartition();
    public readonly actions: SimActions;

    constructor(state: SimState) {
        this.s = state;
        this.uniformGrid.setResolution(this.s.rMax);
        this.actions = {
            updateParticleKinds: this.updateParticleKinds,
            updateTotalParticles: this.updateTotalParticles,
            updateForceFactor: (val: number) => this.s.forceFactor = val,
            updateMaxRadius: this.updateRMax,
            updateFrictionHalfLife: (val: number) => this.s.frictionFactor = Math.pow(0.5, this.s.timeStep / val),
            setRandomVelocities: this.setRandomVelocities,
            updateMatrixValueAtCoords: (matrix: Float32Array, i: number, j: number, delta: number, min: number, max: number): void => {
            const newVal = Math.max(min, Math.min(max, matrix[this.s.particleKinds * i + j] + delta));
            matrix[this.s.particleKinds * i + j] = newVal;
            },
            randomizeMatrix: randomizeInPlace
        }
    }


    updateParticleKinds = (val: number) => {
        this.s.particleKinds = val;
        this.resetMatrices();
        this.resetParticles();
    };

    updateTotalParticles = (val: number) => {
        this.s.numParticles = val;
        this.resetParticles();
    }

    resetParticles(): void {
        const s = this.s
        for (let i = 0; i < s.numParticles; i++) {
        s.colors[i] = Math.floor(Math.random() * s.particleKinds);
        s.positionsX[i] = Math.random() / 5 - 1/10 + 0.5;
        s.positionsY[i] = Math.random() / 5 - 1/10 + 0.5;
        s.positionsZ[i] = Math.random() / 5 - 1/10 + 0.5;
        s.velocitiesX[i] = 0;
        s.velocitiesY[i] = 0;
        s.velocitiesZ[i] = 0;
        }
    };

    resetMatrices(): void {
        const s = this.s
        s.attractionCoefficientMatrix = initializeRandomMatrix(s.particleKinds, -1, 1, 0.1);
        s.betaCoefficientMatrix = initializeExactMatrix(s.particleKinds, SIM_LIMITS.DEFAULT_BETA)
    };

    updatePositions(): void {
        const s = this.s
        for (let i = 0; i < s.numParticles; i++) {
        s.positionsX[i] += s.velocitiesX[i] * s.timeStep;
        s.positionsY[i] += s.velocitiesY[i] * s.timeStep;
        s.positionsZ[i] += s.velocitiesZ[i] * s.timeStep;

        s.positionsX[i] = ((s.positionsX[i] % 1) + 1) % 1;
        s.positionsY[i] = ((s.positionsY[i] % 1) + 1) % 1;
        s.positionsZ[i] = ((s.positionsZ[i] % 1) + 1) % 1;
        }
    };

    setRandomVelocities = () => {
      const s = this.s;
      for (let i = 0; i < s.numParticles; i++) {
        s.velocitiesX[i] = Math.random() * 10 - 5;
        s.velocitiesY[i] = Math.random() * 10 - 5;
        s.velocitiesZ[i] = Math.random() * 10 - 5;
      }
    }

    updateRMax = (val: number): void => {
        this.s.rMax = val;
        this.uniformGrid.setResolution(this.s.rMax);
    }


    force(r: number, a: number, beta: number) {
        if (r < beta) return r / beta - 1;
        else if (beta < r && r < 1) return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta));
        return 0;
    }

    updateVelocities(): void {
        const s = this.s;
        const N = this.uniformGrid.numDivisions;

        this.uniformGrid.rebuild(s);

        for (let i = 0; i < s.numParticles; i++) {
            let totalForceX = 0, totalForceY = 0, totalForceZ = 0;

            const gx = Math.min(Math.floor(s.positionsX[i] * N), N - 1);
            const gy = Math.min(Math.floor(s.positionsY[i] * N), N - 1);
            const gz = Math.min(Math.floor(s.positionsZ[i] * N), N - 1);

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        
                        const { cellIdx, ox, oy, oz } = this.uniformGrid.getNeighborData(gx, gy, gz, dx, dy, dz);

                        let j = this.uniformGrid.head[cellIdx];
                        while (j !== -1) {
                            if (i !== j) {
                                const force = this.applyForceBetween(i, j, ox, oy, oz);
                                if (force) {
                                    totalForceX += force.fx;
                                    totalForceY += force.fy;
                                    totalForceZ += force.fz;
                                }
                            }
                            j = this.uniformGrid.next[j];
                        }
                    }
                }
            }

            this.applyVelocityUpdate(i, totalForceX, totalForceY, totalForceZ);
        }
    }

    private applyVelocityUpdate(i: number, fx: number, fy: number, fz: number) {
        const s = this.s;
        const forceFactor = s.rMax * s.forceFactor;
        
        s.velocitiesX[i] = (s.velocitiesX[i] * s.frictionFactor) + (fx * forceFactor * s.timeStep);
        s.velocitiesY[i] = (s.velocitiesY[i] * s.frictionFactor) + (fy * forceFactor * s.timeStep);
        s.velocitiesZ[i] = (s.velocitiesZ[i] * s.frictionFactor) + (fz * forceFactor * s.timeStep);
    }

    private applyForceBetween(i: number, j: number, ox: number, oy: number, oz: number) {
        const s = this.s;
        const rx = (s.positionsX[j] + ox) - s.positionsX[i];
        const ry = (s.positionsY[j] + oy) - s.positionsY[i];
        const rz = (s.positionsZ[j] + oz) - s.positionsZ[i];

        const r2 = rx * rx + ry * ry + rz * rz;
        if (r2 > 0 && r2 < s.rMax * s.rMax) {
            const r = Math.sqrt(r2);
            const f = this.force(
                r / s.rMax, 
                s.attractionCoefficientMatrix[s.particleKinds * s.colors[i] + s.colors[j]], 
                s.betaCoefficientMatrix[s.particleKinds * s.colors[i] + s.colors[j]]
            );
            const invR = f / r;
            return { 
                fx: rx * invR, 
                fy: ry * invR, 
                fz: rz * invR 
            };
        }
        return null;
    }
}