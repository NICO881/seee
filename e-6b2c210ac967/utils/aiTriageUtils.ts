
/**
 * AI Triage utility functions for emergency guidance
 */

export interface TriageGuidance {
  steps: string[];
  warnings: string[];
  doNots: string[];
  whenToCall911: string[];
  additionalInfo?: string;
}

/**
 * Get comprehensive AI triage guidance based on emergency type
 */
export function getTriageGuidance(emergencyType: string): TriageGuidance {
  const guidanceMap: { [key: string]: TriageGuidance } = {
    'Medical Emergency': {
      steps: [
        'Stay calm and assess the situation',
        'Check if the patient is conscious and breathing',
        'If unconscious, place in recovery position (on their side)',
        'Keep the patient comfortable and warm',
        'Do not give food or water unless instructed',
        'Monitor vital signs (breathing, pulse) until help arrives',
        'Note any changes in condition',
      ],
      warnings: [
        'Do not move the patient unless absolutely necessary',
        'Watch for signs of shock (pale skin, rapid pulse, confusion)',
        'Keep the patient calm and reassured',
      ],
      doNots: [
        'Do not give medication unless prescribed',
        'Do not leave the patient alone',
        'Do not give anything by mouth if unconscious',
      ],
      whenToCall911: [
        'Patient is unconscious or unresponsive',
        'Difficulty breathing or no breathing',
        'Severe bleeding that won\'t stop',
        'Signs of stroke (face drooping, arm weakness, speech difficulty)',
      ],
    },
    'Cardiac Emergency': {
      steps: [
        'Call for help immediately - time is critical',
        'Have the patient sit down or lie down comfortably',
        'Loosen any tight clothing around neck and chest',
        'If patient has prescribed medication (nitroglycerin), help them take it',
        'Keep the patient calm and still',
        'Be prepared to perform CPR if patient becomes unconscious',
        'If available, use an AED (Automated External Defibrillator)',
      ],
      warnings: [
        'Chest pain, pressure, or discomfort is a medical emergency',
        'Symptoms may include pain in arm, jaw, neck, or back',
        'Shortness of breath, nausea, or cold sweats are warning signs',
      ],
      doNots: [
        'Do not let the patient walk or exert themselves',
        'Do not give aspirin if patient is allergic or has bleeding disorders',
        'Do not delay calling emergency services',
      ],
      whenToCall911: [
        'Chest pain lasting more than 5 minutes',
        'Pain spreading to arms, jaw, neck, or back',
        'Shortness of breath with chest discomfort',
        'Patient loses consciousness',
      ],
      additionalInfo: 'If patient stops breathing, begin CPR immediately: 30 chest compressions followed by 2 rescue breaths. Continue until help arrives.',
    },
    'Accident/Trauma': {
      steps: [
        'Ensure the scene is safe before approaching',
        'Do not move the patient unless in immediate danger',
        'Call for emergency help immediately',
        'Control any bleeding with direct pressure using clean cloth',
        'Keep the patient still and calm',
        'Cover wounds with clean cloth or bandage',
        'Watch for signs of shock and keep patient warm',
        'Note the mechanism of injury for emergency responders',
      ],
      warnings: [
        'Suspect spinal injury if trauma involves head, neck, or back',
        'Internal bleeding may not be immediately visible',
        'Shock can develop quickly after trauma',
      ],
      doNots: [
        'Do not move the patient if spinal injury is suspected',
        'Do not remove objects embedded in wounds',
        'Do not give food or water',
        'Do not try to straighten broken bones',
      ],
      whenToCall911: [
        'Severe bleeding that won\'t stop',
        'Suspected broken bones or spinal injury',
        'Head injury with loss of consciousness',
        'Difficulty breathing or chest injury',
      ],
      additionalInfo: 'For severe bleeding: Apply direct pressure, elevate the injured area above heart level if possible, and maintain pressure until help arrives.',
    },
    'Respiratory Emergency': {
      steps: [
        'Help the patient sit upright or in a comfortable position',
        'Loosen any tight clothing around neck and chest',
        'Open windows or move to fresh air if possible',
        'If patient has an inhaler, help them use it',
        'Encourage slow, deep breaths',
        'Stay calm and reassure the patient',
        'Monitor breathing rate and pattern',
        'Be prepared to perform CPR if breathing stops',
      ],
      warnings: [
        'Difficulty breathing can worsen rapidly',
        'Blue lips or fingernails indicate severe oxygen deprivation',
        'Anxiety can worsen breathing difficulties',
      ],
      doNots: [
        'Do not let the patient lie flat',
        'Do not give food or drink',
        'Do not leave the patient alone',
      ],
      whenToCall911: [
        'Severe difficulty breathing or gasping for air',
        'Blue or gray skin, lips, or fingernails',
        'Confusion or altered mental state',
        'Breathing stops or becomes very slow',
      ],
      additionalInfo: 'For asthma attacks: Use rescue inhaler as prescribed. If no improvement after 5-10 minutes, call emergency services.',
    },
    'Allergic Reaction': {
      steps: [
        'Check if patient has an EpiPen and help administer immediately if needed',
        'Call emergency services right away',
        'Have the patient lie down with legs elevated (unless vomiting)',
        'Loosen tight clothing',
        'Keep the patient warm',
        'Monitor breathing and consciousness closely',
        'Be prepared to perform CPR if needed',
        'Note what caused the reaction if known',
      ],
      warnings: [
        'Anaphylaxis can be life-threatening within minutes',
        'Symptoms can include difficulty breathing, swelling, hives, and rapid pulse',
        'A second wave of symptoms can occur hours later',
      ],
      doNots: [
        'Do not give anything by mouth if patient has difficulty swallowing',
        'Do not assume antihistamines alone will treat severe reactions',
        'Do not delay using EpiPen if available',
      ],
      whenToCall911: [
        'Difficulty breathing or wheezing',
        'Swelling of face, lips, or throat',
        'Rapid pulse or drop in blood pressure',
        'Dizziness, confusion, or loss of consciousness',
      ],
      additionalInfo: 'EpiPen instructions: Remove safety cap, press firmly against outer thigh until click is heard, hold for 3 seconds, massage injection site for 10 seconds.',
    },
    'Stroke': {
      steps: [
        'Call emergency services immediately - time is brain',
        'Note the time symptoms started (critical for treatment)',
        'Have patient lie down with head slightly elevated',
        'Do not give food, drink, or medication',
        'Keep patient calm and comfortable',
        'Monitor breathing and consciousness',
        'Loosen tight clothing',
      ],
      warnings: [
        'Use FAST test: Face drooping, Arm weakness, Speech difficulty, Time to call 911',
        'Every minute counts in stroke treatment',
        'Symptoms may come and go but still require emergency care',
      ],
      doNots: [
        'Do not give aspirin or other medications',
        'Do not let patient eat or drink',
        'Do not delay calling emergency services',
      ],
      whenToCall911: [
        'Sudden numbness or weakness in face, arm, or leg',
        'Sudden confusion or trouble speaking',
        'Sudden trouble seeing in one or both eyes',
        'Sudden severe headache with no known cause',
      ],
      additionalInfo: 'FAST test: Face - Ask person to smile. Arm - Ask person to raise both arms. Speech - Ask person to repeat a simple phrase. Time - If any of these signs are present, call 911 immediately.',
    },
    'Seizure': {
      steps: [
        'Stay calm and time the seizure',
        'Clear the area of hard or sharp objects',
        'Place something soft under the head',
        'Turn person on their side to keep airway clear',
        'Do not restrain the person',
        'Stay with the person until fully conscious',
        'Speak calmly and reassuringly as they regain consciousness',
      ],
      warnings: [
        'Most seizures stop on their own within 1-2 minutes',
        'Person may be confused or tired after seizure',
        'Multiple seizures or seizure lasting over 5 minutes requires immediate medical attention',
      ],
      doNots: [
        'Do not put anything in the person\'s mouth',
        'Do not try to hold the person down',
        'Do not give food or water until fully alert',
      ],
      whenToCall911: [
        'Seizure lasts more than 5 minutes',
        'Person has multiple seizures without regaining consciousness',
        'Person is injured during seizure',
        'First-time seizure or person has diabetes or is pregnant',
      ],
    },
    'Choking': {
      steps: [
        'Ask "Are you choking?" - if they can speak or cough, encourage coughing',
        'If unable to speak or cough, perform Heimlich maneuver',
        'Stand behind person, wrap arms around waist',
        'Make a fist above navel, grasp with other hand',
        'Give quick upward thrusts',
        'Repeat until object is expelled or person becomes unconscious',
        'If unconscious, begin CPR',
      ],
      warnings: [
        'Complete airway obstruction is a life-threatening emergency',
        'Person may become unconscious quickly',
        'Continue attempts until object is cleared or help arrives',
      ],
      doNots: [
        'Do not perform Heimlich if person can cough or speak',
        'Do not give back blows to adults (use for infants)',
        'Do not give up - continue until help arrives',
      ],
      whenToCall911: [
        'Person cannot breathe, speak, or cough',
        'Person becomes unconscious',
        'Object cannot be removed',
      ],
      additionalInfo: 'For infants: Use back blows and chest thrusts instead of Heimlich maneuver.',
    },
    'Burns': {
      steps: [
        'Remove person from heat source',
        'Cool the burn with cool (not cold) running water for 10-20 minutes',
        'Remove jewelry and tight clothing before swelling starts',
        'Cover burn with sterile, non-stick bandage',
        'Do not break blisters',
        'Give over-the-counter pain reliever if needed',
        'Keep person warm to prevent shock',
      ],
      warnings: [
        'Severe burns require immediate medical attention',
        'Burns to face, hands, feet, genitals, or major joints need medical care',
        'Chemical and electrical burns always require medical evaluation',
      ],
      doNots: [
        'Do not use ice or ice water',
        'Do not apply butter, oil, or ointments',
        'Do not break blisters',
        'Do not remove clothing stuck to burn',
      ],
      whenToCall911: [
        'Burns larger than 3 inches in diameter',
        'Burns on face, hands, feet, genitals, or major joints',
        'Third-degree burns (white or charred skin)',
        'Chemical or electrical burns',
      ],
    },
    'Poisoning': {
      steps: [
        'Call Poison Control immediately',
        'Have the poison container or substance available',
        'Note the time of exposure',
        'Follow Poison Control instructions exactly',
        'Keep person calm and still',
        'Monitor breathing and consciousness',
        'Save any vomit for analysis if instructed',
      ],
      warnings: [
        'Different poisons require different treatments',
        'Do not induce vomiting unless instructed',
        'Symptoms may be delayed',
      ],
      doNots: [
        'Do not induce vomiting unless told to do so',
        'Do not give anything by mouth unless instructed',
        'Do not try to neutralize poison',
      ],
      whenToCall911: [
        'Person is unconscious or having seizures',
        'Difficulty breathing',
        'Severe symptoms or rapid deterioration',
        'Poison Control advises emergency care',
      ],
      additionalInfo: 'Keep Poison Control number saved: varies by country. In Uganda, contact nearest hospital emergency department.',
    },
    'Other Emergency': {
      steps: [
        'Assess the situation quickly and safely',
        'Call for emergency help if situation is serious',
        'Ensure scene is safe before approaching',
        'Check if patient is conscious and breathing',
        'Provide comfort and reassurance',
        'Monitor patient until help arrives',
        'Note any changes in condition',
      ],
      warnings: [
        'When in doubt, call emergency services',
        'Better to be cautious than delay needed care',
        'Trust your instincts about severity',
      ],
      doNots: [
        'Do not put yourself in danger',
        'Do not move patient unless necessary',
        'Do not delay calling for help',
      ],
      whenToCall911: [
        'Life-threatening situation',
        'Severe pain or distress',
        'Rapid deterioration',
        'Uncertainty about severity',
      ],
    },
  };

  return guidanceMap[emergencyType] || guidanceMap['Other Emergency'];
}

