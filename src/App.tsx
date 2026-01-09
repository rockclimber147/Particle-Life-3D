import { useEffect, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import type { SimState, SimActions } from './types/Sim';
import { SIM_LIMITS } from './constants/SimConstants';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Constants
  const maxNumParticles = SIM_LIMITS.MAX_PARTICLES;
  const defaultNumParticles = SIM_LIMITS.DEFAULT_PARTICLES;
  const timeStep = SIM_LIMITS.DEFAULT_TIME_STEP;
  const defaultFrictionHalfLife = SIM_LIMITS.DEFAULT_FRICTION_HL;
  const defaultForceFactor = SIM_LIMITS.DEFAULT_FORCE_FACTOR;
  const defaultRMax = SIM_LIMITS.DEFAULT_RMAX;
  const defaultParticleKinds = SIM_LIMITS.DEFAULT_KINDS;

  const sim = useRef<SimState>({
    numParticles: defaultNumParticles,
    particleKinds: defaultParticleKinds,
    forceFactor: defaultForceFactor,
    frictionFactor: Math.pow(0.5, timeStep / defaultFrictionHalfLife),
    rMax: defaultRMax,
    colors: new Int32Array(maxNumParticles),
    positionsX: new Float32Array(maxNumParticles),
    positionsY: new Float32Array(maxNumParticles),
    positionsZ: new Float32Array(maxNumParticles),
    velocitiesX: new Float32Array(maxNumParticles),
    velocitiesY: new Float32Array(maxNumParticles),
    velocitiesZ: new Float32Array(maxNumParticles),
    attractionCoefficientMatrix: makeRandomMatrix(defaultParticleKinds),
    betaCoefficientMatrix: initializeBetaMatrix(defaultParticleKinds, SIM_LIMITS.DEFAULT_BETA)
  });

  function makeRandomMatrix(size: number): number[][] {
    const rows: number[][] = [];
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        row.push(Math.random() * 2 - 1);
      }
      rows.push(row);
    }
    return rows;
  }

  function initializeBetaMatrix(size: number, beta: number) {
    const rows: number[][] = [];
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        row.push(beta);
      }
      rows.push(row);
    }
    return rows;
  }

  const resetParticles = () => {
    const s = sim.current;
    for (let i = 0; i < s.numParticles; i++) {
      s.colors[i] = Math.floor(Math.random() * s.particleKinds);
      s.positionsX[i] = Math.random();
      s.positionsY[i] = Math.random();
      s.positionsZ[i] = Math.random();
      s.velocitiesX[i] = 0;
      s.velocitiesY[i] = 0;
      s.velocitiesZ[i] = 0;
    }
  };

  const resetMatrices = () => {
    sim.current.attractionCoefficientMatrix = makeRandomMatrix(sim.current.particleKinds);
    sim.current.betaCoefficientMatrix = initializeBetaMatrix(sim.current.particleKinds, SIM_LIMITS.DEFAULT_BETA)
  };

  const updatePositions = () => {
    const s = sim.current;
    for (let i = 0; i < s.numParticles; i++) {
      s.positionsX[i] += s.velocitiesX[i] * timeStep;
      s.positionsY[i] += s.velocitiesY[i] * timeStep;
      s.positionsZ[i] += s.velocitiesZ[i] * timeStep;

      s.positionsX[i] = ((s.positionsX[i] % 1) + 1) % 1;
      s.positionsY[i] = ((s.positionsY[i] % 1) + 1) % 1;
      s.positionsZ[i] = ((s.positionsZ[i] % 1) + 1) % 1;
    }
  };

  const updateVelocities = () => {
    const s = sim.current;
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
          const f = force(r / s.rMax, s.attractionCoefficientMatrix[s.colors[i]][s.colors[j]], s.betaCoefficientMatrix[s.colors[i]][s.colors[j]]);
          const invR = f / r;
          totalForceX += rx * invR;
          totalForceY += ry * invR;
          totalForceZ += rz * invR;
        }
      }

      totalForceX *= s.rMax * s.forceFactor;
      totalForceY *= s.rMax * s.forceFactor;
      totalForceZ *= s.rMax * s.forceFactor;

      s.velocitiesX[i] = (s.velocitiesX[i] * s.frictionFactor) + (totalForceX * timeStep);
      s.velocitiesY[i] = (s.velocitiesY[i] * s.frictionFactor) + (totalForceY * timeStep);
      s.velocitiesZ[i] = (s.velocitiesZ[i] * s.frictionFactor) + (totalForceZ * timeStep);
    }
  };

  function force(r: number, a: number, beta: number) {
    if (r < beta) return r / beta - 1;
    else if (beta < r && r < 1) return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta));
    return 0;
  }

  useEffect(() => {
    resetParticles();
    
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let animationFrameId: number;

    const animate = () => {
      updateVelocities();
      updatePositions();

      const edgeLength = Math.min(window.innerWidth, window.innerHeight)
      canvas.width = edgeLength
      canvas.height = edgeLength

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const s = sim.current;
      for (let i = 0; i < s.numParticles; i++) {
        const pX = s.positionsX[i] - 0.5;
        const pY = s.positionsY[i] - 0.5;
        const pZ = s.positionsZ[i] - 0.5;

        const f = 1 / (pZ + 3);
        const screenX = (pX * f * 3 + 0.5) * canvas.width;
        const screenY = (pY * f * 3 + 0.5) * canvas.height;
        const radius = f * 3;

        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${360 * (s.colors[i] / s.particleKinds)}, 100%, 50%)`;
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const actions: SimActions = {
    updateParticleKinds: function (val: number): void {
      sim.current.particleKinds = val;
      resetMatrices();
      resetParticles();
    },
    updateTotalParticles: function (val: number): void {
      sim.current.numParticles = val;
      resetParticles();
    },
    updateForceFactor: function (val: number): void {
      sim.current.forceFactor = val;
    },
    updateMaxRadius: function (val: number): void {
      sim.current.rMax = val;
    },
    updateFrictionHalfLife: function (val: number): void {
      sim.current.frictionFactor = Math.pow(0.5, timeStep / val);
    },
    randomizeRules: function (): void {
      sim.current.attractionCoefficientMatrix = makeRandomMatrix(sim.current.particleKinds);
    },
    resetParticles: function (): void {
      resetParticles();
    },
    setRandomVelocities: function (): void {
      const s = sim.current;
      for (let i = 0; i < s.numParticles; i++) {
        s.velocitiesX[i] = Math.random() * 10 - 5;
        s.velocitiesY[i] = Math.random() * 10 - 5;
        s.velocitiesZ[i] = Math.random() * 10 - 5;
      }
    },
    updateMatrixValueAtCoords: function (matrix: number[][], i: number, j: number, delta: number, min: number, max: number): void {
      const newVal = Math.max(min, Math.min(max, matrix[i][j] + delta));
      matrix[i][j] = newVal;
    },
    randomizeMatrix: function (matrix: number[][], min: number, max: number, step: number): void {
      for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                const randomVal = Math.random() * (max - min) + min;
                matrix[i][j] = Math.round(randomVal / step) * step;
            }
        }
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 10, left: 10, zIndex: 10,
        background: 'rgba(0, 0, 0, 0)', padding: '20px', borderRadius: '8px',
        color: 'white', display: 'flex', flexDirection: 'column', gap: '15px',
        width: '260px', fontFamily: 'sans-serif', fontSize: '14px'
      }}>
        <h3 style={{ margin: '0 0 5px 0' }}>Particle Life 3D</h3>

        <ControlPanel
            state={sim.current} 
            actions={actions} 
        />
      </div>

      <canvas ref={canvasRef} style={{ display: 'block', background: 'black' }} />
    </div>
  );
}