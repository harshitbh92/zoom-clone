import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const CaptionRoom = () => {
  const [captions, setCaptions] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const dummy = useRef<HTMLDivElement>(null); // Dummy ref for auto-scrolling

  useEffect(() => {
    // Check if the SpeechRecognition API is supported
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition is not supported in this browser.");
      alert("Your browser does not support speech recognition. Please use Chrome or Chromium-based browsers.");
      return;
    }

    // Initialize the recognition object
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setCaptions((prevCaptions) => {
        const newCaptions = [...prevCaptions];
    
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
    
          if (event.results[i].isFinal) {
            // Push only the final result to avoid duplicates
            newCaptions.push(transcript);
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

  // Scroll into view whenever captions are updated
  useEffect(() => {
    dummy.current?.scrollIntoView({ behavior: 'smooth' });
  }, [captions]);

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

  return (
    <div className="caption-room" style={{ maxHeight: '500px', overflowY: 'auto'  }}>
      <h1>Live Transcription</h1>
      <div className="captions">
        {captions.map((caption, index) => (
          <p key={index}>{caption}</p>
        ))}
        {/* Dummy div for auto-scrolling */}
        <div ref={dummy}></div>
      </div>
      <div className="transcription_controls" style={{ display: 'flex', gap:10 }}>
        <button
          onClick={startTranscription}
          className='startTranscription'
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
          className='startTranscription'
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
