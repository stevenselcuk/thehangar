import { GameEvent } from '../types.ts';

type EventTemplates = Omit<GameEvent, 'timeLeft'>;

export const managementEvents: EventTemplates[] = [
  // ─── EVENT 01 ────────────────────────────────────────────────────────────
  // The Director summons you via the interphone
  {
    id: 'MGMT_DIRECTOR_SUMMONS',
    type: 'management',
    title: 'The Interphone',
    description:
      'The interphone on the wall crackles to life. A voice — flat, neither warm nor cold — simply says your name. Nothing else. The call light stays on. It is waiting.',
    totalTime: 30000,
    choices: [
      {
        id: 'go_now',
        label: "Report to the Director's Office",
        cost: { resource: 'focus', amount: 20 },
        nextEventId: 'MGMT_DIRECTORS_OFFICE',
        log: 'You set down your tools and walk to the office at the end of the corridor. The door is already open.',
      },
      {
        id: 'delay',
        label: 'Finish your task first',
        cost: { resource: 'sanity', amount: 10 },
        effects: { suspicion: 15 },
        log: 'You finish what you were doing. The interphone stops crackling. The silence is worse.',
      },
    ],
    failureOutcome: {
      log: 'The interphone goes dead. A hand-delivered note appears under your toolbox that reads: "Your absence has been noted. An absence cannot be un-noted."',
      effects: { suspicion: 25, sanity: -10 },
    },
  },

  // ─── EVENT 02 ────────────────────────────────────────────────────────────
  // The Director's Office (chained from EVENT 01 choice 1)
  {
    id: 'MGMT_DIRECTORS_OFFICE',
    type: 'management',
    title: "The Director's Office",
    description:
      "The Director sits behind a desk that is too large for the room. He does not look up from a ledger you cannot read. He says: 'There is a discrepancy.' He does not elaborate. He waits.",
    totalTime: 45000,
    choices: [
      {
        id: 'admit',
        label: 'Acknowledge the discrepancy',
        cost: { resource: 'sanity', amount: 15 },
        effects: { suspicion: -10, experience: 200 },
        log: 'You say you understand. You do not understand. He nods once. You are dismissed. You feel, briefly, forgiven — though you cannot name the transgression.',
      },
      {
        id: 'ask',
        label: 'Ask what the discrepancy is',
        cost: { resource: 'focus', amount: 15 },
        effects: { suspicion: 5, sanity: -10 },
        log: "He looks up. His expression does not change. He says: 'The appropriate question is not what. It is when.' He closes the ledger. You are dismissed. Outside, it is darker than it was.",
      },
      {
        id: 'deny',
        label: 'State that everything is in order',
        effects: { suspicion: 20, sanity: -5 },
        nextEventId: 'MGMT_PIP_NOTICE',
        log: 'Something shifts in the room. The Director makes a note. You are dismissed. There is a form under your windshield wiper when you reach the car park.',
      },
    ],
    failureOutcome: {
      log: "You say nothing. The silence goes on long enough to become architectural. 'Very well,' he says. You are escorted out by someone you did not see arrive.",
      effects: { suspicion: 30, sanity: -15 },
    },
  },

  // ─── EVENT 03 ────────────────────────────────────────────────────────────
  // PIP Notice (chained from EVENT 02 denial / EVENT 11 failure)
  {
    id: 'MGMT_PIP_NOTICE',
    type: 'management',
    title: 'Performance Improvement Plan',
    description:
      'A Performance Improvement Plan has been left in your toolbox. It is dated six weeks from now. The objectives section lists things you have not yet done. The sign-off line is already signed — by you.',
    totalTime: 50000,
    choices: [
      {
        id: 'sign',
        label: 'Counter-sign and return the PIP',
        cost: { resource: 'sanity', amount: 20 },
        effects: { suspicion: -5 },
        log: 'You sign your name in the space beside your name. HR acknowledges receipt. Nothing else changes, except that you now know you are being watched by someone who has already seen how this ends.',
      },
      {
        id: 'query',
        label: "Query the objectives — they haven't happened yet",
        cost: { resource: 'focus', amount: 25 },
        effects: { sanity: -15, experience: 300 },
        log: "HR responds by email within minutes. The email reads: 'They will have happened by then.' The email is timestamped three days ago.",
      },
      {
        id: 'shred',
        label: 'Shred the document',
        effects: { suspicion: 30, sanity: -10 },
        log: 'A replacement copy appears in its place before you reach the bin. It is laminated.',
      },
    ],
    failureOutcome: {
      log: 'The PIP auto-escalates. An email arrives: "Failure to engage with the PIP process is itself a PIP objective." Your file is updated. The update describes this moment.',
      effects: { suspicion: 35, sanity: -20 },
    },
  },

  // ─── EVENT 04 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_EFFICIENCY_CONSULTANT_ARRIVES',
    type: 'management',
    title: 'The Efficiency Consultant',
    description:
      'He is standing in the bay. He has a clipboard. He has not written anything down, but the clipboard looks used. He is watching you specifically. He does not blink at a normal rate.',
    totalTime: 40000,
    choices: [
      {
        id: 'work_normally',
        label: 'Continue working normally',
        cost: { resource: 'focus', amount: 20 },
        effects: { experience: 150, suspicion: 5 },
        log: 'You work. He observes. When you look up, he has moved three metres to the left without having walked there. He writes something on the clipboard. You decide not to think about it.',
      },
      {
        id: 'acknowledge',
        label: 'Nod in acknowledgement',
        cost: { resource: 'sanity', amount: 10 },
        effects: { suspicion: 10, sanity: -5 },
        log: 'You nod. He returns it — a fraction of a second too late. His expression does not change during or after the nod. The nod should not have been unsettling. It was.',
      },
      {
        id: 'leave_bay',
        label: 'Move to a different bay',
        cost: { resource: 'focus', amount: 15 },
        effects: { suspicion: 15 },
        log: 'You move to Bay 6. He is already there. He did not walk there. He is looking at where you were standing.',
      },
    ],
    failureOutcome: {
      log: 'Analysis complete. The Efficiency Consultant files his report. Line 7 reads: "Temporal compliance: marginal." Line 8 is in a language that was not allowed after 1987.',
      effects: { suspicion: 20, sanity: -15 },
    },
  },

  // ─── EVENT 05 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_MANDATORY_SENSITISATION',
    type: 'management',
    title: 'Mandatory Re-Sensitisation Training',
    description:
      "HR has enrolled you in mandatory re-sensitisation training. The module is called 'Affective Compliance in Liminal Work Environments'. Duration: 4 hours. The instructor is the same person as last year, but they have a different name now.",
    totalTime: 55000,
    choices: [
      {
        id: 'attend',
        label: 'Attend and complete the module',
        cost: { resource: 'focus', amount: 30 },
        effects: { suspicion: -10, sanity: -5, experience: 100 },
        log: 'You attend. The content is familiar from a dream you have not had yet. You pass the assessment. The certificate expires yesterday.',
      },
      {
        id: 'query_eligibility',
        label: 'Query why you have been enrolled',
        cost: { resource: 'focus', amount: 15 },
        effects: { suspicion: 10 },
        log: 'HR replies: "Enrolment criteria are determined algorithmically. The algorithm does not accept queries." A second enrolment confirmation arrives while you are reading the first.',
      },
      {
        id: 'skip',
        label: 'Skip the training',
        effects: { suspicion: 25, sanity: -10 },
        log: 'The skip is flagged. You are auto-enrolled in a follow-up module: "Why Skipping Mandatory Training Is Itself a Sensitisation Issue."',
      },
    ],
    failureOutcome: {
      log: 'Non-completion noted. Your personnel file now has a section called "Affective Resistance". You did not put that there.',
      effects: { suspicion: 30, sanity: -20 },
    },
  },

  // ─── EVENT 06 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_ORG_CHART_ANOMALY',
    type: 'management',
    title: 'The Org Chart',
    description:
      'The updated org chart has been posted on the noticeboard. Several roles are listed as reporting to a position titled [SUSPENDED]. Three names you recognise appear twice. Your own name is in a box with no lines connecting it to anything.',
    totalTime: 35000,
    choices: [
      {
        id: 'report_error',
        label: 'Report the error to HR',
        cost: { resource: 'focus', amount: 10 },
        effects: { suspicion: 10 },
        log: 'HR replies: "That is not an error." No further information is provided. Your box remains disconnected. You suspect this is better than the alternative.',
      },
      {
        id: 'investigate',
        label: 'Cross-reference the previous org chart',
        cost: { resource: 'focus', amount: 20 },
        effects: { sanity: -10, experience: 250 },
        log: 'The previous chart does not exist in the archives. The archivist says it never did. The archivist is listed twice on the new chart.',
      },
      {
        id: 'ignore',
        label: 'Ignore it and return to work',
        effects: { suspicion: 5, sanity: 5 },
        log: 'Smart. The chart will be revised again before anyone acts on it. Your box grows a small dotted line overnight. Where it leads has not been confirmed.',
      },
    ],
    failureOutcome: {
      log: 'The chart is removed overnight. A new one goes up. Your name is listed under a position called "Unallocated Resonance". The Director signs off on payroll under that heading.',
      effects: { suspicion: 15, sanity: -10 },
    },
  },

  // ─── EVENT 07 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_BUDGET_FREEZE',
    type: 'management',
    title: 'Budget Freeze Notification',
    description:
      "A memo has been circulated: all discretionary purchases are frozen pending a budget review. The memo's header date is four months ago. Parts you ordered last week are now on hold. The aircraft is not on hold. It is waiting.",
    totalTime: 50000,
    choices: [
      {
        id: 'improvise',
        label: 'Improvise with existing stock',
        cost: { resource: 'focus', amount: 30 },
        effects: { experience: 200, sanity: -5 },
        log: 'You work with what you have. It is not ideal. The aircraft holds together. Sometimes competence is just delayed catastrophe with better paperwork.',
      },
      {
        id: 'escalate',
        label: 'Escalate the AOG situation to management',
        cost: { resource: 'focus', amount: 15 },
        effects: { suspicion: 10 },
        log: 'Management acknowledges the AOG. An approval chain is initiated. The chain has seven links. Four of them are listed under [SUSPENDED] on the org chart.',
      },
      {
        id: 'approve_anyway',
        label: 'Approve the purchase anyway and document it',
        cost: { resource: 'credits', amount: 50 },
        effects: { suspicion: -5, experience: 150 },
        log: 'You cover it from your own account and document every step. Finance sends an acknowledgement. Finance also sends a query. The query is about the documentation.',
      },
    ],
    failureOutcome: {
      log: 'The aircraft remains grounded. A review meeting is scheduled. You are invited to the meeting. The invite lists you as "Item 4: AOG Accountability". You are not allowed to speak during Item 4.',
      effects: { suspicion: 20, sanity: -10 },
    },
  },

  // ─── EVENT 08 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_SOUL_COHERENCE_REVIEW',
    type: 'management',
    title: 'SCI Review Notice',
    description:
      'You have received a notification from the HR portal: your Soul Coherence Index score for Q3 is 38%. This falls below the 40% threshold. You are invited to schedule a review meeting. The portal will not let you log out until you confirm the booking.',
    totalTime: 45000,
    choices: [
      {
        id: 'book_meeting',
        label: 'Book the review meeting',
        cost: { resource: 'sanity', amount: 15 },
        effects: { suspicion: -10 },
        log: 'You book the meeting. The time slot is 3:17 AM on a day that does not appear in the February calendar. A confirmation arrives immediately. It says: "We look forward to your improvement."',
      },
      {
        id: 'contest_metric',
        label: 'Contest the SCI metric via the appeals process',
        cost: { resource: 'focus', amount: 25 },
        effects: { sanity: -10, experience: 200 },
        log: 'The appeals form requires your baseline SCI score from onboarding. Your onboarding file predates your employment by three years. The value cannot be located. The appeal is denied.',
      },
      {
        id: 'ignore',
        label: 'Close the portal and return to work',
        effects: { suspicion: 20, sanity: 5 },
        log: 'The portal reminds you of the uncompleted action fourteen times over three days. On the fifteenth reminder, it stops. This is not reassuring.',
      },
    ],
    failureOutcome: {
      log: 'Non-engagement with the SCI review process has been escalated. A revised score of 22% has been issued reflecting the non-engagement. Management has been notified.',
      effects: { suspicion: 30, sanity: -20 },
    },
  },

  // ─── EVENT 09 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_ALL_HANDS_MEETING',
    type: 'management',
    title: 'All-Hands Meeting',
    description:
      "An all-hands meeting has been called for 0800. Attendance is mandatory. The agenda lists one item: 'The Future.' The meeting room has chairs for everyone. There are more chairs than staff. There are exactly the right number of mugs.",
    totalTime: 40000,
    choices: [
      {
        id: 'attend_front',
        label: 'Attend and sit near the front',
        cost: { resource: 'focus', amount: 20 },
        effects: { suspicion: -10, experience: 150 },
        log: "The Director walks to the front. He says: 'The future is being managed.' He sits down. The meeting ends. Coffee is served. The coffee is warm before it was poured.",
      },
      {
        id: 'attend_back',
        label: 'Attend and sit at the back',
        cost: { resource: 'sanity', amount: 10 },
        effects: { suspicion: 5 },
        log: "From the back you can see things others cannot: the extra chairs, the door that wasn't there last week, and the man in the corner who is neither attending the meeting nor absent from it.",
      },
      {
        id: 'arrive_late',
        label: 'Arrive late',
        effects: { suspicion: 15, sanity: -5 },
        log: 'You arrive eleven minutes late. The Director pauses mid-sentence, looks directly at you, and resumes without commenting. The pause lasted exactly eleven minutes.',
      },
    ],
    failureOutcome: {
      log: 'Your absence is noted in the minutes. The minutes are emailed to all staff. The minutes include a line that reads: "Absent: [your name]. Will be addressed." No further context is provided.',
      effects: { suspicion: 20, sanity: -10 },
    },
  },

  // ─── EVENT 10 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_SHIFT_PATTERN_CHANGE',
    type: 'management',
    title: 'Revised Shift Pattern',
    description:
      'A new shift schedule has been posted. You are now assigned to a shift that runs from 2200 to 0600, then from 0600 to 1400, then from 1400 to 2200 on the same day. HR has noted that this exceeds legal limits but has flagged it as an administrative anomaly pending review.',
    totalTime: 50000,
    choices: [
      {
        id: 'comply',
        label: 'Start the first shift as scheduled',
        cost: { resource: 'sanity', amount: 20 },
        effects: { experience: 200, health: -15 },
        log: 'You work the first shift. It ends when it is supposed to. The next shift begins before you reach the car park. This continues for reasons that are not explained but are clearly deliberate.',
      },
      {
        id: 'union',
        label: 'Contact the union rep',
        cost: { resource: 'focus', amount: 15 },
        effects: { suspicion: -5, unionReputation: 10 },
        log: "The union rep is sympathetic. She describes the schedule as 'creative'. She raises a formal query. The response from HR takes eight minutes and is four sentences long, none of which address working hours.",
      },
      {
        id: 'query_hr',
        label: 'Query whether this is a typo',
        effects: { suspicion: 10 },
        log: "HR replies: 'It is not a typo. The shift pattern reflects operational needs across all observed timelines.' The reply is written on stationery from a rebranded entity that does not yet exist.",
      },
    ],
    failureOutcome: {
      log: 'Non-compliance with the new shift pattern has been recorded. Your contract is reviewed. The review finds the shift schedule was agreed by a previous version of yourself. There is a signature.',
      effects: { suspicion: 25, sanity: -15, health: -10 },
    },
  },

  // ─── EVENT 11 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_EFFICIENCY_CONSULTANT_REPORT',
    type: 'management',
    title: 'The Report',
    description:
      "The Efficiency Consultant has submitted his findings. HR has forwarded you a summary. It is three pages. Page one is your name repeated in different fonts. Page two is a graph with no axes. Page three recommends you be relocated to 'a role more appropriate to your resonance profile.'",
    totalTime: 45000,
    choices: [
      {
        id: 'accept',
        label: 'Accept the findings and request clarification on the new role',
        cost: { resource: 'sanity', amount: 20 },
        effects: { suspicion: -15, experience: 300 },
        log: 'HR confirms the new role will be communicated in due course. Due course arrives the following morning. The role is your current role. You have been reassigned to yourself.',
      },
      {
        id: 'dispute',
        label: 'Formally dispute the report',
        cost: { resource: 'focus', amount: 30 },
        effects: { suspicion: 10, sanity: -10 },
        nextEventId: 'MGMT_PIP_NOTICE',
        log: 'Your dispute is acknowledged. The Efficiency Consultant adds an appendix: "Subject displays adversarial engagement with the evaluation process." This becomes Objective 4 on a newly issued PIP.',
      },
      {
        id: 'find_consultant',
        label: 'Try to speak with the consultant directly',
        cost: { resource: 'focus', amount: 20 },
        effects: { sanity: -15 },
        log: 'Security informs you that the Efficiency Consultant completed his engagement and departed the facility. When he departed is not on record. One of the security team saw him leave. The other two saw him arrive twice.',
      },
    ],
    failureOutcome: {
      log: "Non-response to the report is itself noted in a follow-up appendix: 'Subject's silence is consistent with resonance profile.' HR considers the matter closed. It is not closed.",
      effects: { suspicion: 30, sanity: -15 },
    },
  },

  // ─── EVENT 12 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_POLICY_CLARIFICATION',
    type: 'management',
    title: 'Policy Clarification — Annex D',
    description:
      'An updated policy framework has been circulated. Annex D covers the spiritual governance of work performed on company property. Specifically, it addresses the routing of prayers, supplications, and ambient dread. All must be directed to the correct department.',
    totalTime: 35000,
    choices: [
      {
        id: 'read_annex',
        label: 'Read Annex D in full',
        cost: { resource: 'sanity', amount: 15 },
        effects: { experience: 200, suspicion: -5 },
        log: "Annex D is 17 pages. The correct department is listed as 'Spiritual Compliance (Non-Denominational), Corridor 9, Bay 4-Alpha'. Bay 4-Alpha has been sealed since the incident. The routing instructions assume you have a soul weight above 60kg.",
      },
      {
        id: 'skip',
        label: 'Sign and return the acknowledgement without reading',
        effects: { suspicion: -5, sanity: 5 },
        log: 'You sign. Most people sign. The acknowledgement counts as informed consent to the contents of Annex D. This will become relevant.',
      },
      {
        id: 'query_existence',
        label: 'Query whether Annex D applies to your contract',
        cost: { resource: 'focus', amount: 20 },
        effects: { suspicion: 10 },
        log: "Legal responds: 'Annex D applies universally under Clause 0 of the standard employment agreement. Clause 0 precedes the preamble. You acknowledged it before you were hired.'",
      },
    ],
    failureOutcome: {
      log: 'Non-acknowledgement of the policy update has been flagged. Your spiritual output for the quarter is being redirected to the general pool pending compliance confirmation.',
      effects: { suspicion: 20, sanity: -15 },
    },
  },

  // ─── EVENT 13 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_LOCKER_AUDIT',
    type: 'management',
    title: 'Random Locker Inspection',
    description:
      "HR has announced an unscheduled inspection of personal lockers and vehicles. Prohibited items now include non-standard documentation, recording devices, and 'items that emit information'. Your locker contains several things you did not put there.",
    totalTime: 40000,
    choices: [
      {
        id: 'open_locker',
        label: 'Open your locker for inspection',
        cost: { resource: 'sanity', amount: 15 },
        effects: { suspicion: 5 },
        log: 'The inspector examines your locker. She picks up an item you do not recognise. She says: "This is yours." She does not take it. She does not say anything further. You assume this is positive.',
      },
      {
        id: 'clear_locker',
        label: 'Clear the unknown items before they arrive',
        cost: { resource: 'focus', amount: 20 },
        effects: { sanity: -10, suspicion: -5 },
        log: 'The items you remove from your locker are heavy in a way that is not physical. You put them in the skip behind the canteen. They are in your locker when you return. They look clean.',
      },
      {
        id: 'refuse',
        label: 'Decline the inspection, citing rights',
        effects: { suspicion: 30, sanity: 5 },
        log: "HR cites Annex D, Clause 0, and a document you have never seen called 'The Pre-Employment Agreement Regarding Spatial Privacy'. The inspection proceeds regardless. Your rights are noted and filed.",
      },
    ],
    failureOutcome: {
      log: "Failure to cooperate with the inspection process has been logged. The items in your locker have been catalogued by the inspector. The catalogue has been entered into your file under 'Anomalous Possessions'.",
      effects: { suspicion: 35, sanity: -15 },
    },
  },

  // ─── EVENT 14 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_CORPORATE_VISITORS',
    type: 'management',
    title: 'Corporate Visit',
    description:
      'A group of visitors has arrived from head office. They wear suits. They do not speak to each other but always face the same direction. The Director greets them with visible relief. You have been asked to look busy.',
    totalTime: 30000,
    choices: [
      {
        id: 'look_busy',
        label: 'Work visibly and efficiently',
        cost: { resource: 'focus', amount: 25 },
        effects: { experience: 200, suspicion: -10 },
        log: 'You work hard and clearly. One of the visitors pauses at your bay. He does not say anything. He makes a mark in a small book. The Director exhales.',
      },
      {
        id: 'engage_visitors',
        label: 'Greet the visitors professionally',
        cost: { resource: 'sanity', amount: 10 },
        effects: { suspicion: 10, experience: 100 },
        log: "One of the visitors turns to face you. You greet them. He says: 'We are aware of you.' This is not a threat. This is not comfort. This is a statement of fact delivered with the intonation of neither.",
      },
      {
        id: 'avoid',
        label: 'Find a reason to be in a different bay',
        effects: { suspicion: 5 },
        log: 'You are in Bay 6. They are also in Bay 6. The Director looks at you with something that might be an apology. The visitors face the same direction. You are in that direction.',
      },
    ],
    failureOutcome: {
      log: "A low-suspension event. The visitors leave without incident. The Director sends a brief email: 'They noticed.' He does not clarify what they noticed, or whether this is good.",
      effects: { suspicion: 15 },
    },
  },

  // ─── EVENT 15 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_HEALTH_MONITORING',
    type: 'management',
    title: 'Biometric Monitoring Consent',
    description:
      'HR requires your signed consent to passive biometric logging as part of the new Affective Efficiency Programme. The consent form must be signed in biological ink. The form has already been signed by someone with your name.',
    totalTime: 45000,
    choices: [
      {
        id: 'sign',
        label: 'Sign the form',
        cost: { resource: 'sanity', amount: 10 },
        effects: { suspicion: 5 },
        log: 'You add your signature beneath the previous one. HR files both. Your baseline readings are established. The readings include data from two days ago, which was your day off.',
      },
      {
        id: 'revoke',
        label: 'Revoke the prior signature',
        cost: { resource: 'focus', amount: 20 },
        effects: { suspicion: 15, sanity: -5 },
        log: 'The revocation form requires a biometric signature. A biometric signature requires prior consent to biometric logging. HR notes the circularity with what sounds like fondness.',
      },
      {
        id: 'ignore',
        label: 'Discard the form',
        effects: { suspicion: 20 },
        log: 'Consent is recorded as granted on the basis of implied compliance. The implied compliance clause is in Annex D.',
      },
    ],
    failureOutcome: {
      log: 'Non-response to consent form has been logged. Monitoring continues under the pre-employment biometric agreement. Your resting heart rate is noted as unusually stable for someone in your situation.',
      effects: { suspicion: 25, sanity: -10 },
    },
  },

  // ─── EVENT 16 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_EXIT_INTERVIEW_COLLEAGUE',
    type: 'management',
    title: 'The Quiet Desk',
    description:
      "A colleague's desk has been cleared overnight. No announcement. No farewell. HR sends an email confirming they have 'transitioned to a new opportunity'. The opportunity is not named. The colleague's name is not in the email.",
    totalTime: 35000,
    choices: [
      {
        id: 'ask_around',
        label: 'Ask other colleagues what happened',
        cost: { resource: 'focus', amount: 15 },
        effects: { syndicateReputation: 5, sanity: -5 },
        log: "Three different people give three different names for who has left. All three names belong to people who are still here. Someone says: 'It's better not to map it.'",
      },
      {
        id: 'ask_hr',
        label: 'Ask HR for clarification',
        effects: { suspicion: 10 },
        log: "HR confirms the transition was voluntary. They confirm the colleague's start date and end date. The end date has not yet occurred. HR says: 'These things resolve themselves in time.'",
      },
      {
        id: 'leave_it',
        label: 'Return to work and leave it alone',
        effects: { sanity: 5, suspicion: -5 },
        log: 'Wise. The desk has someone at it by afternoon. New badge. Different face. Same posture. Something in the toolbox looks familiar.',
      },
    ],
    failureOutcome: {
      log: 'A note from HR: "Please refrain from discussing colleague transitions in the workplace. This contributes to instability of the resonance profile for the facility as a whole."',
      effects: { suspicion: 15, sanity: -10 },
    },
  },

  // ─── EVENT 17 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_WELFARE_CHECK',
    type: 'management',
    title: 'Management Welfare Check',
    description:
      "A welfare check form lands in your inbox. It is titled 'How Are You?' and contains a single checkbox: ☐ Fine. There is no 'Not Fine' option. There is a free-text field. Previous submissions from your account are visible in the history. You don't remember writing them.",
    totalTime: 40000,
    choices: [
      {
        id: 'tick_fine',
        label: 'Tick "Fine" and submit',
        effects: { suspicion: -10, sanity: 5 },
        log: 'Submitted. HR acknowledges receipt. A follow-up is scheduled for six months\' time. The calendar invite arrives for a date that is already in the past. The invite says "accepted".',
      },
      {
        id: 'read_previous',
        label: 'Read the previous submissions from your account',
        cost: { resource: 'sanity', amount: 20 },
        effects: { sanity: -15, experience: 300 },
        log: "The previous entries are coherent and specific. They describe events that have not happened yet with the emotional tone of hindsight. The last entry is dated tomorrow. It says: 'I should have ticked Fine.'",
      },
      {
        id: 'use_freetext',
        label: 'Use the free-text field honestly',
        cost: { resource: 'sanity', amount: 10 },
        effects: { sanity: -5, suspicion: 15 },
        log: 'HR flags the response for review. The review committee is three people. One of them is the Efficiency Consultant. One of them is you. One of them does not have a badge.',
      },
    ],
    failureOutcome: {
      log: 'Non-submission of the welfare check is logged as a potential indicator. The Occupational Health team has been notified. They will reach out in due course. Due course is already behind you.',
      effects: { suspicion: 20, sanity: -10 },
    },
  },

  // ─── EVENT 18 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_NEW_POLICY_ROLLOUT',
    type: 'management',
    title: 'Policy Framework Update — Cycle 7',
    description:
      "A revised policy framework has been issued. It supersedes all prior frameworks. It is 340 pages. Acknowledgement is required by end of shift. There is no summary. The Director notes in a covering email that 'most of it is unchanged'. The Director has not read most of it.",
    totalTime: 50000,
    choices: [
      {
        id: 'skim_and_sign',
        label: 'Skim the key sections and sign',
        cost: { resource: 'focus', amount: 20 },
        effects: { suspicion: -5, experience: 100 },
        log: 'You focus on the sections most likely to affect you. Section 7, Paragraph 4 says something important. You read it three times. Each time it says something different. You sign.',
      },
      {
        id: 'request_extension',
        label: 'Request an extension to review properly',
        cost: { resource: 'focus', amount: 10 },
        effects: { suspicion: 10 },
        log: 'HR grants an extension of one hour. You request that the extension begin after your shift ends. HR declines. The extension has already started.',
      },
      {
        id: 'sign_immediately',
        label: 'Sign without reading',
        effects: { suspicion: -15, sanity: -5 },
        log: 'You sign immediately. HR sends a commendation for "policy agility". You are now subject to the framework. You do not know what that means. This is, statistically, not different from before.',
      },
    ],
    failureOutcome: {
      log: 'Failure to acknowledge the policy framework by the deadline is itself addressed in the policy framework. In Section 31. You are now aware of Section 31.',
      effects: { suspicion: 25, sanity: -10 },
    },
  },

  // ─── EVENT 19 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_PAYROLL_QUERY',
    type: 'management',
    title: 'Payroll Irregularity',
    description:
      "This month's payslip includes a deduction labelled 'Temporal Adjustment: —3 working days'. Finance cannot explain it. The explanation is 'operational'. The money is not in your account. Three working days are also not in your memory of this month.",
    totalTime: 40000,
    choices: [
      {
        id: 'query_finance',
        label: 'Query the deduction with Finance',
        cost: { resource: 'focus', amount: 15 },
        effects: { suspicion: 5, credits: 30 },
        log: 'Finance re-runs the payroll. Two of the three days are reinstated. The third day, they say, "was not worked under any currently auditable timeline." They are apologetic but not confused.',
      },
      {
        id: 'accept_it',
        label: 'Accept the deduction and move on',
        effects: { sanity: 5, credits: -30 },
        log: 'You accept it. The deduction recurs next month. Finance pre-emptively emails an apology, dated today. It covers the next six months. Some months look worse than others.',
      },
      {
        id: 'escalate_director',
        label: 'Escalate to the Director',
        cost: { resource: 'sanity', amount: 15 },
        effects: { suspicion: -10, credits: 100 },
        log: "The Director reverses the deduction with one signed note. He says: 'This particular irregularity should not have been visible.' His tone suggests the problem was visibility, not the thing itself.",
      },
    ],
    failureOutcome: {
      log: "The query window expires. The deduction is finalised. A note from Finance reads: 'Resolution is no longer available for this payslip cycle. We recommend reviewing your contract re: Clause 0.'",
      effects: { suspicion: 15, credits: -50 },
    },
  },

  // ─── EVENT 20 ────────────────────────────────────────────────────────────
  {
    id: 'MGMT_ANNUAL_APPRAISAL',
    type: 'management',
    title: 'Annual Appraisal',
    description:
      "Your annual appraisal is scheduled. Self-assessment is required. The form asks you to rate your performance against objectives you were given in the appraisal you are now preparing for. The Director will review your submission. His question is already written in the 'Manager Notes' section. It predates the meeting by eleven months.",
    totalTime: 70000,
    choices: [
      {
        id: 'self_assess_honestly',
        label: 'Complete the self-assessment honestly',
        cost: { resource: 'sanity', amount: 25 },
        effects: { experience: 500, suspicion: -15 },
        log: "The meeting is frank. The Director listens. He says your self-assessment aligns with his pre-written notes in ways he did not anticipate when he wrote them. He upgrades your rating to 'Coherent'. This is unusual. You accept it.",
      },
      {
        id: 'match_notes',
        label: 'Write your self-assessment to match the pre-written Manager Notes',
        cost: { resource: 'focus', amount: 30 },
        effects: { suspicion: -20, experience: 300 },
        log: "The Director re-reads his own notes with the expression of a man who has passed a test he didn't know he was taking. Your rating is 'Consistent'. A small bonus is issued in a currency that is also consistent.",
      },
      {
        id: 'ask_about_question',
        label: 'Ask about the pre-written question',
        cost: { resource: 'sanity', amount: 20 },
        effects: { experience: 750, sanity: -20, suspicion: -5 },
        log: "The Director sets down his pen. He says: 'That is the right question. It has always been the right question.' He does not answer it. But for a moment, the room is very quiet in a way that feels like being understood.",
      },
      {
        id: 'dont_attend',
        label: 'Miss the appraisal',
        effects: { suspicion: 40, sanity: -10 },
        log: "Your appraisal is completed in your absence. Your rating is 'Absent'. The manager notes section has been updated. The update is a single word that HR has redacted. Even you are not allowed to know what it says.",
      },
    ],
    failureOutcome: {
      log: 'The appraisal window has passed. A retrospective rating of "Unresolved" has been issued. This rating cannot be appealed. It can only be succeeded by a better one, in a year that is already closer than it was.',
      effects: { suspicion: 30, sanity: -20, experience: 100 },
    },
  },
];
