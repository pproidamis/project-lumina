import Link from 'next/link';
import { ShieldCheck, Sparkles, HeartHandshake, ArrowRight, Crown } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between">
      <div className="max-w-lg mx-auto px-5 pt-10 pb-16 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="font-bold tracking-tight text-white">Project Lumina</span>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-300"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Plans</span>
          </Link>
        </header>

        <section className="space-y-4 pt-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[#10B981]">
            State Before Skill • ADHD Co-Regulation
          </p>
          <h1 className="text-3xl font-bold text-white leading-tight">
            Calm words in 5 seconds when your child’s storm hits.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Built for parents of neurodivergent kids. Tap what is happening right now to get a
            nervous-system anchor, a low-demand verbatim script, and guilt-free post-storm repair.
          </p>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/cockpit"
              className="w-full py-4 px-5 rounded-2xl bg-[#F59E0B] text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Open Crisis Cockpit</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/pricing"
              className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2"
            >
              <span>View Free & Plus Plans</span>
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3.5">
            <Sparkles className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-white">5-Second AI Co-Regulation Cards</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tailored to your child’s sensory triggers, calming anchors, and backfire phrases.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3.5">
            <HeartHandshake className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-white">Shame-Free Relational Repair</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Two-sentence reconnect scripts and parent self-compassion after hard moments pass.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-white">Private Family Vault</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Your family notes stay on your device with one-tap readable summary exports.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
