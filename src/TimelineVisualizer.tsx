import React, { useState } from 'react';
import { Actor, ActionTimeline, Modifier, ModifierType, ModifierHandler } from './Timeline';

const TimelineVisualizer: React.FC = () => {
  const [actorData, setActorData] = useState([
    { name: 'Actor 1', baseSPD: 100 },
    { name: 'Actor 2', baseSPD: 134 },
  ]);
  const [totalAV, setTotalAV] = useState<number>(150);
  const [actionBlocks, setActionBlocks] = useState<{ actor: string; actionAV: number; modifiers: Modifier[] }[]>([]);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);  // Store the modifier blocks (status effects)
  const [timelineModifiers, setTimelineModifiers] = useState<Modifier[]>([]);  // Modifiers placed on the timeline
  const [newModifier, setNewModifier] = useState<Modifier>({
    type: ModifierType.IN_ACTION,
    spdChange: undefined,
    actionAdvancePercent: undefined,
    expiration: 0,
    target: 'all',
    timeApplied: 0,
    name: 'new'
  });

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
    const modifierHandler = new ModifierHandler();

    // Apply all modifiers that are placed on the timeline
    timelineModifiers.forEach(mod => modifierHandler.addModifier(mod));

    const actionTimeline = new ActionTimeline(actors, totalAV, modifierHandler);
    const timelineLogs = actionTimeline.simulateTurn();

    // Add the applied modifiers to the action logs
    const actionLogsWithModifiers = timelineLogs.map(log => ({
      ...log,
      modifiers: timelineModifiers.filter(modifier => modifier.target === log.actor),
    }));

    setActionBlocks(actionLogsWithModifiers);
  };

  const handleModifierChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Modifier) => {
    const value = e.target.value;
    setNewModifier(prev => ({
      ...prev,
      [field]: field === 'expiration' ? Number(value) : value,  // Handle number inputs for expiration
    }));
  };

  const addModifier = () => {
    // Add the new modifier block to the available modifiers list (not yet applied)
    setModifiers([...modifiers, { ...newModifier, timeApplied: Date.now() }]);

    // Reset the form for creating a new modifier block
    setNewModifier({
      type: ModifierType.IN_ACTION,
      spdChange: undefined,
      actionAdvancePercent: undefined,
      expiration: 0,
      target: 'all',
      timeApplied: 0,
      name: 'new'
    });
  };

  const handleModifierDrag = (modifier: Modifier) => {
    // When the user "drags" a modifier block onto the timeline, we add it to the timelineModifiers list
    setTimelineModifiers([...timelineModifiers, modifier]);
  };

  const handleDropModifier = (e: React.DragEvent, modifier: Modifier, actionBlockAV: number) => {
    // Prevent default behavior to allow drop
    e.preventDefault();

    // Get the position of the drop relative to the action block
    const dropPosition = e.clientY;

    // Get the bounds of the action block (we'll calculate based on its position on the page)
    const actionBlockElement = e.target as HTMLElement;
    const actionBlockHeight = actionBlockElement.offsetHeight;
    const actionBlockTop = actionBlockElement.getBoundingClientRect().top;

    // Determine if the drop was in the top 2/3 or bottom 1/3 of the action block
    const dropArea = dropPosition < actionBlockTop + actionBlockHeight * 2 / 3
      ? ModifierType.IN_ACTION
      : ModifierType.POST_ACTION;

    // Apply the modifier to the action block
    const updatedModifier = { ...modifier, type: dropArea };
    setTimelineModifiers((prev) => [...prev, updatedModifier]);
  };

  return (
    <div className="container">
      {/* Left Pane: Actor Configuration */}
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

        {/* Modifier Creation (Status Effects) */}
        <h2>Create Modifier Block</h2>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={newModifier.name}
            onChange={(e) => handleModifierChange(e, 'name')}
            placeholder="default"
          />
        </div>
        <div>
          <label>Modifier Type:</label>
          <select
            value={newModifier.type}
            onChange={(e) => handleModifierChange(e, 'type')}
          >
            <option value={ModifierType.IN_ACTION}>IN_ACTION</option>
            <option value={ModifierType.POST_ACTION}>POST_ACTION</option>
          </select>
        </div>
        <div>
          <label>SPD Change (%):</label>
          <input
            type="number"
            value={newModifier.spdChange || ''}
            onChange={(e) => handleModifierChange(e, 'spdChange')}
            placeholder="SPD Change"
          />
        </div>
        <div>
          <label>Action Advance Percent:</label>
          <input
            type="number"
            value={newModifier.actionAdvancePercent || ''}
            onChange={(e) => handleModifierChange(e, 'actionAdvancePercent')}
            placeholder="Action Advance"
          />
        </div>
        <div>
          <label>Expiration (ticks):</label>
          <input
            type="number"
            value={newModifier.expiration}
            onChange={(e) => handleModifierChange(e, 'expiration')}
            placeholder="Expiration"
            min="1"
          />
        </div>
        <div>
          <label>Target Actor:</label>
          <input
            type="text"
            value={newModifier.target}
            onChange={(e) => handleModifierChange(e, 'target')}
            placeholder="Actor Name or 'all'"
          />
        </div>
        <button onClick={addModifier}>Add Modifier Block</button>

        {/* Modifier Block List */}
        <h3>Available Modifiers</h3>
        <div className="modifier-blocks">
          {modifiers.map((modifier, index) => (
            <div
              key={index}
              className="modifier-block"
              draggable
              onDragEnd={() => handleModifierDrag(modifier)}
            >
              <p>
                <strong>{modifier.name}</strong> - {modifier.type} - Target: {modifier.target} - Expiration: {modifier.expiration}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane: Timeline Logs */}
      <div className="right-pane">
        <h2>Action Timeline</h2>
        <div className="action-blocks">
          {actionBlocks.map((log, index) => (
            <div
              key={index}
              className="action-block"
              onDrop={(e) => handleDropModifier(e, modifiers[0], log.actionAV)} // Apply modifier to this action block
              onDragOver={(e) => e.preventDefault()}  // Allow the drop
            >
              <p>
                <strong>{log.actor}</strong> acted at AV {log.actionAV.toFixed(2)}
              </p>
              {/* Display modifiers for this action block */}
              {log.modifiers.map((modifier, idx) => (
                <div key={idx} className={`modifier-box ${modifier.type}`}>
                  <p>{modifier.name}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineVisualizer;
