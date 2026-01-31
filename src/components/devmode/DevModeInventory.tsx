import React from 'react';
import { itemsData } from '../../data/items';
import { GameReducerAction } from '../../state/gameReducer';
import { GameState, RotableItem } from '../../types';

interface DevModeInventoryProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameReducerAction>;
}

export const DevModeInventory: React.FC<DevModeInventoryProps> = ({ gameState, dispatch }) => {
  const toggleInventory = (key: keyof GameState['inventory']) => {
    const currentValue = gameState.inventory[key];
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: { [key]: typeof currentValue === 'boolean' ? !currentValue : currentValue },
    });
  };

  const setInventoryValue = (key: keyof GameState['inventory'], value: boolean | number) => {
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: { [key]: value },
    });
  };

  const addRotable = () => {
    // Pick a random rotable template
    const templates = itemsData.rotables || [];
    if (templates.length === 0) return;
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Create new rotable instance
    const newRotable: RotableItem = {
      id: `${template.id}_${Date.now()}`,
      label: template.label,
      pn: template.pn,
      sn: `SN-${Math.floor(Math.random() * 99999)}`,
      condition: 100,
      isInstalled: false,
      isUntraceable: false,
    };

    const updatedRotables = [...gameState.rotables, newRotable];
    dispatch({
      type: 'UPDATE_STATE',
      payload: { rotables: updatedRotables },
    });
  };

  const updateRotableCondition = (id: string, condition: number) => {
    const updatedRotables = gameState.rotables.map((r) => (r.id === id ? { ...r, condition } : r));
    dispatch({
      type: 'UPDATE_STATE',
      payload: { rotables: updatedRotables },
    });
  };

  return (
    <div className="space-y-6">
      {/* Standard Inventory */}
      <section>
        <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-emerald-800 pb-2">
          Standard Inventory & Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
          {Object.entries(gameState.inventory).map(([key, value]) => (
            <div key={key} className="bg-emerald-950/50 p-3 border border-emerald-800">
              {typeof value === 'boolean' ? (
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-emerald-400 text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleInventory(key as keyof GameState['inventory'])}
                    className="w-5 h-5"
                  />
                </label>
              ) : typeof value === 'number' ? (
                <div>
                  <label className="text-emerald-400 text-sm capitalize block mb-2">
                    {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      setInventoryValue(key as keyof GameState['inventory'], Number(e.target.value))
                    }
                    className="w-full bg-emerald-950 border border-emerald-700 text-emerald-400 px-2 py-1 text-sm"
                  />
                </div>
              ) : Array.isArray(value) ? (
                <div>
                  <label className="text-emerald-400 text-sm capitalize block mb-2">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="text-xs text-emerald-600">{value.join(', ') || 'None'}</div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Rotables Management */}
      <section>
        <div className="flex justify-between items-center mb-4 border-b border-emerald-800 pb-2">
          <h2 className="text-lg font-bold text-emerald-400">Rotables Management</h2>
          <button
            onClick={addRotable}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3 py-1 border border-emerald-500"
          >
            + Add Random Rotable
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {gameState.rotables.length === 0 && (
            <p className="text-emerald-600 italic">No rotables in inventory.</p>
          )}
          {gameState.rotables.map((rotable) => (
            <div
              key={rotable.id}
              className="bg-emerald-950/30 p-2 border border-emerald-800 flex justify-between items-center"
            >
              <div>
                <p className="text-emerald-400 font-bold text-sm">{rotable.label}</p>
                <p className="text-emerald-600 text-xs">
                  PN: {rotable.pn} | SN: {rotable.sn}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-500">Cond:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={rotable.condition}
                  onChange={(e) => updateRotableCondition(rotable.id, Number(e.target.value))}
                  className="w-16 bg-emerald-900 text-emerald-100 text-xs px-1 border border-emerald-700"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Anomalies */}
      <section>
        <h2 className="text-lg font-bold text-emerald-400 mb-4 border-b border-emerald-800 pb-2">
          Anomalies
        </h2>
        <div className="space-y-2">
          {gameState.anomalies.length === 0 && (
            <p className="text-emerald-600 italic">No active anomalies.</p>
          )}
          {gameState.anomalies.map((anomaly) => (
            <div key={anomaly.id} className="bg-emerald-950/30 p-2 border border-emerald-800">
              <p className="text-emerald-400 font-bold text-sm">{anomaly.name}</p>
              <p className="text-emerald-600 text-xs">{anomaly.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
