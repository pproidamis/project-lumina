'use client';

import { useEffect, useState } from 'react';
import { Sun, Sunset, Moon, CheckCircle2, Sparkles } from 'lucide-react';
import { RegulationEvent } from '@/lib/types';

export default function WeeklyPatternMapPage() {
  const [events, setEvents] = useState<RegulationEvent[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('lumina_events');
    if (raw) {
      try {
        setEvents(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const timeBuckets = { Morning: 0, Afternoon: 0, Evening: 0 };
  const scenarioCounts: Record<string, number> = {};

  events.forEach((ev) => {
    const hour = new Date(ev.created_at).getHours();
    if (hour < 12) timeBuckets.Morning += 1;
    else if (hour < 17) timeBuckets.Afternoon += 1;
    else timeBuckets.Evening += 1;

    scenarioCounts[ev.scenario_tag] = (scenarioCounts[ev.scenario_tag] || 0) + 1;
  });

  const topTriggers = Object.entries(scenarioCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const helpedScripts = events.filter((e) => e.outcome === 'helped').slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <header>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#10B981] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-Guilt Pattern Lens</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-0.5">Weekly Nervous System Map</h1>
          <p className="text-xs text-slate-400 mt-1">
            Data is for curiosity and environmental adjustment—never grading.
          </p>
        </header>

        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Rhythm by Time of Day
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
              <Sun className="w-4 h-4 text-[#F59E0B] mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{timeBuckets.Morning}</div>
              <div className="text-[11px] text-slate-400">Morning</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
              <Sunset className="w-4 h-4 text-[#F59E0B] mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{timeBuckets.Afternoon}</div>
              <div className="text-[11px] text-slate-400">Afternoon</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
              <Moon className="w-4 h-4 text-[#10B981] mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{timeBuckets.Evening}</div>
              <div className="text-[11px] text-slate-400">Evening</div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Frequent Friction Windows
          </h2>
          {topTriggers.length === 0 ? (
            <p className="text-sm text-slate-400">
              No moments logged yet. Tap any scenario in the Cockpit when a wave hits.
            </p>
          ) : (
            <div className="space-y-2">
              {topTriggers.map(([tag, count]) => (
                <div
                  key={tag}
                  className="flex items-center justify-between py-2 px-3.5 rounded-xl bg-slate-950/60"
                >
                  <span className="text-sm font-medium text-slate-200">{tag}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300">
                    {count} {count === 1 ? 'moment' : 'moments'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#10B981]">
            Phrases That Landed (Helped ✓)
          </h2>
          {helpedScripts.length === 0 ? (
            <p className="text-sm text-slate-400">
              Tap “Helped ✓” on any flashcard to build your child’s proven anchor library.
            </p>
          ) : (
            <div className="space-y-2.5">
              {helpedScripts.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/25 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#10B981]">
                    <span>{item.scenario_tag}</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm font-medium text-slate-100">“{item.say_verbatim}”</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
