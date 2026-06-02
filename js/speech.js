/* ============================================
   JARVIS - Speech-to-Text Engine
   Uses Web Speech API (Free, Built into Browser)
   ============================================ */

class SpeechEngine {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis || null;
    this.isListening = false;
    this.isSupported = false;
    this.onResult = null;
    this.onInterim = null;
    this.onStart = null;
    this.onEnd = null;
    this.onError = null;
    this.language = 'en-US';
    this.continuous = false;
    
    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.isSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = this.continuous;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript && this.onInterim) {
          this.onInterim(interimTranscript);
        }

        if (finalTranscript && this.onResult) {
          this.onResult(finalTranscript);
        }
      };

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStart) this.onStart();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEnd) this.onEnd();
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        if (this.onError) this.onError(event.error);
      };
    } else {
      console.warn('Speech Recognition not supported in this browser');
    }
  }

  /**
   * Start listening
   */
  start() {
    if (!this.isSupported) {
      if (this.onError) this.onError('Speech recognition is not supported in this browser. Use Chrome or Edge.');
      return false;
    }

    if (this.isListening) {
      this.stop();
      return false;
    }

    try {
      this.recognition.start();
      return true;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      if (this.onError) this.onError(e.message);
      return false;
    }
  }

  /**
   * Stop listening
   */
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Toggle listening
   */
  toggle() {
    if (this.isListening) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }

  /**
   * Speak text aloud (Text-to-Speech)
   */
  speak(text, options = {}) {
    if (!this.synthesis) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    // Clean text - remove markdown
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'code block')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/#{1,3}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[|`~]/g, '')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.8;
    utterance.lang = this.language;

    // Try to find a good voice
    const voices = this.synthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
                     voices.find(v => v.lang.startsWith('en') && v.localService) ||
                     voices[0];
    if (preferred) utterance.voice = preferred;

    this.synthesis.speak(utterance);
  }

  /**
   * Stop speaking
   */
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Set language
   */
  setLanguage(lang) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
}
