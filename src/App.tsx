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
  const matrix: number[][] = makeRandomMatrix()

  const colors = new Int32Array(numParticles);
  const positionsX = new Float32Array(numParticles)
  const positionsY = new Float32Array(numParticles)
  const positionsZ = new Float32Array(numParticles)
  const velocitiesX = new Float32Array(numParticles)
  const velocitiesY = new Float32Array(numParticles)
  const velocitiesZ = new Float32Array(numParticles)
  initializeVelocitiesAndColors();


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

  function initializeVelocitiesAndColors() {
    for (let i = 0; i < numParticles; i++) {
      colors[i] = Math.floor(Math.random() * m)
      positionsX[i] = Math.random();
      positionsY[i] = Math.random();
      positionsZ[i] = Math.random();
      velocitiesX[i] = 0;
      velocitiesY[i] = 0;
      velocitiesZ[i] = 0;
    }
  }

  function updatePositions() {
    for (let i = 0; i < numParticles; i++) {
      positionsX[i] += velocitiesX[i] * timeStep;
      positionsY[i] += velocitiesY[i] * timeStep;
      positionsZ[i] += velocitiesZ[i] * timeStep;

      positionsX[i] = ((positionsX[i] % 1) + 1) % 1;
      positionsY[i] = ((positionsY[i] % 1) + 1) % 1;
      positionsZ[i] = ((positionsZ[i] % 1) + 1) % 1;
    }
  }

  function updateVelocities() {
    for (let i = 0; i < numParticles; i++) {
      let totalForceX = 0;
      let totalForceY = 0;
      let totalForceZ = 0;

      for (let j = 0; j < numParticles; j++) {
        if (j === i) continue;

        let rx = positionsX[j] - positionsX[i];
        let ry = positionsY[j] - positionsY[i];
        let rz = positionsZ[j] - positionsZ[i];

        if (rx > 0.5) rx -= 1.0;
        else if (rx < -0.5) rx += 1.0;

        if (ry > 0.5) ry -= 1.0;
        else if (ry < -0.5) ry += 1.0;

        if (rz > 0.5) rz -= 1.0;
        else if (rz < -0.5) rz += 1.0;

        const r = Math.sqrt(rx * rx + ry * ry + rz * rz);

        if (r > 0 && r < rMax) {
          const f = force(r / rMax, matrix[colors[i]][colors[j]]);
          
          totalForceX += (rx / r) * f;
          totalForceY += (ry / r) * f;
          totalForceZ += (rz / r) * f;
        }
      }

      totalForceX *= rMax * forceFactor;
      totalForceY *= rMax * forceFactor;
      totalForceZ *= rMax * forceFactor;

      velocitiesX[i] *= frictionFactor;
      velocitiesY[i] *= frictionFactor;
      velocitiesZ[i] *= frictionFactor;

      velocitiesX[i] += totalForceX * timeStep;
      velocitiesY[i] += totalForceY * timeStep;
      velocitiesZ[i] += totalForceZ * timeStep;
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
        const pX = positionsX[i] - 0.5;
        const pY = positionsY[i] - 0.5;
        const pZ = positionsZ[i] - 0.5;

        const f = 1 / (pZ + 3);
        const screenX = (pX * f * 3 + 0.5) * canvas.width;
        const screenY = (pY * f * 3 + 0.5) * canvas.height;
        const radius = f * 3; 

        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${360 * (colors[i] / m)}, 100%, 50%)`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />;
}