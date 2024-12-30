import React, { useState } from 'react';
import { Actor, ActionTimeline } from './Timeline';

const TimelineVisualizer: React.FC = () => {
  const [actorData, setActorData] = useState([
    { name: 'Actor 1', baseSPD: 100 },
    { name: 'Actor 2', baseSPD: 134 },
    // { name: 'Actor 3', baseSPD: 100 },
    // { name: 'Actor 4', baseSPD: 100 },
  ]);
  const [totalAV, setTotalAV] = useState<number>(150); // Default total AV
  const [actionBlocks, setActionBlocks] = useState<{ actor: string; actionAV: number }[]>([]);

  const handleActorChange = (index: number, field: string, value: string) => {
    const updatedActorData = [...actorData];
    updatedActorData[index][field as keyof typeof actorData[0]] = field === 'baseSPD' ? Number(value) : value;
    setActorData(updatedActorData);
  };

  const addActor = () => {
    setActorData([...actorData, { name: '', baseSPD: 100 }]);
  };

  const handleTotalAVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value > 0) {
      setTotalAV(value);
    }
  };

  const simulateTimeline = () => {
    const actors = actorData.map(data => new Actor(data.name, data.baseSPD));
    const actionTimeline = new ActionTimeline(actors, totalAV);
    const timelineLogs = actionTimeline.simulateTurn();

    // Use the logs directly as the action blocks
    setActionBlocks(timelineLogs);
  };

  return (
    <div className="container">
      {/* Left Pane */}
      <div className="left-pane">
        <h2>Actor Configuration</h2>
        {actorData.map((actor, index) => (
          <div key={index} className="actor-block">
            <label htmlFor={`actor-name-${index}`}>Name:</label>
            <input
              type="text"
              id={`actor-name-${index}`}
              value={actor.name}
              onChange={(e) => handleActorChange(index, 'name', e.target.value)}
              placeholder="Actor Name"
            />
            <label htmlFor={`actor-spd-${index}`}>Base SPD:</label>
            <input
              type="number"
              id={`actor-spd-${index}`}
              value={actor.baseSPD}
              onChange={(e) => handleActorChange(index, 'baseSPD', e.target.value)}
              placeholder="Base SPD"
              min="1"
            />
          </div>
        ))}
        <button onClick={addActor}>Add Actor</button>

        <div className="total-av-box">
          <label htmlFor="total-av">Total AV:</label>
          <input
            type="number"
            id="total-av"
            value={totalAV}
            onChange={handleTotalAVChange}
            placeholder="Total Elapsed AV"
            min="1"
          />
        </div>
        <button onClick={simulateTimeline}>Simulate Timeline</button>
      </div>

      {/* Right Pane */}
      <div className="right-pane">
        <h2>Action Timeline</h2>
        <div className="action-blocks">
          {actionBlocks.map((log, index) => (
            <div key={index} className="action-block">
              <p>
                <strong>{log.actor}</strong> acted at AV {log.actionAV.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineVisualizer;
