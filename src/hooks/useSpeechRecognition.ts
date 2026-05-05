import { useState, useCallback, useRef } from 'react';
import type { SpeechSegment } from '../types';
import { estimateTimingsFromSegments } from '../lib/ai/ktGenieDictation';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [segments, setSegments] = useState<SpeechSegment[]>([]);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isListeningRef = useRef(false);
  const startTimeRef = useRef(0);
  const segmentsRef = useRef<SpeechSegment[]>([]);

  const isSupported = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';
    
    recognition.onresult = (event: any) => {
      let interim = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal && transcript.trim()) {
          const newSegment: SpeechSegment = {
            id: `seg-${Date.now()}`,
            text: transcript.trim(),
            timestamp: Date.now() - startTimeRef.current,
            matchedPointIds: [],
            confidence: result[0].confidence || 0.9,
          };
          setSegments(prev => {
            const updated = [...prev, newSegment];
            segmentsRef.current = updated;
            return updated;
          });
          setInterimText('');
        } else {
          interim += transcript;
        }
      }
      
      if (interim) {
        setInterimText(interim);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Restart error:', e);
            }
          }
        }, 100);
      }
    };

    recognition.onerror = (event: any) => {
      console.log('Speech error:', event.error);
      
      if (event.error === 'not-allowed') {
        setError('마이크 권한을 허용해주세요.');
        isListeningRef.current = false;
        setIsListening(false);
      } else if (event.error === 'audio-capture') {
        setError('마이크를 찾을 수 없습니다.');
        isListeningRef.current = false;
        setIsListening(false);
      }
    };

    return recognition;
  }, [isSupported]);

  const startListening = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    segmentsRef.current = [];

    if (!isSupported) {
      setError('Chrome 브라우저에서만 지원됩니다.');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setError('마이크 권한을 허용해주세요.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    // MediaRecorder: captures full audio for KT Genie post-hoc transcription
    try {
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start(1000);
    } catch (e) {
      // MediaRecorder optional — Web Speech remains the live source
    }

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    isListeningRef.current = true;
    setIsListening(true);

    try {
      recognition.start();
    } catch (e: any) {
      setError('음성 인식 시작 실패: ' + e.message);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [isSupported, createRecognition]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setInterimText('');

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        // Backfill startMs/endMs on recorded segments using Web Speech timestamps
        const enriched = estimateTimingsFromSegments(
          segmentsRef.current.map(s => ({ text: s.text, timestamp: s.timestamp }))
        );
        setSegments(prev =>
          prev.map((seg, i) => ({
            ...seg,
            startMs: enriched[i]?.startMs,
            endMs: enriched[i]?.endMs,
          }))
        );
      };
      try { mediaRecorderRef.current.stop(); } catch (e) {}
      mediaRecorderRef.current = null;
    }
  }, []);

  const clearSegments = useCallback(() => {
    setSegments([]);
    setInterimText('');
    setAudioBlob(null);
    audioChunksRef.current = [];
    segmentsRef.current = [];
  }, []);

  return {
    isListening,
    segments,
    interimText,
    error,
    isSupported,
    audioBlob,
    startListening,
    stopListening,
    clearSegments,
  };
}
