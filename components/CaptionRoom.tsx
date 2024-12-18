/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const CaptionRoom = () => {
  const [captions, setCaptions] = useState<string[]>([]);
  const [signLanguageTranslations, setSignLanguageTranslations] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const dummy = useRef<HTMLDivElement>(null); // Dummy ref for auto-scrolling

  const signLanguageWords = ['Hello', 'thank you', 'no', 'byee', 'i love you', 'yes'];

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition is not supported in this browser.");
      alert("Your browser does not support speech recognition. Please use Chrome or Chromium-based browsers.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognitionRef.current = recognition;

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      setCaptions((prevCaptions) => {
        const newCaptions = [...prevCaptions];

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            newCaptions.push(transcript);

            // Add translation for sign language
            translateToSignLanguage(transcript);
          }
        }

        return newCaptions;
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsTranscribing(false);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended.");
      setIsTranscribing(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    dummy.current?.scrollIntoView({ behavior: 'smooth' });
  }, [captions, signLanguageTranslations]);

  const translateToSignLanguage = async (text: string) => {
    try {
      // Placeholder: Replace this with an actual API call
      const response = await fakeSignLanguageTranslationAPI(text);

      setSignLanguageTranslations((prevTranslations) => [...prevTranslations, response]);
    } catch (error) {
      console.error("Error translating to sign language:", error);
    }
  };

  const fakeSignLanguageTranslationAPI = async (text: string) => {
    // Simulate translation API response (replace with actual API integration)
    return `Sign Translation for: "${text}"`; // Replace this with real data
  };

  const startTranscription = () => {
    if (recognitionRef.current && !isTranscribing) {
      recognitionRef.current.start();
      setIsTranscribing(true);
    }
  };

  const stopTranscription = () => {
    if (recognitionRef.current && isTranscribing) {
      recognitionRef.current.stop();
      setIsTranscribing(false);
    }
  };

  // Random word generation logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isTranscribing) {
      intervalId = setInterval(() => {
        const randomWord = signLanguageWords[Math.floor(Math.random() * signLanguageWords.length)];
        setSignLanguageTranslations((prev) => [...prev, randomWord]);
      }, 5000); // Generate every 5 seconds
    } else if (intervalId) {
      clearInterval(intervalId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTranscribing]);

  return (
    <div className="caption-room" style={{ maxHeight: '500px', overflowY: 'auto' }}>
      <h1>Live Transcription and Sign Language Translation</h1>
      <div className="captions">
        {captions.map((caption, index) => (
          <p key={index}>{caption}</p>
        ))}
        {/* Display Sign Language Translations */}
        {signLanguageTranslations.map((translation, index) => (
          <p key={`sign-${index}`} style={{ fontStyle: 'italic', color: 'blue' }}>
            {translation}
          </p>
        ))}
        <div ref={dummy}></div>
      </div>
      <div className="transcription_controls" style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={startTranscription}
          className="startTranscription"
          disabled={isTranscribing}
          style={{
            backgroundColor: isTranscribing ? 'red' : 'green',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            cursor: isTranscribing ? 'not-allowed' : 'pointer',
            marginRight: '10px',
          }}
        >
          Start Transcription
        </button>
        <button
          onClick={stopTranscription}
          className="startTranscription"
          disabled={!isTranscribing}
          style={{
            backgroundColor: !isTranscribing ? 'red' : 'green',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            cursor: !isTranscribing ? 'not-allowed' : 'pointer',
          }}
        >
          Stop Transcription
        </button>
      </div>
    </div>
  );
};

export default CaptionRoom;
