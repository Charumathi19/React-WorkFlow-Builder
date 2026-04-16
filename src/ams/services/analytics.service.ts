import { apiCaller } from './api-caller';
import type { AnalyticsSummary } from '../types';

export const getAnalytics = () =>
    apiCaller.get<AnalyticsSummary>('/api/v1/analytics/summary').then((r) => r.data);
