'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { HeartHandshake, Volume2, CheckCircle2, Loader2 } from 'lucide-react';
import { RegulationEvent } from '@/lib/types';
import { speakCalmly } from '@/lib/speech';
import { createClient } from '@/lib/supabase/client';

export default function RepairPage() {
  const params = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<RegulationEvent | null>(null);
  const [repairScript, setRepairScript] = useState<string>('');
  const [parentCompassion, setParentCompassion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [completed, setCompleted] = useState<boolean>(false);

  useEffect(() => {
    const loadAndGenerate = async () => {
      const raw = localStorage.getItem('lumina_events');
      const events: RegulationEvent[] = raw ? JSON.parse(raw) : [];

      let target: RegulationEvent | undefined;
      if (params.eventId && params.eventId !== 'latest') {
        target = events.find((e) => e.id === params.eventId);
      }
      if (!target) {
        const pendingId = localStorage.getItem('lumina_pending_repair_id');
        target = events.find((e) => e.id === pendingId) || events[0];
      }

      if (target) {
        setEvent(target);
        setCompleted(target.repair_completed);
      }

      try {
        const res = await fetch('/api/repair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario: target?.scenario_tag || 'Emotional Overload Wave',
            voiceTranscript: target?.voice_transcript,
            sayVerbatim: target?.say_verbatim,
          }),
        });
        const data = await res.json();
        setRepairScript(data.repair_script);
        setParentCompassion(data.parent_compassion);
      } finally {
        setLoading(false);
      }
    };

    loadAndGenerate();
  }, [params.eventId]);

  const markRepairComplete = async () => {
    setCompleted(true);
    if (!event) return;

    const raw = localStorage.getItem('lumina_events');
    if (raw) {
      const list: RegulationEvent[] = JSON.parse(raw);
      const next = list.map((item) =>
        item.id === event.id
          ? { ...item, repair_script: repairScript, repair_completed: true }
          : item
      );
      localStorage.setItem('lumina_events', JSON.stringify(next));
    }

    const supabase = createClient();
    if (supabase) {
      await supabase
        .from('regulation_events')
        .update({ repair_script: repairScript, repair_completed: true })
        .eq('id', event.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <header className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#10B981]">
            <HeartHandshake className="w-4 h-4" />
            <span>Post-Storm Repair Mode</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Reconnect Without Shame</h1>
          {event && (
            <p className="text-xs text-slate-400">
              Following: <span className="text-amber-300">{event.scenario_tag}</span>
            </p>
          )}
        </header>

        {loading ? (
          <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#F59E0B]" />
            <p className="text-sm text-slate-400">Preparing gentle repair script...</p>
          </div>
        ) : (
          <>
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
                  2-Sentence Relational Repair
                </span>
                <button
                  onClick={() => speakCalmly(repairScript)}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-slate-800 text-[#10B981] border border-[#10B981]/30"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              </div>
              <p className="text-xl font-medium text-white leading-relaxed">
                “{repairScript}”
              </p>
            </div>

            <div className="rounded-3xl bg-[#10B981]/10 border border-[#10B981]/30 p-6 space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#10B981]">
                Parent Self-Compassion Check-In
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">{parentCompassion}</p>
            </div>

            <button
              onClick={markRepairComplete}
              className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
                completed
                  ? 'bg-[#10B981] text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{completed ? 'Repair Logged ✓' : 'Mark Repair Complete'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
