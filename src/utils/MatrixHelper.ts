export function to2DMatrix(
  linearMatrix: Float32Array,
  size: number,
): number[][] {
  if (linearMatrix.length !== size * size) throw Error("linear/size mismatch");

  const matrix: number[][] = [];
  for (let i = 0; i < size; i++) {
    matrix.push(Array.from(linearMatrix.subarray(i * size, (i + 1) * size)));
  }
  return matrix;
}

export function initializeRandomMatrix(
  size: number,
  min: number,
  max: number,
  step?: number,
): Float32Array {
  const array: Float32Array = new Float32Array(size * size);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let val = Math.random() * (max - min) + min;
      if (step) val = Math.round(val / step) * step;
      array[i * size + j] = val;
    }
  }
  return array;
}

export function initializeExactMatrix(size: number, val: number): Float32Array {
  const array = new Float32Array(size * size);
  array.fill(val);
  return array;
}

export function randomizeInPlace(
  matrix: Float32Array,
  min: number,
  max: number,
  step: number,
) {
  for (let i = 0; i < matrix.length; i++) {
    let val = Math.random() * (max - min) + min;
    val = Math.round(val / step) * step;
    matrix[i] = val;
  }
}
