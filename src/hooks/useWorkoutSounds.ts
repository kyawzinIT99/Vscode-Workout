/**
 * useWorkoutSounds Hook
 * Distinct sound effects for different workout events
 *
 * Events:
 *   countdown     – soft beep each second during pre-workout countdown
 *   workoutStart  – strong beep when workout begins
 *   lastThree     – fast beeps for last 3 seconds of exercise/rest
 *   restStart     – calm tone when rest period begins
 *   nextSet       – strong beep when next set starts
 *   finish        – success chime when entire workout completes
 */

import { useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

// ---------------------------------------------------------------------------
// WAV generator — sine wave with fade in/out
// ---------------------------------------------------------------------------

function generateWavBase64(
  frequency: number,
  durationMs: number,
  volume = 0.8,
  sampleRate = 22050,
): string {
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * blockAlign;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const fadeLength = Math.min(numSamples * 0.1, 500);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let amplitude = Math.sin(2 * Math.PI * frequency * t);

    if (i < fadeLength) amplitude *= i / fadeLength;
    if (i > numSamples - fadeLength) amplitude *= (numSamples - i) / fadeLength;

    const sample = Math.max(-1, Math.min(1, amplitude * volume));
    view.setInt16(44 + i * 2, sample * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Two-tone chime: plays freq1 then freq2 back-to-back in one WAV */
function generateChimeBase64(
  freq1: number,
  freq2: number,
  durationMs: number,
  volume = 0.8,
  sampleRate = 22050,
): string {
  const halfSamples = Math.floor((sampleRate * durationMs) / 2000);
  const numSamples = halfSamples * 2;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * blockAlign;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const freq = i < halfSamples ? freq1 : freq2;
    const localI = i < halfSamples ? i : i - halfSamples;
    const localLen = halfSamples;
    const t = localI / sampleRate;
    let amplitude = Math.sin(2 * Math.PI * freq * t);

    const fade = Math.min(localLen * 0.1, 300);
    if (localI < fade) amplitude *= localI / fade;
    if (localI > localLen - fade) amplitude *= (localLen - localI) / fade;

    const sample = Math.max(-1, Math.min(1, amplitude * volume));
    view.setInt16(44 + i * 2, sample * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// ---------------------------------------------------------------------------
// Pre-generated WAV data for each sound event
// ---------------------------------------------------------------------------

// Soft beep — 330 Hz, 100 ms, low volume  (countdown tick)
const COUNTDOWN_WAV = generateWavBase64(330, 100, 0.4);

// Strong beep — 660 Hz, 200 ms, full volume (workout start / next set)
const STRONG_BEEP_WAV = generateWavBase64(660, 200, 0.9);

// Fast beep — 550 Hz, 80 ms, medium-high (last 3 seconds warning)
const FAST_BEEP_WAV = generateWavBase64(550, 80, 0.75);

// Calm tone — 396 Hz, 400 ms, moderate volume (rest start)
const CALM_TONE_WAV = generateWavBase64(396, 400, 0.5);

// Success chime — two-tone ascending 523 Hz → 784 Hz, 600 ms (finish)
const SUCCESS_CHIME_WAV = generateChimeBase64(523, 784, 600, 0.85);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseWorkoutSoundsOptions {
  enabled?: boolean;
}

const useWorkoutSounds = (options: UseWorkoutSoundsOptions = {}) => {
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
    async (wavBase64: string, volume = 1.0) => {
      if (!enabled) return;
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:audio/wav;base64,${wavBase64}` },
          { shouldPlay: true, volume },
        );
        soundRef.current = sound;
      } catch {
        // Sound is non-critical
      }
    },
    [enabled],
  );

  /** Soft tick for countdown seconds */
  const playCountdown = useCallback(() => playSound(COUNTDOWN_WAV, 0.5), [playSound]);

  /** Strong beep — workout begins */
  const playWorkoutStart = useCallback(() => playSound(STRONG_BEEP_WAV, 1.0), [playSound]);

  /** Fast beep — last 3 seconds warning */
  const playLastThree = useCallback(() => playSound(FAST_BEEP_WAV, 0.85), [playSound]);

  /** Calm tone — rest period starts */
  const playRestStart = useCallback(() => playSound(CALM_TONE_WAV, 0.6), [playSound]);

  /** Strong beep — next set starts */
  const playNextSet = useCallback(() => playSound(STRONG_BEEP_WAV, 1.0), [playSound]);

  /** Two-tone ascending chime — workout finished */
  const playFinish = useCallback(() => playSound(SUCCESS_CHIME_WAV, 1.0), [playSound]);

  return {
    playCountdown,
    playWorkoutStart,
    playLastThree,
    playRestStart,
    playNextSet,
    playFinish,
  };
};

export default useWorkoutSounds;
