import { initializeExactMatrix, initializeRandomMatrix } from "./MatrixHelper";
import type { SimState } from "../types/Sim";
import { SIM_LIMITS } from "../constants/SimConstants";

export class SimulationEngine {
    private s: SimState

    constructor(state: SimState) {
        this.s = state;
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

    updateVelocities(): void {
        const s = this.s
        for (let i = 0; i < s.numParticles; i++) {
        let totalForceX = 0, totalForceY = 0, totalForceZ = 0;

        for (let j = 0; j < s.numParticles; j++) {
            if (j === i) continue;

            let rx = s.positionsX[j] - s.positionsX[i];
            let ry = s.positionsY[j] - s.positionsY[i];
            let rz = s.positionsZ[j] - s.positionsZ[i];

            if (rx > 0.5) rx -= 1.0; else if (rx < -0.5) rx += 1.0;
            if (ry > 0.5) ry -= 1.0; else if (ry < -0.5) ry += 1.0;
            if (rz > 0.5) rz -= 1.0; else if (rz < -0.5) rz += 1.0;

            const r = Math.sqrt(rx * rx + ry * ry + rz * rz);

            if (r > 0 && r < s.rMax) {
            const f = this.force(
                r / s.rMax, s.attractionCoefficientMatrix[s.particleKinds * s.colors[i] + s.colors[j]], 
                s.betaCoefficientMatrix[s.particleKinds * s.colors[i] + s.colors[j]]
            );
            const invR = f / r;
            totalForceX += rx * invR;
            totalForceY += ry * invR;
            totalForceZ += rz * invR;
            }
        }

        totalForceX *= s.rMax * s.forceFactor;
        totalForceY *= s.rMax * s.forceFactor;
        totalForceZ *= s.rMax * s.forceFactor;

        s.velocitiesX[i] = (s.velocitiesX[i] * s.frictionFactor) + (totalForceX * s.timeStep);
        s.velocitiesY[i] = (s.velocitiesY[i] * s.frictionFactor) + (totalForceY * s.timeStep);
        s.velocitiesZ[i] = (s.velocitiesZ[i] * s.frictionFactor) + (totalForceZ * s.timeStep);
        }
    };

    force(r: number, a: number, beta: number) {
        if (r < beta) return r / beta - 1;
        else if (beta < r && r < 1) return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta));
        return 0;
    }
}