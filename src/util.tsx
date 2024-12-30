// Constants
export const AV_MULTIPLIER = 100;

/**
 * Calculates the DDD result based on given inputs.
 * @param superimpose - Value between 1 and 5
 * @param timesProcd - Number of times procced
 * @returns Calculated DDD result
 */
export function calculateDDD(superimpose: number, timesProcd: number): number {
  if (superimpose < 1 || superimpose > 5) {
    throw new Error("Superimpose value must be between 1 and 5.");
  }

  return (14 + superimpose * 2) * timesProcd * AV_MULTIPLIER;
}

/**
 * Adjusts the result based on vonwacq? status.
 * @param isVonwacq - Boolean indicating whether vonwacq? is true
 * @returns Adjustment value
 */
export function applyVonwacqAdjustment(isVonwacq: boolean): number {
  return isVonwacq ? 40 * AV_MULTIPLIER : 0;
}

export function calculateEagleAdjustment(timesProcd: number): number {
  if (timesProcd < 0) {
    throw new Error("Times Procced cannot be negative.");
  }

  return 25 * AV_MULTIPLIER * timesProcd; // Eagle calculation
}

/**
 * Performs the SPD calculation.
 * @param actions - Number of actions
 * @param isVonwacq - Whether vonwacq is active
 * @param customTargetResult - Target result for the calculation
 * @param customAAResult - Custom AA result adjustment
 * @param dddModules - The DDD modules (containing superimpose and timesProcd values)
 * @param eagleTimesProcd - Times procced for Eagle
 * @returns Calculated SPD result
 */
export function calculateSPD(
  actions: number,
  isVonwacq: boolean,
  customTargetResult: number,
  customAAResult: number,
  dddModules: { superimpose: number; timesProcd: number }[],
  eagleTimesProcd: number
): number {
  const vonwacqAdjustment = applyVonwacqAdjustment(isVonwacq);
  const eagleAdjustment = calculateEagleAdjustment(eagleTimesProcd);
  
  const dddResults = dddModules
    .map(({ superimpose, timesProcd }) => {
      if (superimpose >= 1 && superimpose <= 5 && timesProcd > 0) {
        return calculateDDD(superimpose, timesProcd);
      }
      return 0;
    })
    .filter((result) => result > 0); // Remove any zero results

  const totalDDD = dddResults.reduce((sum, ddd) => sum + ddd, 0);
  const numerator = actions * 10000 - totalDDD - eagleAdjustment - vonwacqAdjustment - customAAResult;
  return numerator / customTargetResult;
}
