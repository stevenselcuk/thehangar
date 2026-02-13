import React from 'react';
import { useSound } from '../context/SoundContext.tsx';

import { GameState } from '../types.ts';
import ActionButton from './ActionButton.tsx';
import MailClient from './MailClient.tsx';

import { locationTriggers } from '../data/locationTriggers';

const OfficeTab: React.FC<{
  state: GameState;
  onAction: (t: string, p?: Record<string, unknown>) => void;
}> = ({ state, onAction }) => {
  const { play } = useSound();
  const [isMailOpen, setIsMailOpen] = React.useState(false);

  React.useEffect(() => {
    if (Math.random() > 0.3) return;
    const relevantTriggers = locationTriggers.filter((t) => t.location === 'OFFICE');
    const trigger = relevantTriggers.find((t) => Math.random() < t.chance);
    if (trigger) onAction('LOG_FLAVOR', { text: trigger.text });
  }, [onAction]);

  const inv = state.inventory;
  const pcPartsCount = [inv.mainboard, inv.graphicCard, inv.cdRom, inv.floppyDrive].filter(
    Boolean
  ).length;
  const unreadMailCount = (state.mail || []).filter((m) => !m.read).length;

  return (
    <div className="space-y-8">
      <h3 className="text-xs text-emerald-700 mb-4 uppercase tracking-[0.2em] border-b border-emerald-900/30 pb-2">
        Administrative Core
      </h3>

      {isMailOpen ? (
        <MailClient
          messages={state.mail || []}
          onRead={(id) => onAction('READ_EMAIL', { id })}
          onClose={() => setIsMailOpen(false)}
        />
      ) : (
        <>
          {/* Archive Cabinets Section */}
          <div className="p-5 border border-emerald-900/60 bg-black/40">
            <h4 className="text-[10px] text-emerald-500 uppercase mb-4 font-bold tracking-widest border-l-2 border-emerald-600 pl-3">
              Archive Cabinets
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton
                label="Search Manuals"
                onClick={() => onAction('SEARCH_MANUALS')}
                cost={{ label: 'FOCUS', value: 5 }}
                description="Scavenge for vintage manuals or PC parts."
              />
              <ActionButton
                label="Create SRF Form"
                onClick={() => onAction('CREATE_SRF')}
                cost={{ label: 'FOCUS', value: 10 }}
                description="Log structural repairs for credits."
              />
              <ActionButton
                label="Alter Documents"
                onClick={() => onAction('ALTER_DOCUMENTS')}
                cost={{ label: 'FOCUS', value: 30 }}
                description="HIGH RISK. Falsify a minor log entry to cover a mistake or create an opportunity. High suspicion gain."
                className="border-amber-800 text-amber-500"
              />
              <ActionButton
                label="Destroy Documents"
                onClick={() => onAction('DESTROY_DOCUMENTS')}
                cost={{ label: 'FOCUS', value: 20 }}
                description="EXTREME RISK. Shred compromising paperwork. Clears your conscience but leaves a digital trail. May reveal hidden information."
                className="border-red-800 text-red-500"
              />
              {state.inventory.hasAPLicense && (
                <ActionButton
                  label="Cross-Reference Manifests"
                  onClick={() => onAction('CROSS_REFERENCE_MANIFESTS')}
                  cost={{ label: 'FOCUS', value: 50 }}
                  description="HIGH RISK. Compare official manifests with hangar logs. Gain a Kardex Fragment but draw significant attention."
                  className="border-red-800 text-red-500 col-span-2"
                />
              )}
            </div>
            <div className="mt-4 border-t border-emerald-900/20 pt-4">
              <ActionButton
                label="Maintain Low Profile"
                onClick={() => onAction('MAINTAIN_LOW_PROFILE')}
                cost={{ label: 'FOCUS', value: 40 }}
                cooldown={60000}
                description="Spend time meticulously aligning your records and covering your tracks. Reduces suspicion."
                className="border-amber-800 text-amber-500"
              />
            </div>
            <p className="mt-3 text-[8px] text-emerald-900 uppercase italic">
              Dusty cabinets filled with Boeing 737 and Airbus A320 diagrams from the 90s.
            </p>
          </div>

          {/* Zebra Computer Section */}
          <div className="p-5 border border-emerald-900/60 bg-black/40">
            <h4 className="text-[10px] text-emerald-500 uppercase mb-4 font-bold tracking-widest border-l-2 border-emerald-600 pl-3">
              Zebra MC9300 Terminal
            </h4>
            <p className="text-[9px] text-emerald-800 mb-4 italic">
              A ruggedized handheld computer for accessing the Maintenance Log & Archive. Standard
              issue.
            </p>
            <ActionButton
              label="Access Maintenance Logs"
              onClick={() => onAction('OPEN_MAINTENANCE_TERMINAL')}
              description="Log into the Maintenance Log & Archive (MLA) to search for technical documents and past repair records."
            />
          </div>

          {/* Networked Printer */}
          <div className="p-5 border border-emerald-900/60 bg-black/40">
            <h4 className="text-[10px] text-emerald-500 uppercase mb-4 font-bold tracking-widest border-l-2 border-emerald-600 pl-3">
              Networked Laser Printer
            </h4>
            <ActionButton
              label="Inspect Output Tray"
              onClick={() => onAction('INSPECT_PRINTER')}
              cost={{ label: 'FOCUS', value: 2 }}
              cooldown={30000}
              description="It's been printing random pages all night. Sometimes it prints things that weren't sent."
            />
            {state.resources.level >= 22 && (
              <ActionButton
                label="Print [REDACTED] Page"
                onClick={() => onAction('PRINT_FORBIDDEN_PAGE')}
                cost={{ label: 'FOCUS', value: 15 }}
                description="Force the printer to output the cached file 'DO_NOT_READ.txt'."
                className="border-red-600 text-red-500 mt-2"
              />
            )}
          </div>

          {/* Data Analytics Station */}
          {(state.resources.fdrData > 0 ||
            state.resources.aimsData > 0 ||
            state.resources.flightComputerMemory > 0) && (
            <div className="p-5 border border-blue-900/60 bg-blue-950/10 mb-0">
              <h4 className="text-[10px] text-blue-400 uppercase mb-4 font-bold tracking-widest border-l-2 border-blue-600 pl-3">
                Flight Data Analysis
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-[10px] text-blue-200">
                  <div className="flex justify-between border-b border-blue-900/30 pb-1 mb-1">
                    <span>FDR RAW DATA:</span>
                    <span className="font-mono text-blue-400">{state.resources.fdrData} UNITS</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-900/30 pb-1 mb-1">
                    <span>AIMS MEMORY:</span>
                    <span className="font-mono text-blue-400">
                      {state.resources.aimsData} UNITS
                    </span>
                  </div>
                </div>
                <ActionButton
                  label="Analyze Data Telemetry"
                  onClick={() => onAction('ANALYZE_DATA')}
                  cost={{ label: 'FOCUS', value: 20 }}
                  description="Process raw data for patterns. Generates XP and Credits. May reveal... anomalies."
                  className="border-blue-700/50 text-blue-300 hover:bg-blue-900/20"
                />
              </div>
            </div>
          )}

          {/* PC Assembly Section */}
          <div className="p-5 border border-emerald-900/60 bg-black/60 relative overflow-hidden">
            <h4 className="text-[10px] text-emerald-500 uppercase mb-4 font-bold tracking-widest border-l-2 border-emerald-600 pl-3">
              Windows XP Workstation
            </h4>

            {!inv.pcAssembled ? (
              <div className="space-y-4 flex flex-col items-center">
                <pre className="text-[6px] text-emerald-900 leading-[7px] text-left w-fit">
                  {`                         .,,uod8B8bou,,.
                ..,uod8BBBBBBBBBBBBBBBBRPFT?l!i:.
           ||||||||||||||!?TFPRBBBBBBBBBBBBBBB8m=,
           ||||   '""^^!!||||||||||TFPRBBBVT!:...!
           ||||            '""^^!!|||||?!:.......!
           ||||                     ||||.........!
           ||||                     ||||.........!
           ||||                     ||||.........!
           ||||                     ||||.........!
           ||||                     ||||.........!
           ||||                     ||||.........!
           ||||,                    ||||.........\\\`
           |||||!!-._               ||||.......;.
           ':!|||||||||!!-._        ||||.....bBBBBWdou,.
         bBBBBB86foi!|||||||!!-..:|||!..bBBBBBBBBBBBBBBY!
         ::!?TFPRBBBBBB86foi!||||||||!!bBBBBBBBBBBBBBBY..!
         :::::::::!?TFPRBBBBBB86ftiaabBBBBBBBBBBBBBBY....!
         :::;\\\`"^!:;::::::!?TFPRBBBBBBBBBBBBBBBBBBBY......!
         ;::::::...''^::::::::::!?TFPRBBBBBBBBBBY........!
     .ob86foi;::::::::::::::::::::::::!?TFPRBY..........\\\`
    .b888888888886foi;:::::::::::::::::::::::..........\\\`
 .b888888888888888888886foi;::::::::::::::::..........
.b888888888888888888888888888886foi;:::::::::......\\\`
!Tf998888888888888888888888888888888886foi;:::....\\\`
  '"^!|Tf9988888888888888888888888888888888!::..\\\`
       '"^!|Tf998888888888888888888888889!! '\\\`
             '"^!|Tf9988888888888888888!!\\\`            iBBbo.
                  '"^!|Tf998888888889!\\\`             WBBBBbo.
                        '"^!|Tf9989!\\\`              YBBBP^'
                              '"^!\\\`               \\\`
`}
                </pre>
                <p className="text-[9px] text-emerald-700 uppercase">
                  Parts Found: {pcPartsCount}/4
                </p>
                <ActionButton
                  label="ASSEMBLY COMPUTER"
                  onClick={() => onAction('ASSEMBLE_PC')}
                  disabled={pcPartsCount < 4}
                  cost={{ label: 'FOCUS', value: 20 }}
                  className={pcPartsCount === 4 ? 'border-blue-600 text-blue-400' : ''}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <ActionButton
                    label="Search AMM"
                    onClick={() => onAction('DIGITAL_STUDY')}
                    cost={{ label: 'FOCUS', value: 5 }}
                    className="border-blue-900 text-blue-400"
                  />
                  <ActionButton
                    label="Boeing Support"
                    onClick={() => onAction('BOEING_SUPPORT')}
                    cost={{ label: 'FOCUS', value: 15 }}
                    className="border-red-900 text-red-500"
                  />
                  {state.resources.level >= 22 && (
                    <ActionButton
                      label="Decrypt Encrypted Partition"
                      onClick={() => onAction('DECRYPT_AMM')}
                      cost={{ label: 'FOCUS', value: 40 }}
                      description="Attempt to decrypt the hidden partition on the hard drive. High risk of failure."
                      className="border-purple-900 text-purple-400 col-span-2"
                    />
                  )}
                </div>

                {/* Internal Mail */}
                <div className="mt-6 border-t border-emerald-900/30 pt-4">
                  <h5 className="text-[9px] text-emerald-600 uppercase mb-3 font-bold tracking-widest">
                    Internal Mail Client
                  </h5>
                  <ActionButton
                    label={`Check Internal Mail (${unreadMailCount})`}
                    onClick={() => {
                      play('CLICK');
                      setIsMailOpen(true);
                      onAction('CHECK_INTERNAL_MAIL');
                    }}
                    cost={{ label: 'FOCUS', value: 2 }}
                    description="Access the internal network. New messages may contain warnings, policy updates, or... something else."
                    className={unreadMailCount > 0 ? 'glow-pulse-border' : ''}
                  />
                </div>

                {/* System Maintenance */}
                <div className="mt-6 border-t border-emerald-900/30 pt-4">
                  <h5 className="text-[9px] text-emerald-600 uppercase mb-3 font-bold tracking-widest">
                    System Maintenance
                  </h5>
                  <ActionButton
                    label="Review Surveillance Logs"
                    onClick={() => onAction('REVIEW_SURVEILLANCE_LOGS')}
                    cost={{ label: 'FOCUS', value: 50 }}
                    description="HIGH RISK. Access the workshop's low-res surveillance archives. High suspicion gain."
                    className="border-amber-800 text-amber-500"
                  />
                  <ActionButton
                    label="Deep Clean Server Vents"
                    onClick={() => onAction('DEEP_CLEAN_VENTS')}
                    cost={{ label: 'FOCUS', value: 15 }}
                    description="A mundane task. Clear out the dust from the server rack. You never know what you'll find."
                  />
                </div>

                {/* PC Upgrades Sub-section */}
                <div className="mt-6 border-t border-emerald-900/30 pt-4">
                  <h5 className="text-[9px] text-emerald-600 uppercase mb-3 font-bold tracking-widest">
                    Hardware Upgrades
                  </h5>
                  <div className="grid grid-cols-1 gap-2">
                    {!inv.pcGpuUpgrade && (
                      <ActionButton
                        label="Upgrade GPU"
                        onClick={() => onAction('UPGRADE_PC_GPU')}
                        cost={{ label: 'CR', value: 250 }}
                        description="Install GeForce 256. +5% Search Manuals Success."
                      />
                    )}
                    {!inv.pcHddUpgrade && (
                      <ActionButton
                        label="Upgrade HDD"
                        onClick={() => onAction('UPGRADE_PC_HDD')}
                        cost={{ label: 'CR', value: 150 }}
                        description="Install 40GB Maxtor. +5% Search Manuals Success & More XP from findings."
                      />
                    )}
                    {inv.pcGpuUpgrade && inv.pcHddUpgrade && (
                      <div className="text-[8px] text-emerald-900 uppercase italic text-center py-2 border border-emerald-900/20">
                        Hardware fully optimized for high-speed archival retrieval.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Staff Delegation */}
          <div className="p-5 border border-emerald-900/60 bg-black/40 relative">
            <h4 className="text-[10px] text-emerald-500 uppercase mb-4 font-bold tracking-widest">
              Automation Control
            </h4>
            {!state.inventory.hasAPLicense ? (
              <div className="text-[9px] text-red-900 uppercase italic border border-red-900/20 p-3 bg-red-950/5">
                [ UNLOCK REQUIRED: A&P License required for staff delegation ]
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex justify-between items-center bg-emerald-950/10 p-3 border border-emerald-900/30">
                  <div>
                    <p className="text-[10px] text-emerald-400 uppercase font-bold">
                      Night Shift Delegation
                    </p>
                    <p className="text-[8px] text-emerald-700 uppercase mt-1">
                      +4.0 Alclad/s | +9.0 Rivets/s
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      play('CLICK');
                      onAction('TOGGLE_NIGHT_CREW');
                    }}
                    className={`px-5 py-2 border text-[10px] font-bold transition-all duration-300 ${state.flags.nightCrewActive ? 'bg-red-950 border-red-600 text-red-500 animate-pulse' : 'bg-emerald-900/40 border-emerald-600 text-emerald-400 hover:bg-emerald-800'}`}
                  >
                    {state.flags.nightCrewActive ? 'ABORT' : 'DELEGATE'}
                  </button>
                </div>
                <div className="flex justify-between items-center bg-emerald-950/10 p-3 border border-emerald-900/30">
                  <div>
                    <p className="text-[10px] text-emerald-400 uppercase font-bold">
                      Transit Check Dispatch
                    </p>
                    <p className="text-[8px] text-emerald-700 uppercase mt-1">
                      +1.5 CR/s | +5 XP/s | +Slight Risk
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      play('CLICK');
                      onAction('TOGGLE_TRANSIT_CHECK_DELEGATION');
                    }}
                    className={`px-5 py-2 border text-[10px] font-bold transition-all duration-300 ${state.flags.transitCheckDelegationActive ? 'bg-red-950 border-red-600 text-red-500 animate-pulse' : 'bg-emerald-900/40 border-emerald-600 text-emerald-400 hover:bg-emerald-800'}`}
                  >
                    {state.flags.transitCheckDelegationActive ? 'RECALL' : 'DISPATCH'}
                  </button>
                </div>
                <div className="flex justify-between items-center bg-emerald-950/10 p-3 border border-emerald-900/30">
                  <div>
                    <p className="text-[10px] text-emerald-400 uppercase font-bold">
                      Auto-File SRF Forms
                    </p>
                    <p className="text-[8px] text-emerald-700 uppercase mt-1">
                      +0.8 CR/s | +2 XP/s | +Moderate Risk
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      play('CLICK');
                      onAction('TOGGLE_AUTO_SRF');
                    }}
                    className={`px-5 py-2 border text-[10px] font-bold transition-all duration-300 ${state.flags.autoSrfActive ? 'bg-red-950 border-red-600 text-red-500 animate-pulse' : 'bg-emerald-900/40 border-emerald-600 text-emerald-400 hover:bg-emerald-800'}`}
                  >
                    {state.flags.autoSrfActive ? 'CEASE' : 'AUTOMATE'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {/* Endgame Options */}
      {(state.resources.suspicion < 10 && state.inventory.foundRetiredIDCard) ||
      state.resources.sanity < 15 ? (
        <div className="p-5 border border-purple-900/60 bg-purple-950/20 mt-8 relative overflow-hidden">
          <h4 className="text-[10px] text-purple-400 uppercase mb-4 font-bold tracking-widest border-l-2 border-purple-600 pl-3">
            Final Protocols
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {state.resources.suspicion < 10 && state.inventory.foundRetiredIDCard && (
              <ActionButton
                label="Accept Recruitment Offer"
                onClick={() => onAction('TRIGGER_GOVT_ENDING')}
                description="The Suits have been watching. They are impressed. Leave the hangar behind."
                className="border-blue-500 text-blue-400"
              />
            )}
            {state.resources.sanity < 15 && (
              <ActionButton
                label="Surrender to the Noise"
                onClick={() => onAction('TRIGGER_CRAZY_ENDING')}
                description="It's too loud. It's too bright. Just let go."
                className="border-emerald-500 text-emerald-400 animate-pulse"
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OfficeTab;
