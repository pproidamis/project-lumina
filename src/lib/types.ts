export type AdhdPresentation =
  | 'Inattentive'
  | 'Hyperactive/Impulsive'
  | 'Combined'
  | 'PDA / Demand-Avoidant';

export interface ChildProfile {
  id: string;
  user_id?: string;
  nickname: string;
  age_band: string;
  presentation: AdhdPresentation;
  sensory_triggers: string[];
  calming_anchors: string[];
  backfire_phrases: string[];
  created_at?: string;
}

export interface RegulateResponse {
  safety_override: boolean;
  safety_message?: string;
  inferred_child_state: string;
  parent_anchor: string;
  child_translation: string;
  say_verbatim: string;
  avoid_cue: string;
}

export interface RegulationEvent extends RegulateResponse {
  id: string;
  child_id: string | null;
  scenario_tag: string;
  voice_transcript?: string | null;
  outcome: 'helped' | 'didnt_land' | 'pending';
  repair_script?: string | null;
  repair_completed: boolean;
  created_at: string;
}

export const SCENARIOS = [
  {
    id: 'Morning Freeze',
    label: 'Morning Freeze',
    sub: 'Transitions, shoes, leaving the house',
    accent: 'border-amber-500/40 hover:border-amber-400',
  },
  {
    id: 'Homework Wall',
    label: 'Homework Wall',
    sub: 'Executive dysfunction, overwhelm, task paralysis',
    accent: 'border-amber-500/40 hover:border-amber-400',
  },
  {
    id: 'Sensory Meltdown',
    label: 'Sensory Meltdown',
    sub: 'Hyper-arousal, yelling, throwing, overload',
    accent: 'border-amber-500/40 hover:border-amber-400',
  },
  {
    id: 'Sibling Flashpoint',
    label: 'Sibling Flashpoint',
    sub: 'Impulsivity, fairness triggers, conflict',
    accent: 'border-amber-500/40 hover:border-amber-400',
  },
  {
    id: 'Shutdown',
    label: 'Shutdown',
    sub: 'Hypo-arousal, silence, withdrawal, refusal to speak',
    accent: 'border-amber-500/40 hover:border-amber-400',
  },
] as const;

export const DEFAULT_DEMO_CHILD: ChildProfile = {
  id: 'demo-child-leo',
  nickname: 'Leo, 8',
  age_band: '7–9 years',
  presentation: 'Combined',
  sensory_triggers: ['Sudden loud noises', 'Scratchy socks/seams', 'Time pressure'],
  calming_anchors: ['Heavy blanket', 'Cold water sip', 'Whispered voice'],
  backfire_phrases: ['Hurry up', 'Because I said so', 'Why can’t you just...'],
};
