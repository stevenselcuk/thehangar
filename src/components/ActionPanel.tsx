import React from 'react';
import { aircraftData } from '../data/aircraft.ts';
import { itemsData } from '../data/items.ts';
import { AircraftType, GameState, Inventory, SuitType, TabType } from '../types.ts';
import ActionButton from './ActionButton.tsx';
import AogTab from './AogTab.tsx';
import BackshopsTab from './BackshopsTab.tsx';
import CanteenTab from './CanteenTab.tsx';
import HRFloorTab from './HRFloorTab.tsx';
import OfficeTab from './OfficeTab.tsx';
import TerminalTab from './TerminalTab.tsx';
import TrainingTab from './TrainingTab.tsx';

import BackroomModal from './BackroomModal';
import ProcurementModal from './ProcurementModal';
import ToolroomStatusWidget from './ToolroomStatusWidget';

const PhotoModal = React.lazy(() => import('./PhotoModal.tsx'));

const ActionPanel: React.FC<{
  activeTab: TabType;
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
  onOpenBulletinBoard: () => void;
}> = ({ activeTab, state, onAction, onOpenBulletinBoard }) => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = React.useState(false);
  const [isBackroomOpen, setIsBackroomOpen] = React.useState(false);
  const [isProcurementOpen, setIsProcurementOpen] = React.useState(false);

  // Close modals when switching tabs
  React.useEffect(() => {
    setIsBackroomOpen(false);
    setIsProcurementOpen(false);
  }, [activeTab]);

  const renderActiveEvent = () => {
    if (!state.activeEvent) return null;
    const event = state.activeEvent;
    const isStoryEvent = event.type === 'story_event';
    const progress = event.totalTime > 0 ? (event.timeLeft / event.totalTime) * 100 : 0;

    let borderColor = 'border-amber-600';
    let textColor = 'text-amber-500';
    let bgColor = 'bg-amber-950/10';

    if (event.type === 'audit') {
      borderColor = event.suitType === SuitType.CORPORATE ? 'border-purple-600' : 'border-red-600';
      textColor = event.suitType === SuitType.CORPORATE ? 'text-purple-400' : 'text-red-500';
      bgColor = event.suitType === SuitType.CORPORATE ? 'bg-purple-950/10' : 'bg-red-950/10';
    } else if (event.type === 'accident' || event.type === 'component_failure') {
      borderColor = 'border-red-800';
      textColor = 'text-red-600 font-black';
      bgColor = 'bg-red-950/20 vibrate';
    } else if (event.type === 'eldritch_manifestation' || event.type === 'canteen_incident') {
      borderColor = event.type === 'canteen_incident' ? 'border-emerald-900' : 'border-purple-900';
      textColor =
        event.type === 'canteen_incident'
          ? 'text-emerald-400'
          : 'text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]';
      bgColor =
        event.type === 'canteen_incident'
          ? 'bg-emerald-950/10 flicker'
          : 'bg-purple-950/20 vibrate';
    } else if (event.type === 'story_event') {
      borderColor = 'border-amber-600/60';
      textColor = 'text-amber-400';
      bgColor = 'bg-amber-950/10';
    }

    return (
      <div
        className={`mb-8 p-5 border-2 ${borderColor} ${bgColor} relative shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all`}
      >
        {!isStoryEvent && (
          <div
            className={`absolute top-0 left-0 h-1.5 ${borderColor.replace('border', 'bg')}`}
            style={{ width: `${progress}%` }}
          />
        )}
        <div className="flex justify-between items-start mb-3">
          <h4 className={`text-xs ${textColor} font-bold uppercase tracking-[0.2em] flicker`}>
            {event.title}
          </h4>
          {event.type !== 'component_failure' && !isStoryEvent && (
            <span className="text-[8px] opacity-50 font-mono tracking-tighter">
              {Math.ceil(event.timeLeft / 1000)}s TO COMPLY
            </span>
          )}
        </div>
        <div className="text-[10px] text-zinc-400 mb-4 leading-relaxed italic border-l-2 border-current pl-2">
          "{event.description}"
        </div>

        {event.choices && event.choices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {event.choices.map((choice) => {
              const resourceKey = choice.cost?.resource as keyof GameState['resources'];
              const disabled = choice.cost && state.resources[resourceKey] < choice.cost.amount;
              return (
                <ActionButton
                  key={choice.id}
                  label={choice.label}
                  onClick={() => onAction('RESOLVE_EVENT', { choiceId: choice.id })}
                  disabled={disabled}
                  cost={
                    choice.cost
                      ? {
                          label: choice.cost.resource.substring(0, 3).toUpperCase(),
                          value: choice.cost.amount,
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        ) : event.id === 'FOUND_PHOTO_EVENT' ? (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <ActionButton
              label="EXAMINE"
              onClick={() => setIsPhotoModalOpen(true)}
              className="border-amber-600/50 hover:bg-amber-900/20 text-amber-500"
              description="Analyze the recovered material."
            />
            <ActionButton
              label="DISCARD"
              onClick={() => onAction('RESOLVE_EVENT')}
              className="border-zinc-700 hover:bg-zinc-900/20 text-zinc-500"
              description="Ignore the anomaly and return to work."
            />
          </div>
        ) : event.requiredAction ? (
          <ActionButton
            label={event.requiredAction.replace(/_/g, ' ')}
            onClick={() => onAction('RESOLVE_EVENT')}
            className={`border-2 ${borderColor} bg-black/40`}
          />
        ) : null}
      </div>
    );
  };

  const renderActiveScenario = () => {
    if (!state.activeScenario) return null;
    const scenario = state.activeScenario;

    return (
      <div className="mb-8 p-6 border-2 border-blue-500/50 bg-blue-950/40 relative shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all animate-[fadeIn_0.5s] backdrop-blur-sm z-50">
        <div className="flex justify-between items-start mb-4 border-b border-blue-500/30 pb-2">
          <h4 className="text-sm text-blue-400 font-bold uppercase tracking-[0.2em] animate-pulse">
            Unforeseen Situation
          </h4>
          <span className="text-[9px] text-blue-300/50 font-mono tracking-tighter">
            REF: {scenario.id}
          </span>
        </div>
        <div className="text-sm text-blue-100 mb-6 leading-relaxed border-l-4 border-blue-600 pl-4 font-serif italic bg-black/20 p-4">
          "{scenario.description}"
        </div>

        <div className="grid grid-cols-1 gap-3 mt-4">
          {scenario.choices.map((choice, idx) => (
            <ActionButton
              key={idx}
              label={choice.text}
              onClick={() => onAction('RESOLVE_SCENARIO', { choiceIndex: idx })}
              className="border-blue-800 hover:bg-blue-900/60 text-left justify-start pl-4 py-4 text-blue-200"
            />
          ))}
        </div>
      </div>
    );
  };

  const renderJobCard = () => {
    if (!state.activeJob || state.activeEvent) return null;
    const req = state.activeJob.requirements;
    const progress = (state.activeJob.timeLeft / state.activeJob.totalTime) * 100;
    const isRetrofit = state.activeJob.isRetrofit;

    return (
      <div
        className={`mb-8 p-5 border ${isRetrofit ? 'border-purple-600 bg-purple-950/10' : 'border-emerald-900/50 bg-emerald-950/5'} relative`}
      >
        <div
          className={`absolute top-0 left-0 h-0.5 ${isRetrofit ? 'bg-purple-400' : 'bg-emerald-600'}`}
          style={{ width: `${progress}%` }}
        />
        <div className="flex justify-between items-start mb-3">
          <h4
            className={`text-[10px] ${isRetrofit ? 'text-purple-400' : 'text-emerald-600'} font-bold uppercase tracking-wider`}
          >
            {isRetrofit ? 'Retrofit Work Order' : 'Work Order'}
          </h4>
          <span
            className={`text-[8px] ${isRetrofit ? 'text-purple-800' : 'text-emerald-900'} font-mono`}
          >
            ID: {state.activeJob.id}
          </span>
        </div>
        <p
          className={`text-[10px] ${isRetrofit ? 'text-purple-300' : 'text-emerald-800'} mb-4 italic leading-tight`}
        >
          "{state.activeJob.description}"
        </p>
        <div className="grid grid-cols-2 gap-3 mb-5 text-[9px] uppercase py-2 bg-black/20 px-3">
          <div
            className={
              state.resources.alclad >= (req.alclad || 0) ? 'text-emerald-700' : 'text-red-900'
            }
          >
            Alclad: {req.alclad || 0}
          </div>
          <div
            className={
              state.resources.rivets >= (req.rivets || 0) ? 'text-emerald-700' : 'text-red-900'
            }
          >
            Rivets: {req.rivets || 0}
          </div>
        </div>
        <ActionButton
          label="Sign Off"
          onClick={() => onAction('COMPLETE_JOB')}
          className={
            isRetrofit
              ? 'border-purple-500/50 hover:bg-purple-900/20'
              : 'border-emerald-700/50 hover:bg-emerald-900/20'
          }
          cost={{ label: 'FOCUS', value: 15 }}
          disabled={state.resources.focus < 15}
        />
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case TabType.STRUCTURE_SHOP:
        return (
          <div className="space-y-8">
            <h3 className="text-xs text-emerald-700 uppercase tracking-widest border-b border-emerald-900/30 pb-2">
              Structures Lab
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <ActionButton
                label="Install Rivets"
                onClick={() => onAction('TIGHTEN_BOLT')}
                cooldown={400}
                cost={{ label: 'FOCUS', value: 3 }}
                disabled={state.resources.focus < 3}
              />
              <ActionButton
                label="Orbital Sanding"
                onClick={() => onAction('ORBITAL_SAND')}
                cooldown={1000}
                disabled={!state.inventory.orbitalSander}
                cost={{ label: 'FOCUS', value: 10 }}
                description={
                  !state.inventory.orbitalSander
                    ? 'EQUIPMENT MISSING'
                    : 'Smooth out the Alclad plates.'
                }
              />
            </div>
            <div>
              <h4 className="text-[10px] text-emerald-800 uppercase mb-4 font-bold border-l-2 border-emerald-900 pl-2">
                Equipment Procurement
              </h4>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setIsBackroomOpen(!isBackroomOpen)}
                  className="flex-1 p-2 bg-emerald-900/20 border border-emerald-700/50 hover:bg-emerald-800/20 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  [BACKROOM]
                </button>

                <button
                  onClick={() => setIsProcurementOpen(true)}
                  className="flex-1 p-2 bg-emerald-900/20 border border-emerald-700/50 hover:bg-emerald-800/20 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  [CATALOG] Procurement
                </button>
              </div>

              {isBackroomOpen && (
                <BackroomModal
                  state={state}
                  onAction={onAction}
                  onClose={() => setIsBackroomOpen(false)}
                />
              )}

              {isProcurementOpen && (
                <ProcurementModal
                  state={state}
                  onAction={onAction}
                  onClose={() => setIsProcurementOpen(false)}
                />
              )}

              <div className="grid grid-cols-1 gap-2">
                {itemsData.shop
                  .filter((i) => i.category === 'tool')
                  .map(
                    (item) =>
                      !state.inventory[item.id as keyof Inventory] && (
                        <ActionButton
                          key={item.id}
                          label={`Buy ${item.label}`}
                          cost={{ label: 'Alclad', value: item.cost }}
                          onClick={() =>
                            onAction('BUY_SHOP_ITEM', { item: item.id, cost: item.cost })
                          }
                          description={`P/N: ${item.pn}`}
                        />
                      )
                  )}
              </div>
            </div>
          </div>
        );

      case TabType.TOOLROOM: {
        const masterStatusClass = state.flags.toolroomMasterPissed
          ? 'text-red-500 border-red-800 bg-red-950/20'
          : 'text-emerald-400 bg-emerald-950/20 border-emerald-900 hover:bg-emerald-900';

        const allToolMetadata = [
          ...itemsData.shop.map((t) => ({
            key: t.id,
            label: t.label,
            pn: t.pn,
            isCalibratable: false,
          })),
          ...itemsData.toolroom.map((t) => ({
            key: t.key,
            label: t.label,
            pn: t.pn,
            isCalibratable: true,
          })),
        ];

        const ownedToolsWithCondition = Object.keys(state.toolConditions)
          .filter((toolKey) => state.inventory[toolKey as keyof Inventory])
          .map((toolKey) => {
            const metadata = allToolMetadata.find((t) => t.key === toolKey);
            return {
              key: toolKey,
              label: metadata?.label || toolKey,
              pn: metadata?.pn || 'N/A',
              isCalibratable: metadata?.isCalibratable || false,
              condition: state.toolConditions[toolKey],
            };
          });

        const unownedToolroomTools = itemsData.toolroom.filter(
          (t) => !state.inventory[t.key as keyof Inventory]
        );

        return (
          <div className="space-y-6">
            <ToolroomStatusWidget state={state} />

            <div className="flex justify-between items-center border-b border-emerald-900/30 pb-2">
              <h3 className="text-xs text-emerald-700 uppercase tracking-widest">
                Master Toolroom Control
              </h3>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[8px] font-bold uppercase px-2 py-1 border ${masterStatusClass}`}
                >
                  {state.flags.toolroomMasterPissed ? 'STATUS: IRRITATED' : 'STATUS: CONTENT'}
                </span>
                <button
                  onClick={() => onAction('TOOLROOM_MASTER_TALK')}
                  className={`text-[9px] px-2 py-1 border transition-all ${masterStatusClass}`}
                >
                  TALK TO MASTER
                </button>
              </div>
            </div>

            <ActionButton
              label="Ask Master about the Old Days"
              onClick={() => onAction('ASK_MASTER_LORE')}
              disabled={state.flags.toolroomMasterPissed}
              description={
                state.flags.toolroomMasterPissed
                  ? "He's in a foul mood. Better not to bother him."
                  : "He's seen things. Maybe he'll talk if you're on his good side."
              }
              className="mb-0 text-sm"
            />

            <div className="p-4 border border-emerald-900 bg-zinc-950/40">
              <h4 className="text-[10px] text-emerald-500 uppercase mb-4 font-bold tracking-widest border-l-2 border-emerald-600 pl-3">
                Owned Tool Maintenance
              </h4>
              <div className="space-y-3">
                {ownedToolsWithCondition.length > 0 ? (
                  ownedToolsWithCondition.map((tool) => {
                    const condition = tool.condition || 0;
                    const condColor =
                      condition > 75
                        ? 'text-emerald-400'
                        : condition > 25
                          ? 'text-amber-400'
                          : 'text-red-500';

                    return (
                      <div key={tool.key} className="group relative">
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#050505] border border-emerald-900 rounded-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-64 text-center whitespace-normal">
                          <p className="text-[10px] text-emerald-700 uppercase tracking-tighter">
                            P/N: <span className="text-amber-500 font-bold">{tool.pn}</span>
                          </p>
                          <p className="text-[10px] text-emerald-700 uppercase tracking-tighter mt-1">
                            Exact Condition:{' '}
                            <span className="text-amber-500 font-bold">
                              {tool.condition.toFixed(4)}%
                            </span>
                          </p>
                        </div>
                        <div className="p-3 border border-emerald-900/30 bg-black/40">
                          <div className="flex justify-between items-center text-[9px] uppercase">
                            <span className="text-emerald-500 font-bold">{tool.label}</span>
                            <span className={condColor}>Cond: {condition.toFixed(1)}%</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <ActionButton
                              label="Repair"
                              onClick={() =>
                                onAction('REPAIR_TOOL', { id: tool.key, label: tool.label })
                              }
                              disabled={condition >= 100 || state.resources.alclad < 30}
                              cost={{ label: 'AL', value: 30 }}
                              className="mb-0 text-[10px]"
                            />
                            {tool.isCalibratable && (
                              <ActionButton
                                label="Calibrate"
                                onClick={() => onAction('START_CALIBRATION_MINIGAME', tool)}
                                cost={{ label: 'CR', value: 40 }}
                                disabled={
                                  state.resources.credits < 40 || state.calibrationMinigame.active
                                }
                                className="mb-0 text-[10px]"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[9px] text-emerald-800 italic text-center py-4">
                    No tools with tracked conditions owned. Purchase or check-out tools to maintain
                    them here.
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border border-emerald-900 bg-zinc-950/40">
              <h4 className="text-[10px] text-emerald-500 uppercase mb-4 font-bold tracking-widest border-l-2 border-emerald-600 pl-3">
                Precision Tool Crib (Check-out)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {unownedToolroomTools.length > 0 ? (
                  unownedToolroomTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="group relative p-2 border border-emerald-900/30 bg-black/40"
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#050505] border border-emerald-900 rounded-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 w-48 text-center whitespace-normal">
                        <p className="text-[10px] text-emerald-700 uppercase tracking-tighter">
                          P/N: <span className="text-amber-500 font-bold">{tool.pn}</span>
                        </p>
                      </div>
                      <div className="flex justify-between text-[9px] mb-2 uppercase">
                        <span className="text-emerald-700">{tool.label}</span>
                        <span className="text-zinc-600">LOCKED</span>
                      </div>
                      <ActionButton
                        label={`Check Out`}
                        onClick={() => onAction('GET_TOOLROOM_ITEM', tool)}
                        className="mb-0 py-1"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-[9px] text-emerald-800 italic text-center py-4">
                    All precision tools checked out.
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border border-emerald-900 bg-zinc-950/40">
              <h4 className="text-[10px] text-emerald-500 uppercase mb-4 font-bold tracking-widest border-l-2 border-emerald-600 pl-3">
                Consumables Bin
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {itemsData.consumables.map((c) => (
                  <div key={c.id} className="p-2 border border-emerald-900/30 bg-black/40">
                    <div className="flex justify-between text-[9px] mb-2 uppercase">
                      <span className="text-emerald-700">{c.label}</span>
                      <span className="text-emerald-400">
                        Qty: {state.resources[c.id as keyof typeof state.resources]}
                      </span>
                    </div>
                    <ActionButton
                      label={`Dispense (P/N: ${c.pn})`}
                      onClick={() => onAction('DISPENSE_CONSUMABLE', c)}
                      cost={{ label: 'CR', value: c.cost }}
                      disabled={state.resources.credits < c.cost}
                      className="mb-0 py-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border border-red-900 bg-black/40">
              <h4 className="text-[10px] text-red-600 uppercase mb-4 font-bold tracking-widest border-l-2 border-red-600 pl-3">
                Nasty Stuff / Hazardous
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <ActionButton
                  label="Mix Touch-up Paint"
                  onClick={() => onAction('MIX_PAINT')}
                  description="Needs MEK. Hazardous fumes."
                  cost={{ label: 'MEK', value: 1 }}
                  className="border-red-900 text-red-400"
                />
                <ActionButton
                  label="Sonic Cleaning"
                  onClick={() => onAction('SONIC_CLEAN')}
                  disabled={!state.inventory.sonicCleaner}
                  description="Needs SNC-ULTRA. High noise."
                  cost={{ label: 'FOCUS', value: 10 }}
                />
              </div>
            </div>
          </div>
        );
      }

      case TabType.APRON_LINE: {
        const activeAircraft = state.activeAircraft
          ? aircraftData.find((a) => a.id === state.activeAircraft!.id)
          : null;
        const assignedTask = state.activeAircraft?.task;
        const actionCosts = { TRANSIT_CHECK: 12, DAILY_CHECK: 25, ETOPS_CHECK: 40 };
        const taskCost = assignedTask ? actionCosts[assignedTask] : 0;

        return (
          <div className="space-y-6">
            <h3 className="text-xs text-emerald-700 uppercase tracking-widest border-b border-emerald-900/30 pb-2">
              Tarmac & Line Operations
            </h3>

            {activeAircraft && assignedTask ? (
              <div className="space-y-4">
                <h4 className="text-[10px] text-amber-500 uppercase font-bold tracking-widest border-l-2 border-amber-600 pl-3">
                  Current Assignment
                </h4>
                <div
                  className={`p-4 border ${activeAircraft.isSuspicious ? 'border-red-900 bg-red-950/10' : 'border-emerald-900/40 bg-black/40'}`}
                >
                  <h4
                    className={`text-sm ${activeAircraft.isSuspicious ? 'text-red-500' : 'text-emerald-600'} uppercase mb-2 font-bold tracking-widest`}
                  >
                    {activeAircraft.name}
                  </h4>
                  <p
                    className={`text-[10px] ${activeAircraft.isSuspicious ? 'text-red-700' : 'text-emerald-800'} italic mb-4`}
                  >
                    {activeAircraft.description}
                  </p>
                  <p className="text-[9px] uppercase text-amber-400 mb-4">
                    Assigned Task:{' '}
                    <span className="font-bold">{assignedTask.replace(/_/g, ' ')}</span>
                  </p>
                  <ActionButton
                    label={`Perform ${assignedTask.replace(/_/g, ' ')}`}
                    onClick={() =>
                      onAction('AIRCRAFT_ACTION', {
                        aircraftId: activeAircraft.id,
                        actionType: assignedTask,
                      })
                    }
                    cost={{ label: 'FOCUS', value: taskCost }}
                    className="border-amber-600 text-amber-400"
                    disabled={state.resources.focus < taskCost}
                  />
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <ActionButton
                      label="Read Flight Log"
                      onClick={() =>
                        onAction('AIRCRAFT_ACTION', {
                          aircraftId: activeAircraft.id,
                          actionType: 'READ_FLIGHT_LOG',
                        })
                      }
                      cost={{ label: 'FOCUS', value: 5 }}
                    />
                    {activeAircraft.id !== AircraftType.A300_CARGO && (
                      <ActionButton
                        label="Read Cabin Log"
                        onClick={() =>
                          onAction('AIRCRAFT_ACTION', {
                            aircraftId: activeAircraft.id,
                            actionType: 'READ_CABIN_LOG',
                          })
                        }
                        cost={{ label: 'FOCUS', value: 5 }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-emerald-900/40 bg-black/40 text-center">
                <h4 className="text-sm text-emerald-600 uppercase mb-4 font-bold tracking-widest">
                  Awaiting Assignment
                </h4>
                <p className="text-xs text-emerald-800 italic mb-6">
                  Report to the line lead to get your next task.
                </p>
                <ActionButton
                  label="Get Next Assignment"
                  onClick={() => onAction('GET_NEW_AIRCRAFT_TASK')}
                  description="Receive a randomized aircraft and task for this shift."
                />
              </div>
            )}

            <div className="p-4 border border-emerald-900/40 bg-black/40">
              <h4 className="text-[10px] text-emerald-600 uppercase mb-4 font-bold tracking-widest">
                General Ramp Actions
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <ActionButton
                  label="Apron FOD Sweep"
                  onClick={() => onAction('FOD_SWEEP')}
                  cost={{ label: 'FOCUS', value: 5 }}
                  description="Search for stray rivets and debris."
                />
                <ActionButton
                  label="Listen to Radio"
                  onClick={() => onAction('LISTEN_RADIO')}
                  cost={{ label: 'FOCUS', value: 0 }}
                  description="Tune into Line Maint. VHF 141.80. Listen for lead, A/C on ground, and... other signals."
                />
                <ActionButton
                  label={`Smoke A Cigarette ${state.personalInventory['winston_pack'] ? `(${state.personalInventory['winston_pack']})` : ''}`}
                  onClick={() => onAction('SMOKE_CIGARETTE')}
                  cooldown={120000}
                  disabled={(state.personalInventory['winston_pack'] || 0) < 1}
                  description={
                    (state.personalInventory['winston_pack'] || 0) > 0
                      ? 'Retreat to your truck for a smoke. +5 Focus, +5 Sanity. Reduces Stress & Fatigue.'
                      : 'You need a pack of smokes first. Check the Canteen.'
                  }
                />
                <ActionButton
                  label="Drink Galley Coffee"
                  onClick={() => onAction('DRINK_GALLEY_COFFEE')}
                  cooldown={60000}
                  description="Find a leftover pot of coffee. Tastes like kerosene. +10 Focus, -5 Sanity."
                />
                <ActionButton
                  label="Scavenge Galleys"
                  onClick={() => onAction('SCAVENGE_GALLEYS')}
                  cost={{ label: 'FOC', value: 5 }}
                  description="HIGH RISK. Rummage through parked aircraft galleys for leftovers. Increases suspicion."
                  className="border-amber-800 text-amber-500"
                />
                <ActionButton
                  label="Watch Runway Landings"
                  onClick={() => onAction('WATCH_RUNWAY')}
                  cost={{ label: 'FOC', value: 2 }}
                  cooldown={30000}
                  description="Take a moment to watch the arrivals and judge the pilots' skills. A brief distraction."
                />
                <ActionButton
                  label="Small Talk (Cabin Crew)"
                  onClick={() => onAction('SMALL_TALK_CABIN')}
                  cost={{ label: 'FOCUS', value: 5 }}
                  description="Chat with flight attendants during turnaround. They notice things passengers don't."
                />
                <ActionButton
                  label="Service Lavatory"
                  onClick={() => onAction('SERVICE_LAVATORY')}
                  cost={{ label: 'FOCUS', value: 15 }}
                  description="A disgusting but necessary job. Sometimes things get left behind."
                />
                <ActionButton
                  label="Observe Sedan"
                  onClick={() => onAction('OBSERVE_SEDAN')}
                  cost={{ label: 'FOCUS', value: 10 }}
                  description="That black sedan is always parked by the perimeter fence. Always empty. Watch it."
                  className="border-amber-800 text-amber-500"
                />
              </div>
            </div>

            <div className="mt-8 p-4 border border-zinc-700 bg-black/20">
              <h4 className="text-[10px] text-zinc-400 uppercase mb-4 font-bold tracking-widest">
                Corrosion Corner
              </h4>
              <ActionButton
                label="Observe from Corrosion Corner"
                onClick={() => onAction('OBSERVE_CORROSION_CORNER')}
                cost={{ label: 'FOCUS', value: 10 }}
                description="Use the derelict airframes as cover to observe the tarmac for unusual activity."
              />
              <ActionButton
                label="Scavenge Old Airframes"
                onClick={() => onAction('SCAVENGE_CORROSION_CORNER')}
                cost={{ label: 'FOCUS', value: 40 }}
                description="HIGH RISK. Cannibalize parts from the grounded fleet. These components are untraceable and may be unstable."
                className="border-amber-800 text-amber-500"
              />
            </div>

            <div className="mt-8 p-4 border border-emerald-900 bg-black/20">
              <h4 className="text-[10px] text-emerald-800 uppercase mb-4 font-bold tracking-widest">
                External Fleet Support
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {itemsData.shop
                  .filter((i) => i.category === 'line')
                  .map(
                    (item) =>
                      !state.inventory[item.id as keyof Inventory] && (
                        <ActionButton
                          key={item.id}
                          label={`Purchase ${item.label}`}
                          cost={{ label: 'Alclad', value: item.cost }}
                          onClick={() =>
                            onAction('BUY_SHOP_ITEM', { item: item.id, cost: item.cost })
                          }
                          description={`Heavy equipment P/N: ${item.pn}`}
                        />
                      )
                  )}
              </div>
            </div>
          </div>
        );
      }

      case TabType.HANGAR: {
        const finding = state.flags.ndtFinding;
        return (
          <div className="space-y-6">
            <h3 className="text-xs text-emerald-700 uppercase tracking-widest border-b border-emerald-900/30 pb-2">
              Maint. Bay 7 SITREP
            </h3>
            {renderJobCard()}

            {/* Anomaly Analysis */}
            {state.anomalies.length > 0 && (
              <div className="p-5 border-2 border-purple-800 bg-purple-950/20 animate-pulse">
                <h4 className="text-[10px] text-purple-400 uppercase mb-4 font-bold tracking-widest border-l-2 border-purple-500 pl-3">
                  Anomaly Analysis Bench
                </h4>
                {state.anomalies.map((anomaly) => (
                  <div key={anomaly.id} className="mb-3 p-3 bg-black/30 border border-purple-900">
                    <p className="text-purple-300 font-bold">{anomaly.name}</p>
                    <p className="text-[9px] text-purple-400 italic mt-1">
                      "{anomaly.description}"
                    </p>
                  </div>
                ))}
                <ActionButton
                  label="Analyze Anomaly"
                  onClick={() => onAction('ANALYZE_ANOMALY')}
                  cost={{ label: 'FOCUS/SAN', value: 60 }}
                  description="HIGH RISK. Attempt to deconstruct and understand the anomalous component. May yield rare resources or result in a containment breach."
                  className="border-purple-600 text-purple-300"
                />
              </div>
            )}

            <div className="p-5 border border-purple-900/60 bg-purple-950/10">
              <h4 className="text-[10px] text-purple-400 uppercase mb-4 font-bold tracking-widest border-l-2 border-purple-500 pl-3">
                Investigation
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <ActionButton
                  label="Listen to the Fuselage"
                  onClick={() => onAction('LISTEN_FUSELAGE')}
                  cost={{ label: 'SANITY', value: 20 }}
                  description="Press your ear against the cold skin of an aircraft. Listen for its secrets."
                />
                <ActionButton
                  label="Check Redacted Log Entries"
                  onClick={() => onAction('CHECK_REDACTED_LOGS')}
                  cost={{ label: 'FOCUS', value: 30 }}
                  description="Use a flashlight to try and read through the black ink on old, physical logbooks."
                />
              </div>
            </div>

            {/* NDT Section */}
            <div className="p-5 border border-blue-900/60 bg-blue-950/10">
              <h4 className="text-[10px] text-blue-400 uppercase mb-4 font-bold tracking-widest border-l-2 border-blue-500 pl-3">
                Non-Destructive Testing (NDT)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <ActionButton
                  label="NDT Ultrasonic Scan"
                  onClick={() => onAction('PERFORM_NDT')}
                  cost={{ label: 'FOCUS', value: 20 }}
                  description="Detect subsurface structural fractures."
                  disabled={!!finding}
                />
                <ActionButton
                  label="Perform HFEC Scan"
                  onClick={() => onAction('PERFORM_HFEC_SCAN')}
                  cost={{ label: 'FOCUS', value: 25 }}
                  description="Use High-Frequency Eddy Current to find cracks in conductive materials. Requires HFEC Scanner."
                  disabled={!!finding || !state.inventory.hfecDevice}
                />
                <ActionButton
                  label="Borescope Inspection"
                  onClick={() => onAction('PERFORM_BORESCOPE_INSPECTION')}
                  cost={{ label: 'FOCUS', value: 30 }}
                  description="Inspect engine internals for wear and foreign objects."
                  disabled={!!finding}
                />
              </div>
            </div>

            {/* Findings Section */}
            {finding && (
              <div className="p-5 border-2 border-amber-800 bg-amber-950/20 animate-pulse">
                <h4 className="text-[10px] text-amber-400 uppercase mb-4 font-bold tracking-widest border-l-2 border-amber-500 pl-3">
                  Findings & Discrepancies
                </h4>
                <div className="mb-3 p-3 bg-black/30 border border-amber-900">
                  <p className="text-amber-300 font-bold uppercase text-sm">
                    [{finding.severity}] {finding.type} Finding
                  </p>
                  <p className="text-[10px] text-amber-400 italic mt-1">"{finding.description}"</p>
                </div>
                <ActionButton
                  label="File Non-Routine Report"
                  onClick={() => onAction('CREATE_NON_ROUTINE_REPORT')}
                  description="Log the finding and generate a non-routine work card. This will clear the finding and allow further NDT work."
                  className="border-amber-600 text-amber-300"
                />
              </div>
            )}

            {/* Sub-Level Storage 3 Access */}
            {state.flags.sls3Unlocked && (
              <div className="p-5 border-2 border-red-900/60 bg-black/40 mt-6">
                <h4 className="text-[10px] text-red-500 uppercase mb-4 font-bold tracking-widest border-l-2 border-red-600 pl-3">
                  Sub-Level Storage 3 Access
                </h4>
                <p className="text-[9px] text-red-800 mb-4 italic">
                  A heavy steel hatch, almost completely hidden. The air that seeps from the cracks
                  smells of rust and ozone. This place is not on any official schematic.
                </p>
                <ActionButton
                  label="Descend into SLS-3"
                  onClick={() => onAction('DESCEND_INTO_SLS3')}
                  cost={{ label: 'FOC/SAN', value: 25 }}
                  description="EXTREME RISK. Explore the off-the-books sub-level. You might find valuable, untraceable components... or something else."
                  className="border-red-700 text-red-400"
                  cooldown={60000}
                />
              </div>
            )}

            <div className="p-4 border border-emerald-900/20 bg-emerald-950/5 mt-4">
              <h4 className="text-[10px] text-emerald-900 uppercase mb-2 font-bold italic tracking-widest">
                Hangar Environment
              </h4>
              <p className="text-[9px] text-emerald-900 opacity-60 mb-4">
                The massive steel rafters groan under the weight of the dark. Somewhere in the back,
                an APU is testing itself without a crew.
              </p>
              <ActionButton
                label="View Bulletin Board"
                onClick={onOpenBulletinBoard}
                description="Check the latest company news, staff rosters, and rumors."
                className="border-emerald-800/50 text-emerald-600"
              />
            </div>
          </div>
        );
      }

      case TabType.CANTEEN:
        return <CanteenTab state={state} onAction={onAction} />;
      case TabType.TERMINAL:
        return <TerminalTab state={state} onAction={onAction} />;
      case TabType.OFFICE:
        return (
          <OfficeTab state={state} onAction={onAction} onOpenBulletinBoard={onOpenBulletinBoard} />
        );
      case TabType.HR_FLOOR:
        return <HRFloorTab state={state} onAction={onAction} />;
      case TabType.BACKSHOPS:
        return <BackshopsTab state={state} onAction={onAction} />;
      case TabType.TRAINING:
        return <TrainingTab state={state} onAction={onAction} />;
      case TabType.AOG_DEPLOYMENT:
        return <AogTab state={state} onAction={onAction} />;
      default:
        return (
          <div className="text-center opacity-30 mt-20 text-xs tracking-widest">
            COMMUNICATION LOST
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderActiveEvent()}
      {renderActiveScenario()}
      {renderContent()}
      {state.activeEvent?.id === 'FOUND_PHOTO_EVENT' && (
        <React.Suspense fallback={null}>
          <PhotoModal
            isOpen={isPhotoModalOpen}
            onClose={() => setIsPhotoModalOpen(false)}
            imagePath="/images/found_photo.png"
            title="RECOVERED ARCHIVE #770"
            description="DATE: UNKNOWN // SUBJECT: UNKNOWN // STATUS: CLASSIFIED"
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default ActionPanel;
