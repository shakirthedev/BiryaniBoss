class AudioService {
  private ctx: AudioContext | null = null;
  private bgOsc: OscillatorNode | null = null;
  private bgGain: GainNode | null = null;
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      this.startBgHum();
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
