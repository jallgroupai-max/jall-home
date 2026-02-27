import { apiService } from './api';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  labels?: {
    accent?: string;
    description?: string;
    age?: string;
    gender?: string;
    use_case?: string;
  };
  preview_url?: string;
}

export interface ElevenLabsModel {
  model_id: string;
  name: string;
  description?: string;
  can_do_text_to_speech: boolean;
  languages?: { language_id: string; name: string }[];
}

export interface VoiceHistoryRecord {
  id: string;
  userId: string;
  text: string;
  voiceId: string;
  voiceName: string;
  modelId: string;
  stability: number;
  similarityBoost: number;
  status: 'pending' | 'completed' | 'failed';
  audioPath?: string;
  createdAt: string;
}

export interface GenerateSpeechPayload {
  text: string;
  voiceId: string;
  voiceName: string;
  modelId: string;
  stability: number;
  similarityBoost: number;
}

export interface HistoryResponse {
  data: VoiceHistoryRecord[];
  total: number;
  page: number;
  limit: number;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const elevenLabsService = {
  async getVoices(token: string): Promise<ElevenLabsVoice[]> {
    const res = await apiService.get<{ data: ElevenLabsVoice[] }>(
      '/elevenlabs/voices',
      token,
    );
    return res.data;
  },

  async getModels(token: string): Promise<ElevenLabsModel[]> {
    const res = await apiService.get<{ data: ElevenLabsModel[] }>(
      '/elevenlabs/models',
      token,
    );
    return res.data;
  },

  async generateSpeech(
    token: string,
    payload: GenerateSpeechPayload,
  ): Promise<VoiceHistoryRecord> {
    const res = await apiService.post<{ data: VoiceHistoryRecord }>(
      '/elevenlabs/generate',
      payload,
      token,
    );
    return res.data;
  },

  async getHistory(
    token: string,
    page = 1,
    limit = 10,
  ): Promise<HistoryResponse> {
    return apiService.get<HistoryResponse>(
      `/elevenlabs/history?page=${page}&limit=${limit}`,
      token,
    );
  },

  getAudioUrl(id: string): string {
    return `${BASE_URL}/elevenlabs/history/${id}/audio`;
  },

  getAudioUrlWithToken(id: string, token: string): string {
    return `${BASE_URL}/elevenlabs/history/${id}/audio?token=${encodeURIComponent(token)}`;
  },
};
