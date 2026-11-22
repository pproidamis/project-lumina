let activeAudio: HTMLAudioElement | null = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
}

export async function speakCalmly(text: string, useElevenLabs = false): Promise<void> {
  if (typeof window === 'undefined') return;
  stopSpeaking();

  if (useElevenLabs) {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        activeAudio = new Audio(url);
        await activeAudio.play();
        return;
      }
    } catch {
      // Fallback to native Web Speech API
    }
  }

  if (!('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85;
  utterance.pitch = 0.92;
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => v.lang.startsWith('en') && /Samantha|Daniel|Google UK English Female|Natural/i.test(v.name)) ||
    voices.find((v) => v.lang.startsWith('en'));

  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}
