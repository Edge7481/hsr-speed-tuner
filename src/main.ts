import './style.css';
import { calculateSPD, AV_MULTIPLIER } from './util'; // Import the calculation logic

function loadParametersFromURL() {
  const urlParams = new URLSearchParams(window.location.search);

  actionsInput.value = urlParams.get("actions") || "3";
  vonwacqCheckbox.checked = urlParams.get("vonwacq") === "true";
  eagleTimesProcdInput.value = urlParams.get("eagle") || "";
  targetResultInput.value = urlParams.get("target") || "150";
  customAAInput.value = urlParams.get("customAA") || "";

  dddModules.forEach((module, index) => {
    const superimposeInput = module.querySelector(".s") as HTMLInputElement;
    const timesProcdInput = module.querySelector(".x") as HTMLInputElement;

    superimposeInput.value = urlParams.get(`s${index + 1}`) || "";
    timesProcdInput.value = urlParams.get(`x${index + 1}`) || "";
  });
}

/// Elements
const actionsInput = document.getElementById("actions") as HTMLInputElement;
const vonwacqCheckbox = document.getElementById("vonwacq") as HTMLInputElement;
const eagleTimesProcdInput = document.getElementById("eagle-times-procd") as HTMLInputElement;
const targetResultInput = document.getElementById("target-result") as HTMLInputElement; 
const dddModules = document.querySelectorAll(".ddd-module") as NodeListOf<HTMLElement>;
const calculateButton = document.getElementById("calculate") as HTMLButtonElement;
const resultDisplay = document.getElementById("result") as HTMLElement;
const customAAInput = document.getElementById("custom-aa") as HTMLInputElement;

function calculate() {
  const actions = parseFloat(actionsInput.value) || 3;
  const isVonwacq = vonwacqCheckbox.checked;
  const customTargetResult = parseFloat(targetResultInput.value) || 150; 
  const customAAResult = parseFloat(customAAInput.value) * AV_MULTIPLIER || 0;

  const urlParams: Record<string, string> = {};
  
  if (actions !== 3) urlParams.actions = actions.toString();
  if (isVonwacq) urlParams.vonwacq = "true";
  if (customTargetResult !== 150) urlParams.target = customTargetResult.toString();
  if (customAAResult !== 0) urlParams.customAA = (customAAInput.value || "").toString();

  Array.from(dddModules).forEach((module, index) => {
    const superimposeInput = module.querySelector(".s") as HTMLInputElement;
    const timesProcdInput = module.querySelector(".x") as HTMLInputElement;

    const superimposeValue = parseFloat(superimposeInput.value) || 0;
    const timesProcdValue = parseFloat(timesProcdInput.value) || 0;

    if (superimposeValue !== 0) urlParams[`s${index + 1}`] = superimposeValue.toString();
    if (timesProcdValue !== 0) urlParams[`x${index + 1}`] = timesProcdValue.toString();
  });

  const eagleTimesProcd = parseFloat(eagleTimesProcdInput.value) || 0;
  if (eagleTimesProcd > 0) urlParams.eagle = eagleTimesProcd.toString();

  const newUrl = `${window.location.pathname}?${new URLSearchParams(urlParams).toString()}`;
  window.history.replaceState({}, "", newUrl);

  try {
    // Use the imported `calculateSPD` function for the calculation
    const spd = calculateSPD(
      actions,
      isVonwacq,
      customTargetResult,
      customAAResult,
      Array.from(dddModules),
      eagleTimesProcd
    );

    resultDisplay.textContent = spd.toFixed(2);
  } catch (error: unknown) {
    if (error instanceof Error) {
      resultDisplay.textContent = "Error: " + error.message;
    } else {
      resultDisplay.textContent = "An unknown error occurred";
    }
  }
}

loadParametersFromURL();
calculateButton.addEventListener("click", calculate);
