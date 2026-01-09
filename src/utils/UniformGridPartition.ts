import { SIM_LIMITS } from "../constants/SimConstants";
import type { SimState } from "../types/Sim";

type Neighbor = {
    cellIdxOffset: number;
    offsetX: number;
    offsetY: number;
    offsetZ: number;
};

export class UniormGridPartition {
    head: Int32Array
    next: Int32Array
    numDivisions: number = 0;
    totalCells: number = 0;
    neighborTable: Neighbor[] = [];

    constructor() {
        const maxCells = Math.pow(Math.floor(1.0 / SIM_LIMITS.MIN_RMAX), 3);
        this.head = new Int32Array(maxCells);
        this.next = new Int32Array(SIM_LIMITS.MAX_PARTICLES);
    }

    clear() {
        this.head.fill(-1, 0, this.totalCells);
    }

    setResolution(rMax: number) {
        this.numDivisions = Math.floor(1.0 / rMax);
        this.totalCells = Math.pow(this.numDivisions, 3);
        if (this.numDivisions < 1) this.numDivisions = 1;

        this.neighborTable = [];

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    this.neighborTable.push({
                        cellIdxOffset: 0,
                        offsetX: dx,
                        offsetY: dy,
                        offsetZ: dz
                    });
                }
            }
        }
    }

    rebuild(s: SimState) {
        this.clear()

        for (let i = 0; i < s.numParticles; i++) {
            const gx = Math.min(Math.floor(s.positionsX[i] * this.numDivisions), this.numDivisions - 1);
            const gy = Math.min(Math.floor(s.positionsY[i] * this.numDivisions), this.numDivisions - 1);
            const gz = Math.min(Math.floor(s.positionsZ[i] * this.numDivisions), this.numDivisions - 1);

            const cellIdx = gx + (gy * this.numDivisions) + (gz * this.numDivisions * this.numDivisions);

            this.next[i] = this.head[cellIdx];
            
            this.head[cellIdx] = i;
        }
    }

    getNeighborData(gx: number, gy: number, gz: number, dx: number, dy: number, dz: number) {
        const N = this.numDivisions;

        const nx = (gx + dx + N) % N;
        const ny = (gy + dy + N) % N;
        const nz = (gz + dz + N) % N;

        return {
            cellIdx: nx + (ny * N) + (nz * N * N),
            ox: (gx + dx < 0) ? -1.0 : (gx + dx >= N) ? 1.0 : 0.0,
            oy: (gy + dy < 0) ? -1.0 : (gy + dy >= N) ? 1.0 : 0.0,
            oz: (gz + dz < 0) ? -1.0 : (gz + dz >= N) ? 1.0 : 0.0,
        };
    }
}