/**
 * Get quick action steps for emergency type
 */
export function getQuickActions(emergencyType: string): string[] {
  const guidance = getTriageGuidance(emergencyType);
  return guidance.steps.slice(0, 3); // Return first 3 most critical steps
}

/**
 * Get emergency severity level
 */
export function getEmergencySeverity(emergencyType: string): 'critical' | 'serious' | 'moderate' {
  const criticalTypes = ['Cardiac Emergency', 'Stroke', 'Choking', 'Allergic Reaction'];
  const seriousTypes = ['Accident/Trauma', 'Respiratory Emergency', 'Seizure', 'Burns'];
  
  if (criticalTypes.includes(emergencyType)) {
    return 'critical';
  } else if (seriousTypes.includes(emergencyType)) {
    return 'serious';
  }
  return 'moderate';
}

/**
 * Get estimated response time message
 */
export function getResponseTimeMessage(severity: 'critical' | 'serious' | 'moderate'): string {
  switch (severity) {
    case 'critical':
      return 'Emergency services typically respond within 8-15 minutes for critical emergencies.';
    case 'serious':
      return 'Emergency services typically respond within 15-30 minutes for serious emergencies.';
    case 'moderate':
      return 'Emergency services typically respond within 30-60 minutes for moderate emergencies.';
  }
}

/**
 * Format triage guidance for SMS
 */
export function formatTriageForSMS(emergencyType: string): string {
  const guidance = getTriageGuidance(emergencyType);
  let message = `EMERGENCY GUIDANCE: ${emergencyType}\n\n`;
  message += 'IMMEDIATE STEPS:\n';
  guidance.steps.slice(0, 3).forEach((step, index) => {
    message += `${index + 1}. ${step}\n`;
  });
  return message;
}
