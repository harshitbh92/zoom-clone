/* eslint-disable no-undef */
/* eslint-disable no-redeclare */
/* eslint-disable no-var */
/* eslint-disable no-use-before-define */
declare interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  }
  
  declare var SpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };
  
  declare interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
  
  declare interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }
  