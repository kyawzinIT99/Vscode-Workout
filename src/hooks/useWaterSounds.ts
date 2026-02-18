/**
 * useWaterSounds Hook
 * Sound effects for the hydration tracker
 *
 * Events:
 *   drop      – quick water-drop "blip" when adding intake
 *   goalHit   – ascending celebration when daily goal is reached
 */

import { useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

// ---------------------------------------------------------------------------
// WAV generators
// ---------------------------------------------------------------------------

function generateWavBase64(
  frequency: number,
  durationMs: number,
  volume = 0.8,
  sampleRate = 22050,
): string {
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const dataSize = numSamples * 2;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeStr(view, 0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeStr(view, 8, 'WAVE');
  writeStr(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const fade = Math.min(numSamples * 0.15, 400);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let amp = Math.sin(2 * Math.PI * frequency * t);
    if (i < fade) amp *= i / fade;
    if (i > numSamples - fade) amp *= (numSamples - i) / fade;
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, amp * volume)) * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

/** Descending pitch "drip" — starts high, sweeps down (water drop effect) */
function generateDropWav(volume = 0.7, sampleRate = 22050): string {
  const durationMs = 120;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const dataSize = numSamples * 2;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeStr(view, 0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeStr(view, 8, 'WAVE');
  writeStr(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const progress = i / numSamples;
    const t = i / sampleRate;
    // Sweep from 1800 Hz down to 400 Hz (water drip effect)
    const freq = 1800 - progress * 1400;
    let amp = Math.sin(2 * Math.PI * freq * t);
    // Exponential decay envelope
    amp *= Math.exp(-progress * 5);
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, amp * volume)) * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

/** Three-note ascending chime for goal reached */
function generateGoalChimeWav(volume = 0.8, sampleRate = 22050): string {
  const noteMs = 150;
  const notes = [523, 659, 784]; // C5, E5, G5 — major triad ascending
  const totalSamples = Math.floor((sampleRate * noteMs * notes.length) / 1000);
  const dataSize = totalSamples * 2;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeStr(view, 0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeStr(view, 8, 'WAVE');
  writeStr(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const samplesPerNote = Math.floor((sampleRate * noteMs) / 1000);
  for (let i = 0; i < totalSamples; i++) {
    const noteIndex = Math.min(Math.floor(i / samplesPerNote), notes.length - 1);
    const localI = i - noteIndex * samplesPerNote;
    const freq = notes[noteIndex];
    const t = localI / sampleRate;
    let amp = Math.sin(2 * Math.PI * freq * t);
    // Fade in/out per note
    const fade = Math.min(samplesPerNote * 0.1, 200);
    if (localI < fade) amp *= localI / fade;
    if (localI > samplesPerNote - fade) amp *= (samplesPerNote - localI) / fade;
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, amp * volume)) * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function writeStr(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

// ---------------------------------------------------------------------------
// Pre-generated WAV data
// ---------------------------------------------------------------------------

const DROP_WAV = generateDropWav(0.75);
const GOAL_CHIME_WAV = generateGoalChimeWav(0.85);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseWaterSoundsOptions {
  enabled?: boolean;
}

const useWaterSounds = (options: UseWaterSoundsOptions = {}) => {
  const { enabled = true } = options;
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch(() => {});

    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const playSound = useCallback(
    async (wavBase64: string, vol = 1.0) => {
      if (!enabled) return;
      try {
        if (soundRef.current) await soundRef.current.unloadAsync();
        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:audio/wav;base64,${wavBase64}` },
          { shouldPlay: true, volume: vol },
        );
        soundRef.current = sound;
      } catch {
        // Non-critical
      }
    },
    [enabled],
  );

  /** Water drop "blip" when adding intake */
  const playDrop = useCallback(() => playSound(DROP_WAV, 0.8), [playSound]);

  /** Ascending C-E-G chime when daily goal is reached */
  const playGoalReached = useCallback(() => playSound(GOAL_CHIME_WAV, 1.0), [playSound]);

  return { playDrop, playGoalReached };
};

export default useWaterSounds;
