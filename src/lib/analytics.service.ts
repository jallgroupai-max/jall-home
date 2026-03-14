import { apiService } from './api';

type TrackHomeLoginClickPayload = {
  email?: string;
  route?: string;
  source?: string;
};

export const analyticsService = {
  async trackHomeLoginClick(payload: TrackHomeLoginClickPayload) {
    return apiService.post<{ ok: boolean }>('/dashboard/events/home-login-click', payload);
  },
};
