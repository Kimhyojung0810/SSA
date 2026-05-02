import { useState, useCallback, useRef } from 'react';
import type { SpeechSegment } from '../types';

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
  
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const startTimeRef = useRef(0);

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
          setSegments(prev => [...prev, newSegment]);
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
    
    if (!isSupported) {
      setError('Chrome 브라우저에서만 지원됩니다.');
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setError('마이크 권한을 허용해주세요.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
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
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  }, []);

  const clearSegments = useCallback(() => {
    setSegments([]);
    setInterimText('');
  }, []);

  return {
    isListening,
    segments,
    interimText,
    error,
    isSupported,
    startListening,
    stopListening,
    clearSegments,
  };
}
