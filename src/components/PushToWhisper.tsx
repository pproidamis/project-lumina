'use client';

import { useRef, useState } from 'react';
import { Mic, Loader2 } from 'lucide-react';

interface PushToWhisperProps {
  onTranscriptReady: (transcript: string) => void;
  disabled?: boolean;
}

export function PushToWhisper({ onTranscriptReady, disabled }: PushToWhisperProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [livePreview, setLivePreview] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const speechRecRef = useRef<any>(null);

  const startRecording = async () => {
    if (disabled || processing) return;
    setLivePreview('');
    chunksRef.current = [];

    const SpeechRecognition =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.lang = 'en-US';
        rec.interimResults = true;
        rec.continuous = false;
        rec.onresult = (e: any) => {
          const text = Array.from(e.results)
            .map((r: any) => r[0].transcript)
            .join('');
          setLivePreview(text);
        };
        rec.start();
        speechRecRef.current = rec;
      } catch {}
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleAudioSubmit(audioBlob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      if (speechRecRef.current) setRecording(true);
    }
  };

  const stopRecording = () => {
    if (!recording) return;
    setRecording(false);
    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else if (livePreview.trim()) {
      onTranscriptReady(livePreview.trim());
    }
  };

  const handleAudioSubmit = async (blob: Blob) => {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'whisper.webm');
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.transcript) {
          onTranscriptReady(data.transcript);
          setProcessing(false);
          return;
        }
      }
    } catch {}

    if (livePreview.trim()) {
      onTranscriptReady(livePreview.trim());
    }
    setProcessing(false);
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {livePreview && recording && (
        <p className="text-xs text-amber-300/90 italic px-4 text-center truncate max-w-full">
          “{livePreview}”
        </p>
      )}
      <button
        type="button"
        onPointerDown={startRecording}
        onPointerUp={stopRecording}
        onPointerLeave={stopRecording}
        disabled={disabled || processing}
        aria-label="Hold to whisper context"
        className={`w-full py-4 px-6 rounded-2xl font-semibold text-base flex items-center justify-center gap-3 select-none touch-none transition-all shadow-lg ${
          recording
            ? 'bg-[#F59E0B] text-slate-950 scale-[0.99] ring-4 ring-amber-400/30'
            : 'bg-slate-800/95 text-slate-100 border border-slate-700 hover:border-[#F59E0B]/60'
        }`}
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-[#F59E0B]" />
            <span>Translating whisper...</span>
          </>
        ) : recording ? (
          <>
            <span className="w-3 h-3 rounded-full bg-slate-950 animate-ping" />
            <span>Listening... Release when done</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 text-[#F59E0B]" />
            <span>Hold to Whisper 3s Context</span>
          </>
        )}
      </button>
    </div>
  );
}
