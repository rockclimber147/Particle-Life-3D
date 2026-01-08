import { useEffect, useRef } from 'react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const numParticles = 1000;
  const timeStep = 0.01;
  const frictionHalfLife = 0.080;
  const frictionFactor = Math.pow(0.5, timeStep / frictionHalfLife)
  const forceFactor = 10;
  const rMax = 0.4;
  const m = 5;

  const sim = useRef({
    colors: new Int32Array(numParticles),
    positionsX: new Float32Array(numParticles),
    positionsY: new Float32Array(numParticles),
    positionsZ: new Float32Array(numParticles),
    velocitiesX: new Float32Array(numParticles),
    velocitiesY: new Float32Array(numParticles),
    velocitiesZ: new Float32Array(numParticles),
    matrix: makeRandomMatrix()
  });


  function makeRandomMatrix(): number[][] {
    const rows: number[][] = [];
    for (let i = 0; i < m; i++) {
      const row: number [] = [];
      for (let j = 0; j < m; j++) {
        row.push(Math.random() * 2 - 1);
      }
      rows.push(row)
    }
    return rows;
  }

  const resetParticles = () => {
    const s = sim.current
    for (let i = 0; i < numParticles; i++) {
      s.colors[i] = Math.floor(Math.random() * m)
      s.positionsX[i] = Math.random();
      s.positionsY[i] = Math.random();
      s.positionsZ[i] = Math.random();
      s.velocitiesX[i] = 0;
      s.velocitiesY[i] = 0;
      s.velocitiesZ[i] = 0;
    }
  }

  const resetMatrix = () => {
    sim.current.matrix = makeRandomMatrix();
  }

  const updatePositions = () => {
    const s = sim.current
    for (let i = 0; i < numParticles; i++) {
      s.positionsX[i] += s.velocitiesX[i] * timeStep;
      s.positionsY[i] += s.velocitiesY[i] * timeStep;
      s.positionsZ[i] += s.velocitiesZ[i] * timeStep;

      s.positionsX[i] = ((s.positionsX[i] % 1) + 1) % 1;
      s.positionsY[i] = ((s.positionsY[i] % 1) + 1) % 1;
      s.positionsZ[i] = ((s.positionsZ[i] % 1) + 1) % 1;
    }
  }

  const updateVelocities = () => {
    const s = sim.current
    for (let i = 0; i < numParticles; i++) {
      let totalForceX = 0;
      let totalForceY = 0;
      let totalForceZ = 0;

      for (let j = 0; j < numParticles; j++) {
        if (j === i) continue;

        let rx = s.positionsX[j] - s.positionsX[i];
        let ry = s.positionsY[j] - s.positionsY[i];
        let rz = s.positionsZ[j] - s.positionsZ[i];

        if (rx > 0.5) rx -= 1.0;
        else if (rx < -0.5) rx += 1.0;

        if (ry > 0.5) ry -= 1.0;
        else if (ry < -0.5) ry += 1.0;

        if (rz > 0.5) rz -= 1.0;
        else if (rz < -0.5) rz += 1.0;

        const r = Math.sqrt(rx * rx + ry * ry + rz * rz);

        if (r > 0 && r < rMax) {
          const f = force(r / rMax, s.matrix[s.colors[i]][s.colors[j]]);
          
          totalForceX += (rx / r) * f;
          totalForceY += (ry / r) * f;
          totalForceZ += (rz / r) * f;
        }
      }

      totalForceX *= rMax * forceFactor;
      totalForceY *= rMax * forceFactor;
      totalForceZ *= rMax * forceFactor;

      s.velocitiesX[i] *= frictionFactor;
      s.velocitiesY[i] *= frictionFactor;
      s.velocitiesZ[i] *= frictionFactor;

      s.velocitiesX[i] += totalForceX * timeStep;
      s.velocitiesY[i] += totalForceY * timeStep;
      s.velocitiesZ[i] += totalForceZ * timeStep;
    }
  }

  function force(r: number, a: number) {
    const beta = 0.3;
    if (r < beta) return r / beta - 1;
    else if (beta < r && r < 1) return a * (1-Math.abs(2 * r - 1 - beta) / (1 - beta));
    return 0;
  }


  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const s = sim.current
    let animationFrameId: number;

    const animate = () => {
      updateVelocities();
      updatePositions();

      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numParticles; i++) {
        const pX = s.positionsX[i] - 0.5;
        const pY = s.positionsY[i] - 0.5;
        const pZ = s.positionsZ[i] - 0.5;

        const f = 1 / (pZ + 3);
        const screenX = (pX * f * 3 + 0.5) * canvas.width;
        const screenY = (pY * f * 3 + 0.5) * canvas.height;
        const radius = f * 3; 

        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${360 * (s.colors[i] / m)}, 100%, 50%)`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
  <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
    {/* Sidebar UI */}
    <div style={{ 
      position: 'absolute', top: 10, left: 10, zIndex: 10,
      background: 'rgba(0,0,0,0.7)', padding: '15px', borderRadius: '8px',
      color: 'white', display: 'flex', flexDirection: 'column', gap: '10px' 
    }}>
      <h3 style={{ margin: 0 }}>Controls</h3>
      <button onClick={resetParticles}>Reset Particles</button>
      <button onClick={resetMatrix}>Randomize Rules</button>
    </div>

    {/* The Canvas */}
    <canvas 
      ref={canvasRef} 
      style={{ display: 'block' }}
    />
  </div>
);
}