import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

export const runtime = 'edge';

const RepairRequestSchema = z.object({
  scenario: z.string(),
  childNickname: z.string().optional(),
  voiceTranscript: z.string().optional().nullable(),
  sayVerbatim: z.string().optional(),
});

const RepairResponseSchema = z.object({
  repair_script: z.string(),
  parent_compassion: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RepairRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { scenario, childNickname, voiceTranscript, sayVerbatim } = parsed.data;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        repair_script:
          'Earlier was really big for both of us, and my nervous system got loud too. I love you no matter what, and I am glad we are back on steady ground.',
        parent_compassion:
          'You showed up inside a nervous system storm without a manual. Repair—not perfection—is what wires lifelong safety.',
      });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const completion = await client.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      temperature: 0.5,
      max_tokens: 260,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are Project Lumina's Post-Storm Relational Repair guide.
Generate JSON with:
1. "repair_script": Exactly 2 warm, non-shaming sentences for the parent to say to their child after calm returns. Zero lecturing, zero "next time you need to...", pure connection and warmth.
2. "parent_compassion": 2 grounding sentences relieving parental guilt and affirming their effort.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            scenario,
            child_nickname: childNickname || 'my child',
            context: voiceTranscript || 'General dysregulation wave',
            script_used: sayVerbatim || '',
          }),
        },
      ],
    });

    const data = RepairResponseSchema.parse(
      JSON.parse(completion.choices[0]?.message?.content || '{}')
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      repair_script:
        'That moment got really intense for both of us, and I am sorry my voice got tight. I love being your parent, and we can take the rest of the day slowly.',
      parent_compassion:
        'Co-regulating an ADHD nervous system takes immense energy. Even reaching for support proves your deep care.',
    });
  }
}
