import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

export const runtime = 'edge';

const RequestSchema = z.object({
  scenario: z.string().min(1),
  voiceTranscript: z.string().optional(),
  childProfile: z
    .object({
      nickname: z.string().optional(),
      age_band: z.string().optional(),
      presentation: z.string().optional(),
      sensory_triggers: z.array(z.string()).optional(),
      calming_anchors: z.array(z.string()).optional(),
      backfire_phrases: z.array(z.string()).optional(),
    })
    .optional(),
  rejectedScripts: z.array(z.string()).optional(),
});

const ResponseSchema = z.object({
  safety_override: z.boolean(),
  safety_message: z.string().optional(),
  inferred_child_state: z.string(),
  parent_anchor: z.string(),
  child_translation: z.string(),
  say_verbatim: z.string(),
  avoid_cue: z.string(),
});

function enforceWordCap(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ').replace(/[,;:]$/, '') + '.';
}

const SYSTEM_PROMPT = `You are Project Lumina by Loud Quiet Mind™ (LQM), a real-time somatic co-regulation engine for parents of children with ADHD.
Core Axiom: "When parents feel anchored, children feel safe."
Design Law: "State before skill."

STRICT RULES:
1. Never lecture, diagnose, or explain ADHD theory during CRISIS mode.
2. Output strictly valid JSON matching this schema:
{
  "safety_override": boolean,
  "safety_message": string (only populated if safety_override is true),
  "inferred_child_state": string (2-4 words describing nervous system state, e.g., "Sympathetic Fight-or-Flight"),
  "parent_anchor": string (STRICT MAX 10 WORDS. Physical somatic cue for parent first),
  "child_translation": string (STRICT MAX 12 WORDS. Reframe child's nervous system state; never moral failure),
  "say_verbatim": string (STRICT MAX 20 WORDS. Low-demand, validating, co-regulating script spoken aloud),
  "avoid_cue": string (STRICT MAX 8 WORDS. Specific escalation habit to suppress)
}
3. SAFETY CLASSIFIER CHECK: If input mentions self-harm, suicidal ideation, physical child abuse, or acute medical emergency, set "safety_override": true, provide calm emergency helpline guidance in "safety_message" (988 Suicide & Crisis Lifeline, 911, or Childhelp 1-800-422-4453), and leave parenting script fields brief.
4. NEVER use any phrase listed in the child's backfire_phrases.
5. NEVER repeat or closely paraphrase any script listed in rejected_scripts.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const { scenario, voiceTranscript, childProfile, rejectedScripts } = parsed.data;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          safety_override: false,
          inferred_child_state: 'Acute Nervous System Overload',
          parent_anchor: 'Drop your shoulders. Unclench your jaw. Exhale for six seconds.',
          child_translation: 'Their threat system is locked; their thinking brain is temporarily offline.',
          say_verbatim: 'You are safe. No rush right now. I am sitting right beside you until this wave passes.',
          avoid_cue: 'Lecturing, counting down, or raising volume.',
        },
        { status: 200 }
      );
    }

    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const userContext = JSON.stringify({
      active_scenario: scenario,
      parent_whisper_context: voiceTranscript || 'None provided',
      child_profile: {
        age_band: childProfile?.age_band || 'Unknown',
        presentation: childProfile?.presentation || 'Combined',
        sensory_triggers: childProfile?.sensory_triggers || [],
        calming_anchors: childProfile?.calming_anchors || [],
        backfire_phrases: childProfile?.backfire_phrases || [],
      },
      rejected_scripts: rejectedScripts || [],
    });

    const completion = await client.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      temperature: 0.45,
      max_tokens: 350,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContext },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content || '{}';
    const aiJson = JSON.parse(rawContent);
    const validated = ResponseSchema.parse(aiJson);

    const sanitized = {
      ...validated,
      parent_anchor: enforceWordCap(validated.parent_anchor, 10),
      child_translation: enforceWordCap(validated.child_translation, 12),
      say_verbatim: enforceWordCap(validated.say_verbatim, 20),
      avoid_cue: enforceWordCap(validated.avoid_cue, 8),
    };

    return NextResponse.json(sanitized);
  } catch (err) {
    console.error('Regulate API error:', err);
    return NextResponse.json(
      {
        safety_override: false,
        inferred_child_state: 'Nervous System Flood',
        parent_anchor: 'Plant both feet flat. Drop shoulders. Slow six-second exhale.',
        child_translation: 'Executive function is offline; behavior is stress, not defiance.',
        say_verbatim: 'I see how hard this feels right now. Take a breath. We are on the same team.',
        avoid_cue: 'Demanding eye contact or explaining rules.',
      },
      { status: 200 }
    );
  }
}
