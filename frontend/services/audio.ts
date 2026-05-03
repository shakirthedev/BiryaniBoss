class AudioService {
  private ctx: AudioContext | null = null;
  private bgOsc: OscillatorNode | null = null;
  private bgGain: GainNode | null = null;
  private bgmInterval: number | null = null;
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      this.startBgHum();
      // Pre-load voices for speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playMetallic(freq: number, duration: number, vol: number = 0.1) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(freq * 1.4, this.ctx.currentTime); // Inharmonic overtone for metallic feel

    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + duration);
    osc2.stop(this.ctx.currentTime + duration);
  }

  playTing() {
    this.playTone(800, 'sine', 0.2, 0.3);
  }

  playBzzzt() {
    this.playTone(150, 'sawtooth', 0.3, 0.4);
  }

  playWin() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.15, 0.2), i * 100);
    });
  }

  playLose() {
    const notes = [400, 350, 300];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.3, 0.3), i * 300);
    });
  }

  playTick() {
    this.playTone(1000, 'square', 0.05, 0.05);
  }

  playHappy() {
    this.playTone(440, 'sine', 0.3, 0.1);
    this.playTone(554, 'sine', 0.3, 0.1);
    this.playTone(659, 'sine', 0.3, 0.1);
  }

  playDegTakTak() {
    // Rhythm: tak... tak... tak-tak-tak!
    const times = [0, 0.2, 0.4, 0.5, 0.6];
    times.forEach(t => {
      setTimeout(() => {
        this.playMetallic(700, 0.05, 0.15);
      }, t * 1000);
    });
  }

  playAwesomeBiryaniBoss() {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance("Awesome Biryani Boss!");
      msg.rate = 1.1;
      msg.pitch = 1.2;
      
      // Try to find an Indian English or Hindi voice for flavor
      const voices = window.speechSynthesis.getVoices();
      const desiVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));
      if (desiVoice) {
        msg.voice = desiVoice;
      }
      
      window.speechSynthesis.speak(msg);
    }
    
    // Triumphant chord
    this.playTone(440, 'sine', 1.5, 0.2); // A4
    this.playTone(554.37, 'sine', 1.5, 0.2); // C#5
    this.playTone(659.25, 'sine', 1.5, 0.2); // E5
  }

  startBGM() {
    if (!this.ctx) return;
    if (this.bgmInterval) clearInterval(this.bgmInterval);

    let step = 0;
    // Fun, upbeat desi-style rhythm loop
    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx) return;
      const s = step % 8;
      
      // Bass drum (Dholak low)
      if (s === 0 || s === 3 || s === 6) {
        this.playTone(110, 'sine', 0.2, 0.3);
      }
      // Snare/Clap (Dholak high)
      if (s === 2 || s === 6) {
        this.playTone(350, 'triangle', 0.1, 0.1);
        this.playTone(500, 'square', 0.05, 0.05); 
      }
      // Hi-hat (Ghungroo/shaker feel)
      this.playTone(900, 'square', 0.02, 0.03);
      
      step++;
    }, 200); // 150 BPM
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  private startBgHum() {
    if (!this.ctx) return;
    this.bgOsc = this.ctx.createOscillator();
    this.bgGain = this.ctx.createGain();
    
    this.bgOsc.type = 'sine';
    this.bgOsc.frequency.value = 50; 
    
    this.bgGain.gain.value = 0.01; 
    
    this.bgOsc.connect(this.bgGain);
    this.bgGain.connect(this.ctx.destination);
    
    this.bgOsc.start();
  }

  stopBgHum() {
    if (this.bgOsc) {
      this.bgOsc.stop();
      this.bgOsc.disconnect();
      this.bgOsc = null;
    }
  }
}

export const audio = new AudioService();
