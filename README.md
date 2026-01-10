# Particle Life 3D

A high-performance 3D particle life simulation built with React and TypeScript. This project simulates emergent behaviors through simple attraction and repulsion rules between different species of particles. Initial concept from this [video](https://www.youtube.com/watch?v=scvuli-zcRc) by [Tom Mohr](https://www.youtube.com/@tom-mohr)

## Technical Overview: Spatial Partitioning

To maintain a high frame rate with thousands of particles, the engine utilizes a Uniform Grid Partitioning system.

In a naive simulation, every particle must check the distance to every other particle, resulting in a complexity of O(n²). As particle counts increase, this becomes computationally difficult for CPUs.
The spatial partitioning system doesn't necessarily reduce the complexity to O(n) as the computations within grid cells are still of O(n²). Rather it just drastically reduces n in cases where there is a small rMax and a sparse distribution of particles.
This results in a dynamic performance where a simulation with many small cells will run better than a simulation with one large cell if both have the same particle counts.

### How it Works

1. Grid Voxelization: The 3D space is divided into a grid of voxels (cells). The size of each cell is set to match the maximum interaction radius (rMax).
2. Flat Array Mapping: Rather than using complex nested objects, the grid is stored as a 1D Int32Array.
3. Linked-List Chains: A "Head" array stores the index of the first particle in a cell, while a "Next" array allows the engine to iterate through all particles in that specific cell.
4. Local Lookups: When calculating forces for a particle, the engine only checks its current cell and the 26 immediate neighboring cells.
5. Periodic Wraparound: The grid logic accounts for toroidal space, meaning particles that exit one side of the grid immediately interact with particles on the opposite side.

---

## User Interface and Controls

The Control Panel provides real-time manipulation of the simulation physics and environment. It contains a 2D/3D toggle which will snap particles to a plane perpendicular to the z axis when in 2D mode.

### Simulation Environment

- Shake: Injects random velocities into all particles. This is useful for breaking up static clusters or unfreezing a simulation that has reached a low-energy state.
- Time Step: Adjusts the time delta of the simulation. Increasing this makes the simulation run faster at a tradeoff of structures becoming less stable.
- Particle Kinds: Adjusts the number of unique species in the simulation. Increasing this adds more complexity to the interaction matrices.
- Total Particles: Controls the density of the simulation. Higher counts lead to more complex emergent structures but increase the computational load on the spatial partitioner.

### Physics Parameters

- Force Factor: A global multiplier for the magnitude of interactions. High values result in violent, high-energy movement, while low values allow for delicate, stable formations.
- Radius (rMax): Defines the maximum distance at which two particles can see or influence each other. This directly dictates the resolution of the spatial partitioning grid.
- Friction Half-Life: Determines how quickly particles lose velocity. A lower half-life creates a syrupy environment where motion stops quickly, while a higher half-life allows for orbital behaviors and momentum.

### Interaction Matrices

The simulation uses two primary matrices to define the relationship between particle types:

1. Attraction Coefficients:
   - Defines the pull or push between species.
   - Green cells indicate attraction, while red cells indicate repulsion.
   - Adjusting these values creates the DNA of your simulation, dictating whether species hunt, flock, or avoid one another.

2. Repulsion Coefficients (Beta):
   - Sets the threshold for close-range repulsion.
   - This ensures particles do not collapse into a single point, acting as a physical buffer or body size for the particles.

---

## Project Setup

To run this project locally, ensure you have Node.js installed.

```bash
npm install
npm run dev
```

---

## Implementation Details

The core engine is decoupled from the React UI. The SimulationEngine handles the heavy lifting, while React manages the state of the control panel and the canvas lifecycle.

```typescript
// The engine utilizes TypedArrays for memory efficiency
this.positionsX = new Float32Array(MAX_PARTICLES);
this.velocitiesX = new Float32Array(MAX_PARTICLES);
```
