
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

// Create types for the Web Speech API
type SpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
  };
};

type SpeechRecognitionResultList = {
  [index: number]: SpeechRecognitionResult;
  length: number;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

interface SpeechRecognitionInterface {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}

// Define global types for browsers
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition?: new () => SpeechRecognitionInterface;
  }
}

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  onListening?: (isListening: boolean) => void;
  className?: string;
}

const VoiceInput = ({ onResult, onListening, className }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [recognition, setRecognition] = useState<SpeechRecognitionInterface | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscription(finalTranscript || interimTranscript);
        
        // Only call onResult when we have final results
        if (finalTranscript) {
          onResult(finalTranscript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (onListening) onListening(false);
        toast.error("Voice recognition error. Please try again.");
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        if (onListening) onListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      if (onListening) onListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
        setTranscription("");
        if (onListening) onListening(true);
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        toast.error("Failed to start speech recognition. Please try again.");
      }
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Button
        onClick={toggleListening}
        variant={isListening ? "destructive" : "secondary"}
        size="icon"
        className="rounded-full w-12 h-12 flex items-center justify-center"
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </Button>
      {isListening && (
        <div className="ml-3 flex items-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-200"></div>
          </div>
          <span className="ml-2 text-sm text-muted-foreground">Listening...</span>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
