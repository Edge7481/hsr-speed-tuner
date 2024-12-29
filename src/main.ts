import './style.css'

// Constants
export const AV_MULTIPLIER = 100
export const TARGET_RESULT = 150; // Target result for the equation
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

  return (14+superimpose*2)*timesProcd*AV_MULTIPLIER;
}
/**
 * Adjusts the result based on vonwacq? status.
 * @param isVonwacq - Boolean indicating whether vonwacq? is true
 * @returns Adjustment value
 */
export function applyVonwacqAdjustment(isVonwacq: boolean): number {
  return isVonwacq ? 40*AV_MULTIPLIER : 0;
}

export function calculateEagleAdjustment(timesProcd: number): number {
  if (timesProcd < 0) {
    throw new Error("Times Procced cannot be negative.");
  }
  
  return 25 * AV_MULTIPLIER * timesProcd; // Eagle calculation
}


/// Elements
const actionsInput = document.getElementById("actions") as HTMLInputElement;
const vonwacqCheckbox = document.getElementById("vonwacq") as HTMLInputElement;
const eagleTimesProcdInput = document.getElementById("eagle-times-procd") as HTMLInputElement;
const targetResultInput = document.getElementById("target-result") as HTMLInputElement; // New input field for custom TARGET_RESULT
const dddModules = document.querySelectorAll(".ddd-module") as NodeListOf<HTMLElement>;
const calculateButton = document.getElementById("calculate") as HTMLButtonElement;
const resultDisplay = document.getElementById("result") as HTMLElement;
const customAAInput = document.getElementById("custom-aa") as HTMLInputElement;


function calculate() {
  const actions = parseFloat(actionsInput.value) || 0;
  const isVonwacq = vonwacqCheckbox.checked;

  // Get the custom TARGET_RESULT from the input field
  const customTargetResult = parseFloat(targetResultInput.value) || TARGET_RESULT; // Default to 150 if invalid
  // Get the custom AA value from the input field
  const customAAResult = parseFloat(customAAInput.value) * AV_MULTIPLIER || 0;

  // Calculate DDD results
  const dddResults: number[] = Array.from(dddModules).map((module) => {
    const superimposeInput = module.querySelector(".superimpose") as HTMLInputElement;
    const timesProcdInput = module.querySelector(".times-procd") as HTMLInputElement;

    const superimposeValue = parseFloat(superimposeInput.value) || 0;
    const timesProcdValue = parseFloat(timesProcdInput.value) || 0;

    // Only add DDD result if the values are filled correctly
    if (superimposeValue >= 1 && superimposeValue <= 5 && timesProcdValue > 0) {
      return calculateDDD(superimposeValue, timesProcdValue);
    }
    return 0; // Exclude empty or invalid DDD values
  }).filter((result) => result > 0); // Remove any zero results

  // Calculate Eagle result
  let eagleResult = 0;
  const eagleTimesProcd = parseFloat(eagleTimesProcdInput.value) || 0;
  if (eagleTimesProcd > 0) {
    eagleResult = calculateEagleAdjustment(eagleTimesProcd);
  }

  try {
    const vonwacqAdjustment = applyVonwacqAdjustment(isVonwacq);
    const totalDDD = dddResults.reduce((sum, ddd) => sum + ddd, 0);
    const numerator = actions * 10000 - totalDDD - eagleResult - vonwacqAdjustment - customAAResult; // Return the numerator
    const spd = numerator / customTargetResult; // Use custom TARGET_RESULT for SPD calculation

    resultDisplay.textContent = spd.toFixed(2);
  } catch (error: unknown) {
    if (error instanceof Error) {
      resultDisplay.textContent = "Error: " + error.message;
    } else {
      resultDisplay.textContent = "An unknown error occurred";
    }
  }
}

// Event Listener
calculateButton.addEventListener("click", calculate);