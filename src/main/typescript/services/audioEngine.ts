import * as Tone from 'tone';
import { AudioEngine, Synthesizer, ScheduledNote } from '@/types/audio';
import { Note, Track, SynthType, ExportOptions } from '@/types/music';

class ToneSynthesizer implements Synthesizer {
  private synth: Tone.Synth | Tone.PolySynth;
  private gainNode: Tone.Gain;
  private pannerNode: Tone.Panner;

  constructor(
    public id: string,
    public type: SynthType
  ) {
    this.synth = this.createSynthesizer(type);
    this.gainNode = new Tone.Gain(0.7);
    this.pannerNode = new Tone.Panner(0);
    
    this.synth.connect(this.gainNode);
    this.gainNode.connect(this.pannerNode);
    this.pannerNode.connect(Tone.getDestination());
  }

  private createSynthesizer(type: SynthType): Tone.Synth | Tone.PolySynth {
    switch (type) {
      case 'sine':
        return new Tone.Synth({ oscillator: { type: 'sine' } });
      case 'square':
        return new Tone.Synth({ oscillator: { type: 'square' } });
      case 'sawtooth':
        return new Tone.Synth({ oscillator: { type: 'sawtooth' } });
      case 'triangle':
        return new Tone.Synth({ oscillator: { type: 'triangle' } });
      case 'piano':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
        });
      case 'guitar':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0.5, release: 0.8 }
        });
      case 'strings':
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.5, decay: 0.2, sustain: 0.8, release: 1.5 }
        });
      default:
        return new Tone.Synth();
    }
  }

  private midiToFrequency(midiNote: number): number {
    return Math.pow(2, (midiNote - 69) / 12) * 440;
  }

  play(note: Note): void {
    const frequency = this.midiToFrequency(note.pitch);
    const velocity = note.velocity / 127;
    this.synth.triggerAttack(frequency, undefined, velocity);
  }

  stop(noteId: string): void {
    // Use noteId for future reference if needed
    this.synth.triggerRelease('+0.1');
  }

  setVolume(volume: number): void {
    this.gainNode.gain.rampTo(volume, 0.1);
  }

  setPan(pan: number): void {
    this.pannerNode.pan.rampTo(pan, 0.1);
  }

  dispose(): void {
    this.synth.dispose();
    this.gainNode.dispose();
    this.pannerNode.dispose();
  }
}

export class WebAudioEngine implements AudioEngine {
  private synthesizers = new Map<string, Synthesizer>();
  private scheduledNotes = new Map<string, ScheduledNote>();
  private transport: typeof Tone.Transport;
  private isInitialized = false;

  constructor() {
    this.transport = Tone.Transport;
  }

  async start(): Promise<void> {
    if (!this.isInitialized) {
      await Tone.start();
      this.transport.start();
      this.isInitialized = true;
    }
  }

  stop(): void {
    this.transport.stop();
    this.transport.cancel();
    this.scheduledNotes.clear();
  }

  async createSynthesizer(type: SynthType, trackId?: string): Promise<Synthesizer> {
    if (!this.isInitialized) {
      await this.start();
    }

    const id = trackId || `synth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // If synthesizer already exists for this track, return it
    if (trackId && this.synthesizers.has(trackId)) {
      return this.synthesizers.get(trackId)!;
    }
    
    const synthesizer = new ToneSynthesizer(id, type);
    this.synthesizers.set(id, synthesizer);
    return synthesizer;
  }

  playNote(note: Note, duration: number, startTime?: number): void {
    const synthesizer = this.synthesizers.get(note.trackId);
    if (!synthesizer) {
      console.warn(`No synthesizer found for track ${note.trackId}`);
      return;
    }

    const scheduledNote: ScheduledNote = {
      noteId: note.id,
      note,
      scheduledTime: startTime ? Tone.now() + startTime : Tone.now(),
      synthesizer
    };

    this.scheduledNotes.set(note.id, scheduledNote);

    if (startTime && startTime > 0) {
      // Schedule note to play at the specified time
      this.transport.scheduleOnce(() => {
        synthesizer.play(note);
      }, `+${startTime}`);

      // Schedule note off
      this.transport.scheduleOnce(() => {
        synthesizer.stop(note.id);
        this.scheduledNotes.delete(note.id);
      }, `+${startTime + duration}`);
    } else {
      // Play immediately
      synthesizer.play(note);

      // Schedule note off
      this.transport.scheduleOnce(() => {
        synthesizer.stop(note.id);
        this.scheduledNotes.delete(note.id);
      }, `+${duration}`);
    }
  }

  stopNote(noteId: string): void {
    const scheduledNote = this.scheduledNotes.get(noteId);
    if (scheduledNote) {
      scheduledNote.synthesizer.stop(noteId);
      this.scheduledNotes.delete(noteId);
    }
  }

  setTempo(bpm: number): void {
    this.transport.bpm.rampTo(bpm, 0.5);
  }

  getCurrentTime(): number {
    return this.transport.seconds;
  }

  isPlaying(): boolean {
    return this.transport.state === 'started';
  }

  async exportAudio(tracks: Track[], options: ExportOptions): Promise<ArrayBuffer> {
    // Create offline context for rendering
    const duration = this.calculateProjectDuration(tracks);
    // Use options for future implementation
    const _sampleRate = options.format === 'wav' ? options.quality : 44100;
    
    const recorder = new Tone.Recorder();
    const destination = Tone.getDestination();
    destination.connect(recorder);

    // Start recording
    recorder.start();

    // Play all tracks
    for (const track of tracks) {
      if (!track.muted) {
        const synthesizer = await this.createSynthesizer(track.instrument.type);
        synthesizer.setVolume(track.volume);
        synthesizer.setPan(track.pan);

        for (const note of track.notes) {
          this.transport.scheduleOnce(() => {
            synthesizer.play(note);
          }, note.startTime);

          this.transport.scheduleOnce(() => {
            synthesizer.stop(note.id);
          }, note.startTime + note.duration);
        }
      }
    }

    // Wait for playback to complete
    return new Promise((resolve) => {
      setTimeout(async () => {
        const recording = await recorder.stop();
        const arrayBuffer = await recording.arrayBuffer();
        resolve(arrayBuffer);
      }, duration * 1000 + 1000); // Add 1 second buffer
    });
  }

  private calculateProjectDuration(tracks: Track[]): number {
    let maxDuration = 0;
    for (const track of tracks) {
      for (const note of track.notes) {
        const noteEnd = note.startTime + note.duration;
        if (noteEnd > maxDuration) {
          maxDuration = noteEnd;
        }
      }
    }
    return maxDuration;
  }

  dispose(): void {
    this.stop();
    for (const synthesizer of this.synthesizers.values()) {
      synthesizer.dispose();
    }
    this.synthesizers.clear();
  }
}

export const audioEngine = new WebAudioEngine();