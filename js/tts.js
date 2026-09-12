/* Modular bilingual TTS using Web Speech API */
const TTS = {
  voices: [],
  enVoice: null,
  bnVoice: null,
  rate: 0.95,
  enabled: true,
  speaking: false,
  queue: [],
  onEnd: null,

  init() {
    const load = () => {
      this.voices = speechSynthesis.getVoices();
      this.enVoice = this.voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Microsoft'))) 
                 || this.voices.find(v => v.lang.startsWith('en'));
      this.bnVoice = this.voices.find(v => v.lang.startsWith('bn') || v.lang.includes('Bengali'))
                 || this.voices.find(v => v.lang.startsWith('hi'))
                 || this.enVoice;
    };
    load();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = load;
    }
  },

  setRate(r) { this.rate = r; },
  toggle() { this.enabled = !this.enabled; return this.enabled; },

  stop() {
    speechSynthesis.cancel();
    this.speaking = false;
    this.queue = [];
  },

  speak(text, lang = 'en', pauseAfter = 400) {
    return new Promise((resolve) => {
      if (!this.enabled || !text || !window.speechSynthesis) {
        setTimeout(resolve, 300);
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      u.rate = this.rate;
      u.pitch = 1;
      u.volume = 1;
      if (lang === 'bn' && this.bnVoice) {
        u.voice = this.bnVoice;
        u.lang = this.bnVoice.lang || 'bn-IN';
      } else if (this.enVoice) {
        u.voice = this.enVoice;
        u.lang = this.enVoice.lang || 'en-US';
      }
      u.onend = () => setTimeout(resolve, pauseAfter);
      u.onerror = () => resolve();
      this.speaking = true;
      speechSynthesis.speak(u);
    });
  },

  async speakSequence(segments) {
    this.stop();
    for (const seg of segments) {
      if (!this.enabled) break;
      await this.speak(seg.text, seg.lang || 'en', seg.pause ?? 500);
    }
    this.speaking = false;
    if (this.onEnd) this.onEnd();
  }
};

TTS.init();
