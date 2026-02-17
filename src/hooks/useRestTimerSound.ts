/**
 * useRestTimerSound Hook
 * Generates beep sounds for rest timer countdown using expo-av
 */

import { useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

// Generate a WAV file as a base64 data URI
// This creates a simple sine wave tone without needing bundled audio files
function generateWavBase64(frequency: number, durationMs: number, sampleRate = 22050): string {
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
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true);  // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Generate sine wave with fade in/out to avoid clicks
  const fadeLength = Math.min(numSamples * 0.1, 500);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let amplitude = Math.sin(2 * Math.PI * frequency * t);

    // Fade in
    if (i < fadeLength) {
      amplitude *= i / fadeLength;
    }
    // Fade out
    if (i > numSamples - fadeLength) {
      amplitude *= (numSamples - i) / fadeLength;
    }

    const sample = Math.max(-1, Math.min(1, amplitude * 0.8));
    view.setInt16(44 + i * 2, sample * 0x7fff, true);
  }

  // Convert to base64
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

// Pre-generate WAV data
const BEEP_WAV = generateWavBase64(440, 150);    // Short 440Hz beep for 3-2-1
const COMPLETE_WAV = generateWavBase64(880, 500); // Longer 880Hz tone for completion

interface UseRestTimerSoundOptions {
  enabled?: boolean;
}

const useRestTimerSound = (options: UseRestTimerSoundOptions = {}) => {
  const { enabled = true } = options;
  const beepSoundRef = useRef<Audio.Sound | null>(null);
  const completeSoundRef = useRef<Audio.Sound | null>(null);

  // Configure audio mode on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch(() => {});

    return () => {
      beepSoundRef.current?.unloadAsync().catch(() => {});
      completeSoundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const playBeep = useCallback(async () => {
    if (!enabled) return;
    try {
      // Unload previous if exists
      if (beepSoundRef.current) {
        await beepSoundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,${BEEP_WAV}` },
        { shouldPlay: true, volume: 0.8 }
      );
      beepSoundRef.current = sound;
    } catch (error) {
      // Silently fail — sound is not critical
    }
  }, [enabled]);

  const playComplete = useCallback(async () => {
    if (!enabled) return;
    try {
      if (completeSoundRef.current) {
        await completeSoundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,${COMPLETE_WAV}` },
        { shouldPlay: true, volume: 1.0 }
      );
      completeSoundRef.current = sound;
    } catch (error) {
      // Silently fail
    }
  }, [enabled]);

  return { playBeep, playComplete };
};

export default useRestTimerSound;
