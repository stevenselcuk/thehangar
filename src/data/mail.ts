import { MailMessage } from '../types';

export const mailData: Omit<MailMessage, 'id' | 'read'>[] = [
  {
    from: 'HR_AUTOMATION',
    subject: 'Biometric Shift Monitoring',
    body: 'To ensure compliance with new operational efficiency standards, your heart rate and galvanic skin response will now be passively logged for managerial review. Thank you for your cooperation.',
    effects: { suspicion: 10, sanity: -5 },
  },
  {
    from: 'xX_whistleblower_Xx',
    subject: 'They are listening.',
    body: "Don't trust the radios after 3 AM. They use the static to hide their communications. The parts you're installing... they aren't for flying. They're for something else. Be careful.",
    effects: { sanity: -10 },
  },
  {
    from: 'SYSTEM_MONITOR',
    subject: 'ALERT: Power Fluctuation Sector 41',
    body: 'Unscheduled power draw detected from Hangar Bay 4, Section 41. The draw signature does not match any known equipment profiles. Please disregard unless physical manifestations occur.',
    effects: { suspicion: 5 },
  },
  {
    from: 'HR_AUTOMATION',
    subject: 'Policy Update: Personal Item Audits',
    body: 'To maintain a sterile work environment, random audits of personal lockers and vehicles may be conducted without prior notice. Prohibited items now include non-standard documentation and recording devices.',
    effects: { suspicion: 15 },
  },
  {
    from: 'xX_whistleblower_Xx',
    subject: 'Kardex',
    body: "The real manifests aren't in the filing cabinets. They're in a digital system called the Kardex. It's old, encrypted. The access keys are fragmented. You'll have to find them by cross-referencing the logs they tried to erase.",
    effects: {},
  },
  {
    from: 'THE_DIRECTOR',
    subject: 'RE: Temporal Compliance',
    body: 'All staff are reminded that arriving before you leave is a disciplinary matter. Review your clock-in records for Q3. If your records do not yet exist, submit them by end of shift.',
    effects: { suspicion: 5 },
  },
  {
    from: 'HR_AUTOMATION',
    subject: 'URGENT: Reclassification of Workspace',
    body: 'The hangar has been reclassified as a Tier-3 Liminal Space effective immediately. Update your emergency binders to reflect the new egress protocols. No physical copy of Protocol 3L has been issued; you are expected to intuit it.',
    effects: { sanity: -5, suspicion: 5 },
  },
  {
    from: 'THE_DIRECTOR',
    subject: 'Q3 Anomaly Production — Commendation',
    body: 'The Director is pleased with Q3 anomaly output. Bonuses for this cycle will be issued in crystalline resonators. If you do not know how to spend them, you will be briefed when management determines you need to be.',
    effects: { crystallineResonators: 1 },
  },
  {
    from: 'HR_AUTOMATION',
    subject: 'Policy 7-G: Memory Formation',
    body: 'Policy 7-G prohibits the independent formation of memory during company hours. This message does not count as a memory. Your acknowledgement of this message is not something you will recall. Thank you for your compliance.',
    effects: { sanity: -10 },
  },
  {
    from: 'RECORDS_DEPT',
    subject: 'Missing Shift — March',
    body: "The shift from March 14th no longer requires incident reporting. It has been absorbed into the operational record under ref. [ABSORBED]. Do not refer to it as 'the missing shift'. There was no missing shift.",
    effects: { suspicion: 10, sanity: -5 },
  },
  {
    from: 'FACILITIES',
    subject: 'FYI: East Wing Emergency Exits',
    body: 'The emergency exits on the east side now open inward. The direction of the space beyond them has not been confirmed. Facilities is aware. Do not prop them open.',
    effects: { sanity: -5 },
  },
  {
    from: 'HR_AUTOMATION',
    subject: 'Employee of the Month — Programme Suspension',
    body: "The Employee of the Month programme has been suspended pending an internal investigation into the definition of 'Employee'. Your nominations for November have been received and are being held in escrow.",
    effects: { suspicion: 5 },
  },
  {
    from: 'THE_DIRECTOR',
    subject: 'ATTENTION: Efficiency Consultant',
    body: 'An Efficiency Consultant has been retained to observe operations. Do not make eye contact. This is for his comfort, not yours. His findings will inform the next round of restructuring. He has already concluded his findings.',
    effects: { suspicion: 10, sanity: -5 },
  },
  {
    from: 'RECORDS_DEPT',
    subject: 'Soul Coherence Index — Q3 Scores Available',
    body: 'New KPI metric effective immediately: Soul Coherence Index (SCI). Q3 scores are now viewable in the self-service HR portal. Scores below 40% will be reviewed by management. The portal requires your soul weight to log in.',
    effects: { suspicion: 10 },
  },
  {
    from: 'THE_DIRECTOR',
    subject: 'FYI: The Arrangement',
    body: "If you have not yet been debriefed on The Arrangement, you already have. If this message confuses you, that is expected. If it doesn't, please report to management immediately. Do not reply to this address.",
    effects: { sanity: -10, suspicion: 15 },
  },
];
