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
];
