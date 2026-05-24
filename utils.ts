import { EyeState, Prescription } from "./types";

/**
 * Calculates Thibos Power Vector representation for a prescription:
 * M = S + C / 2
 * J0 = -(C/2) * cos(2 * Axis)
 * J45 = -(C/2) * sin(2 * Axis)
 */
export function getPowerVectors(sphere: number, cylinder: number, axisDeg: number) {
  const rad = (axisDeg * Math.PI) / 180;
  const cHalf = cylinder / 2;
  const M = sphere + cHalf;
  const J0 = -cHalf * Math.cos(2 * rad);
  const J45 = -cHalf * Math.sin(2 * rad);
  return { M, J0, J45 };
}

/**
 * Calculates the absolute visual error and subjective metrics for an eye
 */
export function analyzeEyeRefraction(
  eye: EyeState,
  bestPrescription: Prescription,
  forceNoJcc = false
) {
  // 1. Calculate active phoropter vectors
  let lensSphere = eye.sphere;
  let lensCylinder = eye.cylinder;
  let lensAxis = eye.axis;

  // Compute base phoropter lens vectors
  let p = getPowerVectors(lensSphere, lensCylinder, lensAxis);

  // 2. If JCC is active, add the JCC vector
  if (eye.jccActive && !forceNoJcc && eye.jccFace) {
    let jccAxis = lensAxis;
    if (eye.jccMode === "axis") {
      // JCC handle is at lensAxis, flip faces are at lensAxis -45 and lensAxis +45
      jccAxis = eye.jccFace === "face1" ? lensAxis - 45 : lensAxis + 45;
    } else {
      // JCC power mode: minus axis is at lensAxis (face1) or lensAxis + 90 (face2)
      jccAxis = eye.jccFace === "face1" ? lensAxis : lensAxis + 90;
    }
    
    // JCC cross-cylinder has -0.50 D cyl and +0.25 D sphere
    const jccM = 0;
    const jccRad = (jccAxis * Math.PI) / 180;
    const jccJ0 = 0.25 * Math.cos(2 * jccRad);
    const jccJ45 = 0.25 * Math.sin(2 * jccRad);

    p.M += jccM;
    p.J0 += jccJ0;
    p.J45 += jccJ45;
  }

  // 3. Get Patient True Vectors
  const t = getPowerVectors(bestPrescription.sphere, bestPrescription.cylinder, bestPrescription.axis);

  // 4. Compute difference
  const dM = p.M - t.M;
  const dJ0 = p.J0 - t.J0;
  const dJ45 = p.J45 - t.J45;

  // Absolute visual blur B (diopters)
  const B = Math.sqrt(dM * dM + dJ0 * dJ0 + dJ45 * dJ45);

  // Compute logMAR Visual Acuity which scales with defocus B
  // Clinical rule of thumb: 1.0D error is approx 4 lines of VA loss (0.4 logMAR)
  const logMAR = -0.08 + 0.45 * B; // -0.08 is around 1.2 decimal VA
  const decimalVA = Math.pow(10, -logMAR);
  
  // Clamp decimal VA
  const clampedVA = Math.min(1.5, Math.max(0.08, decimalVA));

  // Visual blur in pixels for CSS rendering
  const blurPx = Math.max(0, B * 6.5); // scaling factor for CSS filter

  return {
    M_err: dM,
    J0_err: dJ0,
    J45_err: dJ45,
    blurPower: B,
    visualAcuity: clampedVA,
    blurPx: blurPx,
  };
}

/**
 * Normalizes an axis angle between 0 and 180 degrees
 */
export function normalizeAxis(axis: number): number {
  let val = axis % 180;
  if (val < 0) val += 180;
  return val === 0 ? 180 : val;
}

/**
 * Rounds a number to the nearest 0.25 step (common in lens diopters)
 */
export function roundTo025(val: number): number {
  return Math.round(val * 4) / 4;
}

/**
 * Round visual acuity to human-readable ophthalmic steps
 */
export function formatVA(va: number): string {
  const steps = [0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0, 1.2, 1.5];
  let closest = steps[0];
  let minDiff = Math.abs(va - steps[0]);
  for (let i = 1; i < steps.length; i++) {
    const diff = Math.abs(va - steps[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = steps[i];
    }
  }
  return closest.toFixed(2);
}
