import { describe, it, expect } from 'vitest';
import { calculateSPD, AV_MULTIPLIER } from '../../src/util'; // Adjust the import path as needed

// Mocking DOM elements and the necessary inputs
global.document.getElementById = (id: string) => {
  if (id === 'actions') return { value: '3' } as HTMLInputElement;
  if (id === 'vonwacq') return { checked: false } as HTMLInputElement;
  if (id === 'target-result') return { value: '150' } as HTMLInputElement;
  if (id === 'custom-aa') return { value: '0' } as HTMLInputElement;
  if (id === 'eagle-times-procd') return { value: '0' } as HTMLInputElement;
  return null;
};

describe('SPD result', () => {
  it('should require 200 for 3 actions in 150AV', () => {
    const dddModules = [];
    const actions = 3;
    const isVonwacq = false;
    const customTargetResult = 150;
    const customAAResult = 0;
    const eagleTimesProcd = 0;

    // Calculate SPD using the imported function
    const spd = calculateSPD(
      actions,
      isVonwacq,
      customTargetResult,
      customAAResult,
      dddModules,
      eagleTimesProcd
    );

    // Assert that the SPD value is equal to 200
    expect(spd).toBe(200);
  });
  it('should require 156.67 for eagle and vonwacq', () => {
    const dddModules = [];
    const actions = 3;
    const isVonwacq = true; // Vonwacq is true
    const customTargetResult = 150;
    const customAAResult = 0;
    const eagleTimesProcd = 1; // Eagle x1

    // Calculate SPD using the imported function
    const spd = calculateSPD(
      actions,
      isVonwacq,
      customTargetResult,
      customAAResult,
      dddModules,
      eagleTimesProcd
    );

    // Assert that the SPD value is equal to 156.67
    expect(spd).toBeCloseTo(156.67, 2); // Allowing for slight floating-point precision
  });

  it('should require 167.33 for s5 DDD x1 and eagle x1', () => {
    const dddModules = [
      {
        querySelector: (selector: string) => {
          if (selector === '.s') {
            return { value: '5' }; // superimpose: 5
          } else if (selector === '.x') {
            return { value: '1' }; // timesProcd: 1
          }
          return null;
        },
      } as HTMLElement,
    ];
    const actions = 3;
    const isVonwacq = false;
    const customTargetResult = 150;
    const customAAResult = 0;
    const eagleTimesProcd = 1; // Eagle x1

    // Calculate SPD using the imported function
    const spd = calculateSPD(
      actions,
      isVonwacq,
      customTargetResult,
      customAAResult,
      dddModules,
      eagleTimesProcd
    );

    // Assert that the SPD value is equal to 167.33
    expect(spd).toBeCloseTo(167.33, 2); // Allowing for slight floating-point precision
  });

  it('should require 135 for 2 actions eagle x2 in 111.11 AV (Robin ult)', () => {
    const dddModules = [];
    const actions = 2;
    const isVonwacq = false;
    const customTargetResult = 111.11; // Robin ult AV value
    const customAAResult = 0;
    const eagleTimesProcd = 2; // Eagle x2

    // Calculate SPD using the imported function
    const spd = calculateSPD(
      actions,
      isVonwacq,
      customTargetResult,
      customAAResult,
      dddModules,
      eagleTimesProcd
    );

    // Assert that the SPD value is equal to 135
    expect(spd).toBeCloseTo(135);
  });

  it('should require 226.8 for 4 actions s3ddd x3, and s1 ddd x1, in 142.86 AV (ff ult)', () => {
    const dddModules = [
      {
        querySelector: (selector: string) => {
          if (selector === '.s') {
            return { value: '3' }; // superimpose: 3
          } else if (selector === '.x') {
            return { value: '3' }; // timesProcd: 3
          }
          return null;
        },
      } as HTMLElement,
      {
        querySelector: (selector: string) => {
          if (selector === '.s') {
            return { value: '1' }; // superimpose: 1
          } else if (selector === '.x') {
            return { value: '1' }; // timesProcd: 1
          }
          return null;
        },
      } as HTMLElement,
    ];
    const actions = 4;
    const isVonwacq = false;
    const customTargetResult = 142.86; // FF ult AV value
    const customAAResult = 0;
    const eagleTimesProcd = 0;

    // Calculate SPD using the imported function
    const spd = calculateSPD(
      actions,
      isVonwacq,
      customTargetResult,
      customAAResult,
      dddModules,
      eagleTimesProcd
    );

    // Assert that the SPD value is equal to 226.8
    expect(spd).toBeCloseTo(226.8, 2); // Allowing for slight floating-point precision
  });
  
});