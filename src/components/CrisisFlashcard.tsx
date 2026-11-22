'use client';

import { useState } from 'react';
import {
  RefreshCw,
  Check,
  X,
  Clock,
  Volume2,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { RegulationEvent } from '@/lib/types';
import { speakCalmly } from '@/lib/speech';

interface CrisisFlashcardProps {
  event: RegulationEvent;
  loading: boolean;
  onTryAnotherAngle: () => void;
  onLogOutcome: (outcome: 'helped' | 'didnt_land') => void;
  onScheduleRepair: () => void;
  onBack: () => void;
}

export function CrisisFlashcard({
  event,
  loading,
  onTryAnotherAngle,
  onLogOutcome,
  onScheduleRepair,
  onBack,
}: CrisisFlashcardProps) {
  const [repairQueued, setRepairQueued] = useState(false);

  const handleSpeakNow = () => {
    const fullUtterance = `${event.parent_anchor} ... ${event.say_verbatim}`;
    speakCalmly(fullUtterance);
  };

  const handleQueueRepair = () => {
    setRepairQueued(true);
    onScheduleRepair();
  };

  if (event.safety_override) {
    return (
      <div className="rounded-3xl bg-slate-900 border border-amber-500/60 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center gap-3 text-amber-400">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <h2 className="text-lg font-bold">Immediate Safety & Support</h2>
        </div>
        <p className="text-slate-200 text-base leading-relaxed">
          {event.safety_message ||
            'Please pause and reach out for immediate human support. Call or text 988 (Suicide & Crisis Lifeline), call 911 for medical emergencies, or text/call Childhelp at 1-800-422-4453.'}
        </p>
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl bg-slate-800 text-slate-200 font-medium"
        >
          Return to Cockpit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Scenarios</span>
        </button>
        <span className="text-xs uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
          {event.scenario_tag}
        </span>
        <button
          onClick={handleSpeakNow}
          aria-label="Speak flashcard aloud"
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-800 text-[#10B981] border border-[#10B981]/30 hover:bg-slate-700"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Whisper</span>
        </button>
      </div>

      <div className="rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl overflow-hidden divide-y divide-slate-800/80">
        <div className="p-5 bg-gradient-to-r from-[#10B981]/10 to-transparent flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
            <span className="absolute inset-0 rounded-full bg-[#10B981]/25 animate-lqm-breathe" />
            <span className="w-4 h-4 rounded-full bg-[#10B981]" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#10B981]">
              1. Anchor (You First)
            </p>
            <p className="text-base font-medium text-slate-100 mt-0.5 leading-snug">
              {event.parent_anchor}
            </p>
          </div>
        </div>

        <div className="p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            2. What’s Happening — {event.inferred_child_state}
          </p>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            {event.child_translation}
          </p>
        </div>

        <div className="p-6 bg-slate-950/60">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#F59E0B] mb-2">
            3. Say This (Verbatim)
          </p>
          <p className="text-[23px] sm:text-2xl font-semibold text-white leading-snug tracking-tight">
            “{event.say_verbatim}”
          </p>
        </div>

        <div className="px-5 py-3.5 bg-slate-900/80 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400/90 shrink-0">
            Avoid:
          </span>
          <span className="text-xs text-slate-300 text-right">{event.avoid_cue}</span>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onLogOutcome('helped')}
            className={`py-3.5 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${
              event.outcome === 'helped'
                ? 'bg-[#10B981] text-slate-950 border-[#10B981]'
                : 'bg-slate-900 text-[#10B981] border-[#10B981]/40 hover:bg-[#10B981]/10'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Helped ✓</span>
          </button>

          <button
            onClick={() => onLogOutcome('didnt_land')}
            className={`py-3.5 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${
              event.outcome === 'didnt_land'
                ? 'bg-slate-700 text-white border-slate-500'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <X className="w-4 h-4" />
            <span>Didn’t Land</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onTryAnotherAngle}
            disabled={loading}
            className="py-3 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Try Another Angle</span>
          </button>

          <button
            onClick={handleQueueRepair}
            className={`py-3 px-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 border transition-colors ${
              repairQueued
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
          >
            <Clock className="w-4 h-4 text-[#F59E0B]" />
            <span>{repairQueued ? 'Repair Queued (30m)' : 'Schedule Repair (30m)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
