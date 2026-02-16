
import { apiService } from "./api";

export enum FeedbackType {
  SUGGESTION = 'suggestion',
  BUG = 'bug',
  OTHER = 'other'
}

export enum FeedbackCategory {
  TOOL = 'tool',
  DASHBOARD = 'dashboard',
  PAYMENT = 'payment',
  OTHER = 'other'
}

export interface CreateFeedbackDto {
  type: FeedbackType;
  category: FeedbackCategory;
  message: string;
  rating?: number;
}

export const feedbackService = {
  create: async (data: CreateFeedbackDto, token: string) => {
    return await apiService.post('/feedbacks', data, token);
  },
};
