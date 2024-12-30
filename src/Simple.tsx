// Calculate.tsx
import React, { useState, useEffect } from 'react';
import { calculateSPD, AV_MULTIPLIER } from './util';

const Simple: React.FC = () => {
  const [actions, setActions] = useState(3);
  const [vonwacq, setVonwacq] = useState(false);
  const [customAA, setCustomAA] = useState(0);
  const [targetResult, setTargetResult] = useState(150);
  const [eagleTimesProcd, setEagleTimesProcd] = useState(0);
  const [dddModules, setDddModules] = useState([
    { superimpose: 0, timesProcd: 0 },
    { superimpose: 0, timesProcd: 0 },
    { superimpose: 0, timesProcd: 0 },
    { superimpose: 0, timesProcd: 0 }
  ]);
  const [spdResult, setSpdResult] = useState<string>('N/A');

  useEffect(() => {
    // You can extract URL params if needed to initialize state here, just like before.
  }, []);

  const handleCalculate = (
    actions: number,
    vonwacq: boolean,
    targetResult: number,
    customAA: number,
    dddModules: { superimpose: number; timesProcd: number }[],
    eagleTimesProcd: number
  ) => {
    try {
      const spd = calculateSPD(
        actions,
        vonwacq,
        targetResult,
        customAA * AV_MULTIPLIER,
        dddModules,
        eagleTimesProcd
      );
      setSpdResult(spd.toFixed(2));
    } catch (error: any) {
      setSpdResult(`Error: ${error.message}`);
    }
  };

  return (
    <div id="simple">
      <h1>Extremely Crude HSR SPD Tuner</h1>
      <h4>aka how hard do I have to DDD for 5 ff actions with the spd I have</h4>

      <div className="input-row">
        <label htmlFor="target-result">AV</label>
        <input
          type="number"
          id="target-result"
          value={targetResult}
          onChange={(e) => setTargetResult(Number(e.target.value))}
          placeholder="Enter custom AV"
        />
      </div>

      <div className="input-row">
        <label htmlFor="actions">Number of Actions:</label>
        <input
          type="number"
          id="actions"
          value={actions}
          onChange={(e) => setActions(Number(e.target.value))}
          min="0"
        />
      </div>

      <div className="input-row">
        <label htmlFor="vonwacq">Vonwacq?</label>
        <input
          type="checkbox"
          id="vonwacq"
          checked={vonwacq}
          onChange={(e) => setVonwacq(e.target.checked)}
        />
      </div>

      <div className="input-row">
        <label htmlFor="custom-aa">Custom AA:</label>
        <input
          type="number"
          id="custom-aa"
          value={customAA}
          onChange={(e) => setCustomAA(Number(e.target.value))}
          placeholder="Custom AA Value"
        />
      </div>

      <div className="input-row">
        <h3>Eagle?</h3>
        <label htmlFor="eagle-times-procd">Times triggered</label>
        <input
          type="number"
          id="eagle-times-procd"
          value={eagleTimesProcd}
          onChange={(e) => setEagleTimesProcd(Number(e.target.value))}
          placeholder="Times Triggered"
        />
      </div>

      <div>
        <h3>Dance Dance Dance?</h3>
        <div className="ddd-module-grid">
          {dddModules.map((module, index) => (
            <div key={index} className="ddd-module">
              <h4>Copy {index + 1}</h4>
              <input
                type="number"
                className="s"
                value={module.superimpose}
                onChange={(e) =>
                  setDddModules((prev) =>
                    prev.map((m, idx) =>
                      idx === index ? { ...m, superimpose: Number(e.target.value) } : m
                    )
                  )
                }
                min="1"
                max="5"
                placeholder="Superimpose (1-5)"
              />
              <input
                type="number"
                className="x"
                value={module.timesProcd}
                onChange={(e) =>
                  setDddModules((prev) =>
                    prev.map((m, idx) =>
                      idx === index ? { ...m, timesProcd: Number(e.target.value) } : m
                    )
                  )
                }
                placeholder="Times Triggered"
              />
            </div>
          ))}
        </div>
      </div>

      <button id="calculate" onClick={() => handleCalculate(actions, vonwacq, targetResult, customAA, dddModules, eagleTimesProcd)}>
        Calculate
      </button>

      <h2>
        Required SPD: <span id="result">{spdResult}</span>
      </h2>
    </div>
  );
};

export default Simple;
