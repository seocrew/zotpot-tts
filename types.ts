
export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export const VoiceDisplayNames: Record<VoiceName, string> = {
  [VoiceName.Kore]: 'Nusrat',
  [VoiceName.Puck]: 'Mehedi',
  [VoiceName.Charon]: 'Mamun',
  [VoiceName.Fenrir]: 'Hasan',
  [VoiceName.Zephyr]: 'Ayesha',
};

export type TTSMode = 'normal' | 'story' | 'poem' | 'ad' | 'vlog' | 'social';

export interface GeneratedAudio {
  id: string;
  text: string;
  voice: VoiceName;
  timestamp: number;
  audioBuffer: AudioBuffer | null;
  error?: string;
  mode?: TTSMode;
}

export interface TTSRequestConfig {
  text: string;
  voice: VoiceName;
}

export type UserRole = 'admin' | 'user';

export interface User {
  username: string;
  role: UserRole;
  password?: string; // Only used for auth checks, not typically exposed in UI
}
