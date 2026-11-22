'use client';

import { useEffect, useState } from 'react';
import { Save, Download, Trash2, Check } from 'lucide-react';
import { AdhdPresentation, ChildProfile, DEFAULT_DEMO_CHILD } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

const PRESENTATIONS: AdhdPresentation[] = [
  'Inattentive',
  'Hyperactive/Impulsive',
  'Combined',
  'PDA / Demand-Avoidant',
];

export default function ProfileVaultPage() {
  const [nickname, setNickname] = useState(DEFAULT_DEMO_CHILD.nickname);
  const [ageBand, setAgeBand] = useState(DEFAULT_DEMO_CHILD.age_band);
  const [presentation, setPresentation] = useState<AdhdPresentation>(
    DEFAULT_DEMO_CHILD.presentation
  );
  const [triggers, setTriggers] = useState(DEFAULT_DEMO_CHILD.sensory_triggers.join(', '));
  const [anchors, setAnchors] = useState(DEFAULT_DEMO_CHILD.calming_anchors.join(', '));
  const [backfires, setBackfires] = useState(DEFAULT_DEMO_CHILD.backfire_phrases.join(', '));
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('lumina_children');
    if (raw) {
      try {
        const parsed: ChildProfile[] = JSON.parse(raw);
        if (parsed[0]) {
          setNickname(parsed[0].nickname);
          setAgeBand(parsed[0].age_band);
          setPresentation(parsed[0].presentation);
          setTriggers(parsed[0].sensory_triggers.join(', '));
          setAnchors(parsed[0].calming_anchors.join(', '));
          setBackfires(parsed[0].backfire_phrases.join(', '));
        }
      } catch {}
    }
  }, []);

  const splitClean = (val: string) =>
    val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile: ChildProfile = {
      id: crypto.randomUUID(),
      nickname: nickname.trim() || 'Child',
      age_band: ageBand.trim() || '6–10 years',
      presentation,
      sensory_triggers: splitClean(triggers),
      calming_anchors: splitClean(anchors),
      backfire_phrases: splitClean(backfires),
      created_at: new Date().toISOString(),
    };

    localStorage.setItem('lumina_children', JSON.stringify([profile]));

    const supabase = createClient();
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase.from('child_profiles').upsert({
          id: profile.id,
          user_id: data.user.id,
          nickname: profile.nickname,
          age_band: profile.age_band,
          presentation: profile.presentation,
          sensory_triggers: profile.sensory_triggers,
          calming_anchors: profile.calming_anchors,
          backfire_phrases: profile.backfire_phrases,
        });
      }
    }

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

    const handleExportReadable = () => {
    const children: ChildProfile[] = JSON.parse(
      localStorage.getItem('lumina_children') || '[]'
    );
    const events: any[] = JSON.parse(
      localStorage.getItem('lumina_events') || '[]'
    );

    const child = children[0];
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const lines: string[] = [
      '====================================================',
      'PROJECT LUMINA — FAMILY NERVOUS SYSTEM SUMMARY',
      `Exported on: ${dateStr}`,
      '====================================================',
      '',
      '1. CHILD PROFILE',
      `   Nickname:          ${child?.nickname || 'Not set'}`,
      `   Age Band:          ${child?.age_band || 'Not set'}`,
      `   ADHD Presentation: ${child?.presentation || 'Not set'}`,
      `   Sensory Triggers:  ${child?.sensory_triggers?.join(', ') || 'None listed'}`,
      `   Calming Anchors:   ${child?.calming_anchors?.join(', ') || 'None listed'}`,
      `   Backfire Phrases:  ${child?.backfire_phrases?.join(', ') || 'None listed'}`,
      '',
      '----------------------------------------------------',
      `2. LOGGED REGULATION MOMENTS (${events.length} total)`,
      '----------------------------------------------------',
    ];

    if (events.length === 0) {
      lines.push('   No regulation moments logged yet.');
    } else {
      events.forEach((ev, idx) => {
        const when = ev.created_at
          ? new Date(ev.created_at).toLocaleString()
          : 'Unknown time';
        lines.push('');
        lines.push(`   Moment #${idx + 1} — ${ev.scenario_tag || 'General Wave'}`);
        lines.push(`   When:        ${when}`);
        lines.push(`   Child State: ${ev.inferred_child_state || 'N/A'}`);
        lines.push(`   Script Used: "${ev.say_verbatim || ''}"`);
        lines.push(`   Outcome:     ${ev.outcome ? ev.outcome.toUpperCase() : 'Not rated'}`);
        lines.push(`   Repaired:    ${ev.repair_completed ? 'Yes' : 'Pending'}`);
      });
    }

    lines.push('');
    lines.push('====================================================');
    lines.push('Generated by Project Lumina • State Before Skill');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lumina-Family-Summary-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };


    setNickname('');
    setTriggers('');
    setAnchors('');
    setBackfires('');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <header>
          <p className="text-xs uppercase tracking-wider text-[#F59E0B] font-semibold">
            60-Second Family Vault
          </p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Child Nervous System Profile</h1>
        </header>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Child Nickname</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Leo, 8"
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Age Band</label>
              <input
                value={ageBand}
                onChange={(e) => setAgeBand(e.target.value)}
                placeholder="e.g. 7–9 years"
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">ADHD Presentation</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESENTATIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPresentation(item)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-left transition-colors ${
                    presentation === item
                      ? 'bg-[#F59E0B]/15 border-[#F59E0B] text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Top 3 Sensory Triggers (comma-separated)
            </label>
            <input
              value={triggers}
              onChange={(e) => setTriggers(e.target.value)}
              placeholder="Loud noises, scratchy socks, rushing"
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Top 3 Calming Anchors (comma-separated)
            </label>
            <input
              value={anchors}
              onChange={(e) => setAnchors(e.target.value)}
              placeholder="Heavy blanket, cold water, whispered voice"
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Backfire Phrases (words that always escalate)
            </label>
            <input
              value={backfires}
              onChange={(e) => setBackfires(e.target.value)}
              placeholder="Hurry up, Because I said so, Calm down"
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#10B981] text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            {savedNotice ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedNotice ? 'Saved to Family Vault' : 'Save Child Profile'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3">
                    <button
            type="button"
            onClick={handleExportReadable}
            className="py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-center gap-2 hover:border-slate-700"
          >
            <Download className="w-4 h-4 text-[#F59E0B]" />
            <span>Download Summary (.txt)</span>
          </button>


          <button
            type="button"
            onClick={handleDeleteAll}
            className="py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400 flex items-center justify-center gap-2 hover:text-amber-300"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All Family Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
