import { useEffect, useRef, useState, useMemo } from "react";
import ControlPanel from "../components/ControlPanel";
import type { SimState } from "../types/Sim";
import { SIM_LIMITS } from "../constants/SimConstants";
import {
  initializeExactMatrix,
  initializeRandomMatrix,
} from "../utils/MatrixHelper";
import { SimulationEngine } from "../utils/SimulationEngine";

export default function ParticleLifeSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [is2DUI, setIs2DUI] = useState(false);
  const [configKey, setConfigKey] = useState(0);

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
    timeStep: timeStep,
    rMax: defaultRMax,
    colors: new Int32Array(maxNumParticles),
    positionsX: new Float32Array(maxNumParticles),
    positionsY: new Float32Array(maxNumParticles),
    positionsZ: new Float32Array(maxNumParticles),
    velocitiesX: new Float32Array(maxNumParticles),
    velocitiesY: new Float32Array(maxNumParticles),
    velocitiesZ: new Float32Array(maxNumParticles),
    attractionCoefficientMatrix: initializeRandomMatrix(
      defaultParticleKinds,
      -1,
      1,
      0.1,
    ),
    betaCoefficientMatrix: initializeExactMatrix(
      defaultParticleKinds,
      SIM_LIMITS.DEFAULT_BETA,
    ),
  });

  const engine = useMemo(() => new SimulationEngine(sim.current), []);

  useEffect(() => {
    engine.resetParticles();

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animationFrameId: number;

    const animate = () => {
      engine.updateVelocities();
      engine.updatePositions();

      const edgeLength = Math.min(window.innerWidth, window.innerHeight);
      if (canvas.width !== edgeLength) {
        canvas.width = edgeLength;
        canvas.height = edgeLength;
      }

      ctx.fillStyle = "black";
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

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Control Panel Container */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          background: "rgba(20, 20, 20, 0.85)",
          padding: "15px",
          borderRadius: "8px",
          color: "white",
          display: "flex",
          flexDirection: "column",
          width: "280px",
          fontFamily: "sans-serif",
          fontSize: "14px",
          maxHeight: "calc(100vh - 40px)",

          boxSizing: "border-box",
          overflowX: "hidden",

          boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Header Section with Toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: isCollapsed ? "0" : "15px",
            cursor: "pointer",
          }}
        >
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Particle Life 
            <button 
                onClick={() => {
                    engine.toggle3rdDimension();
                    setIs2DUI(engine.getIs2D());
                }}
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                    color: 'white',
                    padding: '2px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'monospace'
                }}
            >
                {is2DUI ? '2D' : '3D'}
            </button>
        </h3>
          <button
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "18px",
            }}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? "+" : "−"}
          </button>
        </div>

        {/* Scrollable Content Area */}
        {!isCollapsed && (
          <div
            style={{
              overflowY: "auto",
              paddingRight: "5px",
              overflowX: "hidden",
              scrollbarWidth: "thin",
              scrollbarColor: "#444 transparent",
            }}
          >
            <ControlPanel
              state={sim.current}
              actions={engine.actions}
              configKey={configKey}
              onPresetApplied={() => {
                setIs2DUI(engine.getIs2D());
                setConfigKey((k) => k + 1);
              }}
            />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
