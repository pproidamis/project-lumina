'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import {
  ChildProfile,
  DEFAULT_DEMO_CHILD,
  RegulateResponse,
  RegulationEvent,
  SCENARIOS,
} from '@/lib/types';
import { PushToWhisper } from './PushToWhisper';
import { CrisisFlashcard } from './CrisisFlashcard';
import { speakCalmly } from '@/lib/speech';
import { createClient } from '@/lib/supabase/client';

export function CrisisCockpit() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildProfile[]>([DEFAULT_DEMO_CHILD]);
  const [selectedChildId, setSelectedChildId] = useState<string>(DEFAULT_DEMO_CHILD.id);
  const [earbudAutoplay, setEarbudAutoplay] = useState<boolean>(false);
  const [activeEvent, setActiveEvent] = useState<RegulationEvent | null>(null);
  const [rejectedScripts, setRejectedScripts] = useState<string[]>([]);
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);

  const activeChild =
    children.find((c) => c.id === selectedChildId) || children[0] || DEFAULT_DEMO_CHILD;

  useEffect(() => {
    const savedEarbud = localStorage.getItem('lumina_earbud_autoplay');
    if (savedEarbud === 'true') setEarbudAutoplay(true);

    const savedChildren = localStorage.getItem('lumina_children');
    if (savedChildren) {
      try {
        const parsed = JSON.parse(savedChildren);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChildren(parsed);
          setSelectedChildId(parsed[0].id);
        }
      } catch {}
    }

    const syncSupabase = async () => {
      const supabase = createClient();
      if (!supabase) return;
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      const { data: childRows } = await supabase
        .from('child_profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (childRows && childRows.length > 0) {
        setChildren(childRows);
        setSelectedChildId(childRows[0].id);
        localStorage.setItem('lumina_children', JSON.stringify(childRows));
      }

      const { data: profileRow } = await supabase
        .from('profiles')
        .select('earbud_autoplay')
        .eq('id', authData.user.id)
        .single();

      if (profileRow) {
        setEarbudAutoplay(profileRow.earbud_autoplay);
        localStorage.setItem('lumina_earbud_autoplay', String(profileRow.earbud_autoplay));
      }
    };

    syncSupabase();
  }, []);

  const toggleEarbudMode = async () => {
    const next = !earbudAutoplay;
    setEarbudAutoplay(next);
    localStorage.setItem('lumina_earbud_autoplay', String(next));

    const supabase = createClient();
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, earbud_autoplay: next });
      }
    }
  };

  const triggerRegulation = async (
    scenario: string,
    voiceTranscript?: string,
    previousRejected: string[] = []
  ) => {
    setLoadingScenario(scenario);
    try {
      const res = await fetch('/api/regulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          voiceTranscript,
          childProfile: activeChild,
          rejectedScripts: previousRejected,
        }),
      });

      const data: RegulateResponse = await res.json();

      const newEvent: RegulationEvent = {
        id: crypto.randomUUID(),
        child_id: activeChild.id,
        scenario_tag: scenario,
        voice_transcript: voiceTranscript || null,
        ...data,
        outcome: 'pending',
        repair_completed: false,
        created_at: new Date().toISOString(),
      };

      setActiveEvent(newEvent);

      const existingRaw = localStorage.getItem('lumina_events');
      const existing: RegulationEvent[] = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('lumina_events', JSON.stringify([newEvent, ...existing]));

      const supabase = createClient();
      if (supabase) {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          await supabase.from('regulation_events').insert({
            id: newEvent.id,
            user_id: authData.user.id,
            child_id: activeChild.id.startsWith('demo-') ? null : activeChild.id,
            scenario_tag: newEvent.scenario_tag,
            voice_transcript: newEvent.voice_transcript,
            inferred_child_state: newEvent.inferred_child_state,
            parent_anchor: newEvent.parent_anchor,
            child_translation: newEvent.child_translation,
            say_verbatim: newEvent.say_verbatim,
            avoid_cue: newEvent.avoid_cue,
            outcome: 'pending',
          });
        }
      }

      if (earbudAutoplay && !data.safety_override) {
        speakCalmly(`${data.parent_anchor} ... ${data.say_verbatim}`);
      }
    } finally {
      setLoadingScenario(null);
    }
  };

  const handleTryAnotherAngle = () => {
    if (!activeEvent) return;
    const updatedRejected = [...rejectedScripts, activeEvent.say_verbatim];
    setRejectedScripts(updatedRejected);
    triggerRegulation(
      activeEvent.scenario_tag,
      activeEvent.voice_transcript || undefined,
      updatedRejected
    );
  };

  const handleLogOutcome = async (outcome: 'helped' | 'didnt_land') => {
    if (!activeEvent) return;
    const updated = { ...activeEvent, outcome };
    setActiveEvent(updated);

    const existingRaw = localStorage.getItem('lumina_events');
    if (existingRaw) {
      const list: RegulationEvent[] = JSON.parse(existingRaw);
      const nextList = list.map((item) => (item.id === updated.id ? updated : item));
      localStorage.setItem('lumina_events', JSON.stringify(nextList));
    }

    const supabase = createClient();
    if (supabase) {
      await supabase
        .from('regulation_events')
        .update({ outcome })
        .eq('id', activeEvent.id);
    }
  };

  const handleScheduleRepair = () => {
    if (!activeEvent) return;
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          setTimeout(() => {
            new Notification('Project Lumina — Post-Storm Repair', {
              body: `Ready for a 2-sentence reconnect with ${activeChild.nickname}?`,
            });
          }, 30 * 60 * 1000);
        }
      });
    }
    localStorage.setItem('lumina_pending_repair_id', activeEvent.id);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">
        <header className="flex items-center justify-between gap-2">
          <div className="relative">
            <select
              aria-label="Select active child"
              value={activeChild.id}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-700/90 text-slate-100 text-sm font-semibold rounded-full pl-4 pr-9 py-2 focus:outline-none focus:border-[#F59E0B]"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.nickname}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="button"
            onClick={toggleEarbudMode}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
              earbudAutoplay
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Earbud Auto-Play: {earbudAutoplay ? 'ON' : 'OFF'}</span>
          </button>
        </header>

        {activeEvent ? (
          <CrisisFlashcard
            event={activeEvent}
            loading={Boolean(loadingScenario)}
            onTryAnotherAngle={handleTryAnotherAngle}
            onLogOutcome={handleLogOutcome}
            onScheduleRepair={handleScheduleRepair}
            onBack={() => {
              setActiveEvent(null);
              setRejectedScripts([]);
            }}
          />
        ) : (
          <>
            <div className="pt-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#10B981] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>State Before Skill</span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">
                Tap what’s happening right now
              </h1>
            </div>

            <div className="space-y-3">
              {SCENARIOS.map((item) => {
                const isThisLoading = loadingScenario === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={Boolean(loadingScenario)}
                    onClick={() => triggerRegulation(item.id)}
                    className={`w-full text-left p-4 rounded-2xl bg-slate-900/90 border ${item.accent} transition-all active:scale-[0.99] flex items-center justify-between shadow-md disabled:opacity-60`}
                  >
                    <div>
                      <div className="text-base font-bold text-slate-100">{item.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.sub}</div>
                    </div>
                    {isThisLoading ? (
                      <Loader2 className="w-5 h-5 text-[#F59E0B] animate-spin shrink-0" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/70 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <PushToWhisper
                disabled={Boolean(loadingScenario)}
                onTranscriptReady={(transcript) =>
                  triggerRegulation('Voice Whisper Context', transcript)
                }
              />
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => router.push('/repair/latest')}
                className="text-xs text-slate-400 hover:text-amber-300 underline underline-offset-4"
              >
                Storm passed? Open Post-Storm Repair Mode →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
