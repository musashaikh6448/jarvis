export class SpeechRecognitionService {
  private recognition: any;
  private isListening: boolean = false;

  constructor(
    private onResult: (text: string) => void,
    private onError: (error: string) => void
  ) {
    // Check if Web Speech API is available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      this.onError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Speech recognized:', transcript);
      this.onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      this.onError(`Speech recognition error: ${event.error}`);
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isListening = false;
    };
  }

  start() {
    if (!this.recognition) {
      this.onError('Speech recognition not initialized');
      return;
    }

    if (this.isListening) {
      console.log('Already listening');
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('Started listening');
    } catch (error: any) {
      console.error('Error starting recognition:', error);
      this.onError(error.message);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      console.log('Stopped listening');
    }
  }

  getIsListening() {
    return this.isListening;
  }
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private isSpeaking: boolean = false;

  constructor(private onEnd: () => void) {
    this.synthesis = window.speechSynthesis;
  }

  speak(text: string) {
    if (!this.synthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      console.log('Started speaking');
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      console.log('Finished speaking');
      this.onEnd();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isSpeaking = false;
      this.onEnd();
    };

    this.synthesis.speak(utterance);
  }

  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  getIsSpeaking() {
    return this.isSpeaking;
  }
}
